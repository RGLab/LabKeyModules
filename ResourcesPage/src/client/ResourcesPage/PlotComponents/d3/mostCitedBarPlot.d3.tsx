import * as d3 from 'd3';

import { BarPlotProps } from '../mostCitedBarPlot';

// ================================================================== //

export function drawBarPlot(props: BarPlotProps, id?: "") {

    const data = props.data;
    const titles = props.titles;
    const name = props.name;
    const dataRange = props.dataRange;
    const linkBaseText = props.linkBaseText;

    // select div
    const svg = d3
        .select("#" + id)
        .attr("viewBox", `0 0 ${props.width} ${props.height}`)
        .attr("id", id); // why give it same id??

    // ensure old elements are removed before each redraw
    // Otherwise rects will not be redrawn
    svg.selectAll("g > *").remove();
    svg.selectAll("rect").remove();

    // set margins
    const margin = {
                top: 50, 
                right: 100, 
                bottom: 30, 
                left: 130
        },
        width  = props.width - margin.left - margin.right,
        height = props.height - margin.top  - margin.bottom;
    
    const font = {
        size: "16px",
        family: "sans-serif"
    }

    // Set scales using arguments
    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange) // number
        .range([0, width]);

    const yaxisScale = d3
        .scaleBand()
        .domain(data.map(function(d) { return d.label; }))
        .range([height, 0])

    // Create body and axes - read more about d3.Selection
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "barplot" + name);
    
    // x-axis
    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(d3.axisTop(xaxisScale));

    // x-axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("font-family", font.family)
        .attr("font-size", font.size)
        .attr("x", props.width / 2)
        .attr("y", margin.top / 2)
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
        .attr("font-family", font.family)
        .attr("font-size", font.size)
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", - (props.height / 3))
        .text(titles.y);

    // add clickable-links
    svg.selectAll("text")
        .filter(function(d){ return typeof(d) == "string"})
        .style("cursor","pointer")
        .on("mouseover", function(d, i){
            d3.select(this)
                .style("color","green")
                .style("font-weight", "bold")
        })
        .on("mouseout", function(d, i){
            d3.select(this)
                .style("color","black")
                .style("font-weight", "normal")
        })
        .on("click", function(d){ 
            document.location.href = linkBaseText + (d as String).split(': ')[1]
        })
    
    var tooltip = d3.select('#' + name)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    var colorScheme = d3.interpolateGreens

    // add values
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
            .attr("class", "rect")
            .attr("x", margin.left)
            .attr("y", function(d) { 
                return yaxisScale(d.label) + margin.top; 
            })
            .attr("height", yaxisScale.bandwidth())
            .attr("width", function(d) { 
                return xaxisScale(d.value); 
            })
            .attr("fill", function(d) { 
                return colorScheme(d.datePublishedPercent).toString()
            })
            .on("mouseover", function(d){
                tooltip
                    .transition()
                    .duration(50)
                    .style("opacity", .9);		
                tooltip.html(
                        "<b>Publication Info</b>: <br>" + 
                        d.hoverOverText
                    )	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 28) + "px");	
                })		
            .on("mouseout", function(d){
                tooltip
                    .transition()
                    .duration(3000)
                    .style("opacity", 0)
            })      
        

    // Legend
    const minYear = Math.round(d3.min(data, function(d) { return d.datePublishedFloat }))
    const maxYear = Math.round(d3.max(data, function(d) { return d.datePublishedFloat }))
    const years = [minYear, maxYear]
    const legend = {
        barWidth: 20,
        rightMargin: 50,
        height: 150
    }
    
    var legendscale = d3.scaleLinear()
        .domain(years)
        .range([0, legend.height])

    var legendaxis = d3.axisRight(legendscale)
        .tickSize(10)
        .tickValues(years)
        .tickFormat(d3.format("d"))
    
    var defs = svg.append("defs")

    var legendGradient = defs
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    // Multiple needed to show color correctly
    legendGradient.append('stop')
        .attr('offset', '0%')
        .style('stop-color', colorScheme(0).toString())

    legendGradient.append('stop')
        .attr('offset', '25%')
        .style('stop-color',  colorScheme(0.25).toString())

    legendGradient.append('stop')
        .attr('offset', '50%')
        .style('stop-color',  colorScheme(0.5).toString())

    legendGradient.append('stop')
        .attr('offset', '75%')
        .style('stop-color',  colorScheme(0.75).toString())

    legendGradient.append('stop')
        .attr('offset', '100%')
        .style('stop-color',  colorScheme(1).toString())

    svg.append('rect')
        .attr('x', props.width - (legend.rightMargin + legend.barWidth))
        .attr('y', margin.top)
        .attr('width', legend.barWidth)
        .attr('height', legend.height)
        .style('fill', "url(#legendGradient)")

    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (props.width - legend.rightMargin) + "," + margin.top + ")")
        .call(legendaxis);
    
    // Legend Title
    svg.append("text")
        .attr("class", "legend")
        .attr("text-anchor", "middle")
        .attr("font-family", font.family)
        .attr("font-size", font.size)
        .attr("transform", "rotate(90)")
        .attr("y", -(props.width - (legend.rightMargin - 15)))
        .attr("x", (legend.height / 2 + margin.top))
        .text("Date Published");
}