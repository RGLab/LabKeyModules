import * as d3 from 'd3'
import { TinyHeatmapProps } from '../../../typings/Components';
import { HeatmapDatum } from '../../../typings/CubeData'
import { number } from 'prop-types';

// ================================================================== //

// Types



export function drawTinyHeatmap(props: TinyHeatmapProps) {
    const data = props.data;
    const name = props.name;
    const timepoints = [
        "<0", "0", "1", "2", "3", "4", "5", "6", "7",
        "8", "9", "10", "11", "12", "13", "14", "15-27",
        "28", "29-55", "56", ">56"];
    const assays = props.assays;
    const colors = props.colors;
    const colorBreaks = props.colorBreaks;

    // data.map((e, i) => {
    //     if (e.assay !== undefined && assays.indexOf(e.assay) === -1 && e.count > 0) assays.push(e.assay);
    // });
    assays.sort();
    // console.log(props.name);
    // console.log(props.data);
    // console.log(assays);

    const svg = d3
        .select("#tinyheatmap-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "tinyheatmap-" + name);

    // Create margins
    const margin = { top: 5, right: 0, bottom: 25, left: 50 },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;

    // Set scales using options

    var colorScale = d3
        .scaleThreshold<number, string>()
        .domain(colorBreaks)
        .range(colors);

    const xaxisScale = d3
        .scaleBand()
        .domain(timepoints)
        .range([0, width]);

    const yaxisScale = d3
        .scaleBand()
        .domain(assays)
        .range([0, height]);

    // Create body and axes

    let heatmap: d3.Selection<SVGElement, any, HTMLElement, any>;
    let xaxislabels: d3.Selection<SVGElement, any, HTMLElement, any>;
    let yaxislabels: d3.Selection<SVGElement, any, HTMLElement, any>;
    if (svg.selectAll("g").empty()) {
        heatmap = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "tinyheatmap" + name);
        xaxislabels = svg
            .append("g")
            .attr("id", "xaxis-labels-" + name)
            .attr(
                "transform",
                "translate(" + margin.left + ", " + (height + margin.top) + ")"
            );
        // .call(d3.axisBottom(xaxisScale));

        yaxislabels = svg
            .append("g")
            .attr("id", "yaxis-labels-" + name)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yaxisScale));
    } else {
        heatmap = svg.select("#barplot" + name);
        xaxislabels = svg.select("#xaxis-labels-" + name);
        yaxislabels = svg.select("#yaxis-labels-" + name);
    }

    xaxislabels.call(d3.axisBottom(xaxisScale))
        .selectAll("text")
        .attr("y", 5)
        .attr("x", -5)
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("font-size", ".9em");




    // add data
    const boxes = heatmap.selectAll("rect").data(data);
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

    boxes.exit().remove();
}

