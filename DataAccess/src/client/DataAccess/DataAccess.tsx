import React from 'react';
import {Loader} from './components/Loader'
import { Query} from '@labkey/api';

// Styling imports
import './DataAccess.scss';

interface QueryInfo {
    schema: string;
    query: string;
    label: string
}

const analyzedResults = [
    {schema: "study", query: "fcs_analyzed_result", label: "Flow cytometry analyzed results"},
    {schema: "gene_expression", query: "DGEA_filteredGEAR", label: "Differential gene expression analysis results"}
]; 

const demographicsQuery = {schema: "study", query: "demographics", label: "Demographics"}

const getQueries = () => {
    return new Promise((resolve, reject) => {
        const res = Query.selectRows({
            schemaName: 'study',
            queryName: 'ISC_datasets',
            failure: (error) => {
                reject(error.exception) },
            success: (data) => {
                resolve(data) }
        })
    })
}


export const DataAccess: React.FC = () => {
    const [selectedQuery, setSelectedQuery] = React.useState<QueryInfo>({schema: "study", query: "demographics", label: "Demographics"})
    const [webpartReady, setWebpartReady] = React.useState<Boolean>(false)
    const [dropdownConfig, setDropdownConfig] = React.useState(null)

    React.useEffect(() => {
        getQueries().then((data: any) => {
            const rows = data.rows
            const ds = rows.map(row => ({ schema: "study", query: row.Name, label: row.Label }))
            const dc = {
                text: "Choose Dataset",
                items: [
                    {
                        text: "Demographics",
                        handler: () => setSelectedQuery(demographicsQuery)
                    },
                    '-',
                    ...ds.map((queryInfo) => ({
                        text: queryInfo.label,
                        handler: () => setSelectedQuery(queryInfo)
                    }))
                ]
            }
            setDropdownConfig(dc)
            // initialize QueryWebPart
            new LABKEY.QueryWebPart({
                renderTo: "data-access-grid",
                title: selectedQuery.label, 
                schemaName: selectedQuery.schema,
                queryName: selectedQuery.query,
                showRstudioButton: true, 
                showSurroundingBorder: false,
                frame: "none",
                buttonBar: {
                    includeStandardButtons: true,
                    items:[
                        dc
                        ]},
                success: () => setWebpartReady(true)
            })
        })
    }, [])
    

    React.useEffect(() => {
        if (dropdownConfig != null) {
            new LABKEY.QueryWebPart({
                renderTo: "data-access-grid",
                title: selectedQuery.label, 
                schemaName: selectedQuery.schema,
                queryName: selectedQuery.query,
                showRstudioButton: true, 
                showSurroundingBorder: false,
                frame: "none",
                buttonBar: {
                    includeStandardButtons: true,
                    items:[
                        dropdownConfig
                        ]},
                success: () => setWebpartReady(true)
            })
        }
    }, [selectedQuery])

    // Must return a React Fragment
    return <>
    <div className="data-access-top">
        <span className="data-access-title">{selectedQuery.label}</span>
    </div>
    {!webpartReady && <Loader/>}
    <div id="data-access-grid"></div>
    </>
}
