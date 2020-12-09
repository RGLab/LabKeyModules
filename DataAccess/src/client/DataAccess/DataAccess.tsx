import React from 'react';
import {Loader} from './components/Loader'

// Styling imports
import './DataAccess.scss';

interface QueryInfo {
    schema: string;
    query: string;
    label: string
}

const datasets: QueryInfo[] = [
    {schema: "study", query: "ELISA", label: "Enzyme-linked immunosorbent assay (ELISA)"},
    {schema: "study", query:"ELISPOT", label: "Enzyme-linked immunspot (ELISPOT)"},
    {schema: "study", query: "HAI", label: "Hemagglutination inhibition (HAI)"},
    {schema: "study", query: "hla_typing", label: "Human leukocyte antigen (HLA) typing"},
    {schema: "study", query:"kir_typing", label: "Killer cell immunoglobulin-like receptors (KIR) typing"},
    {schema: "study", query:"mbaa", label: "Multiplex bead array assay (MBAA)"},
    {schema: "study", query:"neut_ab_titer", label: "Neutralizing antibody titer"},
    {schema: "study", query:"pcr", label: "Polymerase chain reaction"}
]; 

const analyzedResults = [
    {schema: "study", query: "fcs_analyzed_result", label: "Flow cytometry analyzed results"},
    {schema: "gene_expression", query: "DGEA_filteredGEAR", label: "Differential gene expression analysis results"}
]; 

const demographicsQuery = {schema: "study", query: "demographics", label: "Demographics"}


export const DataAccess: React.FC = () => {
    const [selectedQuery, setSelectedQuery] = React.useState<QueryInfo>({schema: "study", query: "demographics", label: "Demographics"})
    const [webpartReady, setWebpartReady] = React.useState<Boolean>(false)
    // const queryConfig: QueryConfig = { schemaQuery: SchemaQuery.create(selectedQuery.schema, selectedQuery.query) }
    
    const dropdownConfig = {
        text: "Choose Dataset",
        items: [
            {
                text: "Demographics",
                handler: () => setSelectedQuery(demographicsQuery)
            },
            {
                text: "Assays",
                items: datasets.map((queryInfo) => ({
                    text: queryInfo.label,
                    handler: () => setSelectedQuery(queryInfo)
                })
                )
            },
            {
                text: "Analyzed Results",
                items: analyzedResults.map((queryInfo) => ({
                    text: queryInfo.label,
                    handler: () => setSelectedQuery(queryInfo)
                })
                )
            }

        ]
    }
    

    React.useEffect(() => {
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
    }, [selectedQuery])

    // Must return a React Fragment
    return <>
    <div className="data-access-top">
        {/* <AssayDropdown setSelectedQuery={setSelectedQuery}></AssayDropdown> */}
        <span className="data-access-title">{selectedQuery.label}</span>
    </div>
    {!webpartReady && <Loader/>}
    <div id="data-access-grid"></div>
    </>
}
