import * as React from 'react';
import { drawScatterPlot } from './d3/similarStudyScatterPlot.d3'

// Create Typing for scatter plot data
export interface ScatterPlotDatum {
    assays: {
        elisa: number,
        elispot: number,
        hai: number,
        neutralizingAntibodyTiter: number,
        geneExpression: number,
        flowCytometry: number,
        pcr: number,
        mbaa: number
    },
    studyDesign: {
        author: string, // not doing
        sponsor: string, // cat
        maximumAge: number, // ord
        minimumAge: number, // ord
        numberOfParticipants: number, // ord
        clinicalTrial: string, // cat
        initialDataReleaseDate: Date // not doing
    },
    condition: {
        dengue: number,
        dermatomyositis: number,
        ebola: number,
        healthy: number,
        hepatitis: number,
        hiv: number,
        influenza: number,
        malaria: number,
        meningitis: number,
        smallpox: number,
        tuberculosis: number,
        unknown: number,
        varicellaZoster: number,
        westNile: number,
        yellowFever: number,
        zika: number,
        cmv: number
    }
    x: number,
    y: number,
    study: string
}

export interface ScatterPlotDataRange {
    x: number[], 
    y: number[]
}

export interface ScatterPlotProps {
    data: ScatterPlotDatum[],
    name: string,
    width: number,
    height: number,
    dataRange: ScatterPlotDataRange,
    linkBaseText: string,
    colorIndex: number,
    categoricalVar: boolean,
    dataType: string
}

// render the d3 barplot element
export const ScatterPlot: React.FC<ScatterPlotProps> = (props) => {
    // This will look for the id given by props.name to svg-element
    React.useEffect(() => {
            drawScatterPlot(props);
    });

    return (
        <div id={props.name} >
            <svg id={"scatterplot-" + props.name}></svg>
        </div>
    );
}