import * as React from 'react';
import { drawBarPlot } from './d3/barPlots.d3'

// Create Typing for bar plot data
export interface BarPlotDatum {
        label: string, 
        value: number,
        hoverOverText: string,
        datePublished: string,
        studyNum: number
}

export interface BarPlotTitles {
    x: string, 
    y: string,
    main: string
}

export interface BarPlotProps {
    data: BarPlotDatum[];
    titles: BarPlotTitles;
    name: string;
    width: number;
    height: number;
    dataRange: number[];
    linkBaseText: string
}

// render the d3 barplot element
export const Barplot: React.FC<BarPlotProps> = (props) => {
    // This will look for the id given by props.name to svg-element
    React.useEffect(() => {
            drawBarPlot(props);
    });

    return (
        <div className={props.name} >
            <svg id={"barplot-" + props.name}></svg>
        </div>
    );
}