import React from 'react';
import * as d3 from "d3";
import { TinyHeatmapInfo } from '../../typings/StudyCard'
import { D3TinyHeatmap } from './d3/TinyHeatmap.d3';
// Barplot ---------------------------------------- //
export interface TinyHeatmapProps {
    name: string;
    heatmapInfo: TinyHeatmapInfo
}

export const createTinyHeatmapConsts = () => {
    // Combine with info for tiny heatmap
    // Things that are the same for all heatmaps
    const heatmapWidth = 260
    const heatmapColors = [
        "#FFFFFF",
        "#EDF8E9",
        "#C7E9C0",
        "#A1D99B",
        "#74C476",
        "#41AB5D",
        "#238B45",
        "#005A32"
    ];
    const heatmapBreaks = [
        1, 5, 10, 20, 50, 100
    ]
    const timepoints = [
        "<0", "0", "1", "2", "3", "4", "5", "6", "7",
        "8", "9", "10", "11", "12", "13", "14", "15-27",
        "28", "29-55", "56", ">56"];

    var colorScale = d3
        .scaleThreshold<number, string>()
        .domain(heatmapBreaks)
        .range(heatmapColors);

    const xaxisScale = d3
        .scaleBand()
        .domain(timepoints)
        .range([0, heatmapWidth - 55]);

    return {
        width: heatmapWidth,
        colors: heatmapColors,
        breaks: heatmapBreaks,
        timepoints: timepoints,
        colorScale: colorScale,
        xaxisScale: xaxisScale
    }
}

export const createTinyHeatmapYaxisScale = (assays: string[]) => {
  return d3
    .scaleBand()
    .domain(assays)
    .range([0, 10 * assays.length]);
};

export const TinyHeatmap: React.FC<TinyHeatmapProps> = (props) => {

    React.useEffect(() => {
        if (props.heatmapInfo.data.length > 0 && props.heatmapInfo.assays.length > 0) {
            D3TinyHeatmap.drawTinyHeatmap(props);
        }
    }, []);


    return (
        <div className={"tinyheatmap"} >
            <svg id={"tinyheatmap-" + props.name}></svg>
        </div>
    );


}
