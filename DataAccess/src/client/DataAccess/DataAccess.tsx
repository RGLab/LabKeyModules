import React from 'react';
import { QueryModel, GridPanel, QueryConfig, GridPanelWithModel, SchemaQuery, InjectedQueryModels } from '@labkey/components';
import {Dropdown} from 'react-bootstrap'


// import 'bootstrap/dist/css/bootstrap.min.css';

// Styling imports
import './DataAccess.scss';

interface QueryInfo {
    schema: string;
    query: string;
    label: string
}

interface AssayDropdownProps {
    setSelectedQuery: React.Dispatch<React.SetStateAction<QueryInfo>>
}
 
const AssayDropdown: React.FC<AssayDropdownProps> = ({setSelectedQuery}) => {

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

    return <Dropdown className="assay-dropdown">
        <Dropdown.Toggle id="dropdown-basic">
            Choose a Dataset
        </Dropdown.Toggle>

        <Dropdown.Menu>
            <Dropdown.Header>Assays</Dropdown.Header>  
            {datasets.map((queryInfo) => {
                return <Dropdown.Item onClick={() => setSelectedQuery(queryInfo)}>
                    {queryInfo.label}
                </Dropdown.Item>
            })}
            <Dropdown.Header>Analyzed Results</Dropdown.Header>
            {analyzedResults.map((queryInfo) => {
                return <Dropdown.Item onClick={() => setSelectedQuery(queryInfo)}>
                    {queryInfo.label}
                </Dropdown.Item>
            })}

        </Dropdown.Menu>
    </Dropdown>
}

const DataAccessView: React.FC<InjectedQueryModels> = ({queryModels}) => {
    
    return<></>
}


export const DataAccess: React.FC = () => {
    const [selectedQuery, setSelectedQuery] = React.useState<QueryInfo>({schema: "study", query: "demographics", label: "Demographics"})
    const queryConfig: QueryConfig = { schemaQuery: SchemaQuery.create(selectedQuery.schema, selectedQuery.query) }


    // Must return a React Fragment
    return <>
    <div className="data-access-top">
        <AssayDropdown setSelectedQuery={setSelectedQuery}></AssayDropdown>
        <span className="data-access-title">{selectedQuery.label}</span>
    </div>
    <GridPanelWithModel 
        queryConfig={queryConfig}
        asPanel={false}
        // showOmniBox={false}
        showButtonBar={false}
        allowSelections={false} 
        />
    </>
}
