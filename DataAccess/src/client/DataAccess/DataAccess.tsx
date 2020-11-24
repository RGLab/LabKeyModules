import React from 'react';
import { QueryModel, GridPanel, QueryConfig, GridPanelWithModel, SchemaQuery } from '@labkey/components';
import {ButtonData, DropdownButtons, SimpleDropdown} from './components/Dropdowns'

// Styling imports
import './DataAccess.scss';

interface QueryInfo {
    schema: string;
    query: string;
    label: string
}

export const DataAccess: React.FC = () => {
    const [selectedQuery, setSelectedQuery] = React.useState<QueryInfo>({schema: "study", query: "demographics", label: "Demographics"})

    const datasets: QueryInfo[] = [
        {schema: "study", query: "ELISA", label: "Enzyme-linked immunosorbent assay (ELISA)"},
        {schema: "study", query:"ELISPOT", label: "Enzyme-linked immunspot (ELISPOT)"},
        {schema: "study", query: "HAI", label: "Hemagglutination inhibition (HAI)"},
        {schema: "study", query: "hla_typing", label: "Human leukocyte antigen (HLA) typing"},
        {schema: "study", query:"kir_typing", label: "Killer cell immunoglobulin-like receptors (KIR) typing"},
        {schema: "study", query:"mbaa", label: "Multiplex bead array assay (MBAA)"},
        {schema: "study", query:"neut_ab_titer", label: "Neutralizing antibody titer"},
        {schema: "study", query:"pcr", label: "Polymerase chain reaction"}
    ]
    const analyzedResults = [
        {schema: "study", query: "fcs_analyzed_result", label: "Flow cytometry analyzed results"},
        {schema: "gene_expression", query: "DGEA_filteredGEAR", label: "Differential gene expression analysis results"}
    ]

    // const selectQueryButtonData: ButtonData[] = [
    //     {
    //         label: "Assays", 
    //         buttonData: datasets.map((queryInfo) => ({
    //             label: queryInfo.label,
    //             action: () => setSelectedQuery(queryInfo)
    //         }))
    //     },
    //     {
    //         label: "Analyzed Results", 
    //         buttonData: analyzedResults.map((queryInfo) => ({
    //             label: queryInfo.label,
    //             action: () => setSelectedQuery(queryInfo)
    //         }))
    //     }
    // ]
    const selectQueryButtonData: ButtonData[] = datasets.map((queryInfo) => ({
                label: queryInfo.label,
                action: () => setSelectedQuery(queryInfo)
            }))

    const queryConfig: QueryConfig = { schemaQuery: SchemaQuery.create(selectedQuery.schema, selectedQuery.query) }


    // Must return a React Fragment
    return <>
    <h2>{selectedQuery.label}</h2>
    <SimpleDropdown title="Dataset" buttonData={selectQueryButtonData} />
    <GridPanelWithModel 
        queryConfig={queryConfig}
        asPanel={false}
        // showOmniBox={false}
        showButtonBar={false}
        allowSelections={false} 
        />
    </>
}
