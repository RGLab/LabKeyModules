import * as React from "react";
import { drawBarPlot } from "./d3/mostCitedBarPlot.d3";
import * as d3 from "d3";

// Create Typing for bar plot data
export interface BarPlotDatum {
    label: string, 
    value: number,
    hoverOverText: string,
    studyNum: number
    datePublishedStr: string,
    datePublishedFloat: number,
    datePublishedPercent: number
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
export const BarPlot = React.memo<BarPlotProps>(( props : BarPlotProps) => {
   
    // DOM below <svg> not managed by react, so clear manually each time
    React.useEffect(() => {
        d3.select("#mc-barplot-" + props.name).selectAll("*").remove(); 
        drawBarPlot(props);
    });

    return (
        <div id={props.name} >
            <svg id={"mc-barplot-" + props.name}></svg>
        </div>
    );
})