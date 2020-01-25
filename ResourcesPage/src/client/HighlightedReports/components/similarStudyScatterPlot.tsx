import * as React from 'react';
import { drawScatterPlot } from './d3/similarStudyScatterPlot.d3'

// Create Typing for scatter plot data
export interface ScatterPlotDatum {
    elisa: number,
    elispot: number,
    hai: number,
    nab: number,
    ge: number,
    cyto: number,
    author: string,
    sponsor: string,
    maxAge: number,
    minAge: number,
    condition: string,
    x: number,
    y: number,
    hoverOverText: string,
}

export interface ScatterPlotDataRange {
    x: number[], 
    y: number[]
}

export interface ScatterPlotProps {
    data: ScatterPlotDatum[];
    name: string;
    width: number;
    height: number;
    dataRange: ScatterPlotDataRange;
    linkBaseText: string
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