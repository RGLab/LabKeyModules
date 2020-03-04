import * as d3 from 'd3'
import { TinyHeatmapProps } from '../TinyHeatmap';
import { HeatmapDatum } from '../../../typings/CubeData'

// ================================================================== //

// Types



export const drawTinyHeatmap = (props: TinyHeatmapProps) => {
    const heatmapInfo = props.heatmapInfo;
    const name = props.name;
    

    const svg = d3
        .select("#tinyheatmap-" + name)
        .attr("height", heatmapInfo.height)
        .attr("width", heatmapInfo.width)
        .attr("id", "tinyheatmap-" + name);

    // Create margins
    const margin = { top: 5, right: 0, bottom: 30, left: 50 },
        width = heatmapInfo.width - margin.left - margin.right,
        height = heatmapInfo.height - margin.top - margin.bottom;

    // Set scales using options
    const yaxisScale = heatmapInfo.yaxisScale
    const xaxisScale = heatmapInfo.xaxisScale
    const colorScale = heatmapInfo.colorScale


    // Create body and axes

    const heatmap = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "tinyheatmap" + name);
    const xaxislabels = svg
        .append("g")
        .attr("id", "xaxis-labels-" + name)
        .attr(
            "transform",
            "translate(" + margin.left + ", " + (height + margin.top) + ")"
        );
    // .call(d3.axisBottom(xaxisScale));

    const yaxislabels = svg
        .append("g")
        .attr("id", "yaxis-labels-" + name)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yaxisScale));

    xaxislabels.call(d3.axisBottom(xaxisScale))
        .selectAll("text")
        .attr("y", 5)
        .attr("x", -5)
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("font-size", ".9em");

    // add data
    const boxes = heatmap.selectAll("rect").data(heatmapInfo.data);
    boxes
        .enter()
        .append("rect")
        .attr("x", (d: HeatmapDatum<any>) => {
            return xaxisScale(d.x);
        })
        .attr("width", xaxisScale.bandwidth() - 1)
        .attr("y", function (d: HeatmapDatum<any>) {
            return yaxisScale(d.y);
        })
        .attr("height", yaxisScale.bandwidth() - 1)
        .style("fill", function (d: HeatmapDatum<any>) {
            if (d.participantCount === 0 || d.y === undefined) return "transparent";
            return colorScale(d.participantCount);
        })
        .attr("stroke-width", "1px")
        .attr("stroke", "transparent");
}

