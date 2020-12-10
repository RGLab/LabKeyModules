import React from 'react';
import { Query} from '@labkey/api';
import {ButtonData} from './components/Dropdowns'
import {LoadingSpinner} from '@labkey/components'

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

interface DropdownMenuProps {
    title: string,
    buttonData: ButtonData[]
}
const DropdownMenu: React.FC<DropdownMenuProps> = ({title, buttonData}) => {
    return <div className="dropdown dropdown-rollup data-access-dropdown">
        <button className="btn dropdown-toggle" data-toggle="dropdown" type="button" aria-expanded="false">
            <span>{title}</span>
            <span style={{paddingLeft:"5px"}}><i className="fa fa-caret-down"></i></span>
        </button>
        <ul className="dropdown-menu dropdown-menu-right">
            {buttonData ? buttonData.map((bd) => {
                if (bd.label == "-") return <li key={bd.label} className="divider"></li>
                return(<li><a key={bd.label} href={bd.href} onClick={bd.action}>{bd.label}</a></li>)
            }) : <LoadingSpinner/>}
        </ul>
    </div>
}


export const DataAccess: React.FC = () => {
    const [selectedQuery, setSelectedQuery] = React.useState<QueryInfo>({schema: "study", query: "demographics", label: "Demographics"})
    const [webpartReady, setWebpartReady] = React.useState<Boolean>(false)
    const [buttonData, setButtonData] = React.useState<ButtonData[]>(null)

    React.useEffect(() => {
        getQueries().then((data: any) => {
            const rows = data.rows
            const datasets = rows.map(row => ({ schema: "study", query: row.Name, label: row.Label }))
            const bd: ButtonData[] = [
                {
                    label: "Demographics",
                    action: () => setSelectedQuery({ schema: "study", query: "demographics", label: "Demographics" })
                },
                { 
                    label: '-'
                },
                ...datasets.map((queryInfo) => ({
                    label: queryInfo.label,
                    action: () => setSelectedQuery(queryInfo)
                }))
            ]
            setButtonData(bd)
        })
    }, [])
    

    React.useEffect(() => {
            new LABKEY.QueryWebPart({
                renderTo: "data-access-grid",
                title: selectedQuery.label, 
                schemaName: selectedQuery.schema,
                queryName: selectedQuery.query,
                showRstudioButton: true, 
                showSurroundingBorder: false,
                frame: "none",
                success: () => setWebpartReady(true)
            })
    }, [selectedQuery])

    // Must return a React Fragment
    return <>
        <div className={"data-access-top"}>
            {/* <span style={{ display: "inline-block" }}>Choose Dataset:</span> */}
            <div style={{ display: "inline-block" }}>
                <DropdownMenu title={selectedQuery.label} buttonData={buttonData}></DropdownMenu>
            </div>
        </div>

        <span><i>Note: Gene expression and cytometry data is best accessed through <a href="https://rglab.github.io/ImmuneSpaceR/">ImmuneSpaceR</a>.</i></span>
        {!webpartReady && <div><LoadingSpinner/></div>}
        <div id="data-access-grid">
        </div>
    </>
}
