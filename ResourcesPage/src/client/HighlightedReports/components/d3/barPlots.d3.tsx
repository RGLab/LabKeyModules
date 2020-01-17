// @ts-ignore
import * as d3 from 'd3';

import { BarPlotProps } from '../barPlots';

// ================================================================== //

export function drawBarPlot(props: BarPlotProps) {

    const data = props.data;
    const titles = props.titles;
    const name = props.name;
    const dataRange = props.dataRange;
    const linkBaseText = props.linkBaseText;

    // select div
    const svg = d3
        .select("#barplot-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "barplot-" + name); // why give it same id??

    // set margins
    const margin = {
                top: 30, 
                right: 30, 
                bottom: 70, 
                left: 130
        },
        width  = props.width - margin.left - margin.right,
        height = props.height - margin.top  - margin.bottom;

    // Set scales using arguments
    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange) // number
        .range([0, width]);

    const yaxisScale = d3
        .scaleBand()
        .domain(data.map(function(d) { return d.label; }))
        //.attr("xlink:href", data.map(function(d){ return d.url}))
        .range([height, 0])

    // Create body and axes - read more about d3.Selection
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "barplot" + name);
    
    // x-axis
    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr(
            "transform",
            "translate(" + margin.left + ", " + (height + margin.top) + ")"
        )
        .call(d3.axisBottom(xaxisScale));

    // x-axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", props.width / 2)
        .attr("y", height + margin.top + margin.bottom / 2)
        .text(titles.x);

    // y-axis
    svg.append("g")
        .attr("id", "yaxis-labels")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yaxisScale))

    // y-axis title
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -(props.height/2))
        .text(titles.y);

    // add clickable-links
    svg.selectAll("text")
        .filter(function(d){ return typeof(d) == "string"})
        .style("cursor","pointer")
        .on("click", function(d){ 
            document.location.href = linkBaseText + (d as String).split(': ')[1]
        })
    
    // Tooltip
    var Tooltip = d3
        .select("#barplot-" + name)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
    
    // Have black outline on mouseover
    var mouseover = function(d) {
        Tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        }

    // Show hover over text on mouse move
    var mousemove = function(d) {
        Tooltip
            .html(d.hoverOverText)
            .style("left", (d3.mouse(this)[0]+70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
        }

    // Change opacity on leave to show rect has been visited
    var mouseleave = function(d) {
        Tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
        }

    // add values
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
            .attr("class", "rect")
            .attr("x", margin.left)
            .attr("y", function(d) { return yaxisScale(d.label) + margin.top; })
            .attr("height", yaxisScale.bandwidth())
            .attr("width", function(d) { return xaxisScale(d.value); })
            .attr("fill", "#69b3a2")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}