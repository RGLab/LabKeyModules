import * as d3 from 'd3';

import { ScatterPlotProps } from '../similarStudyScatterPlot';

export function drawScatterPlot(props: ScatterPlotProps) {
    
    // props
    const data = props.data;
    const titles = props.titles;
    const name = props.name;
    const dataRange = props.dataRange;
    // const linkBaseText = props.linkBaseText;

    // select div
    const svg = d3
        .select("#scatterplot-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "scatterplot-" + name); // why give it same id??

    // set margins
    const margin = {
                top: 50, 
                right: 30, 
                bottom: 30, 
                left: 130
        },
        width  = props.width - margin.left - margin.right,
        height = props.height - margin.top  - margin.bottom;

    // Set scales using arguments
    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange.x)
        .range([0, width]);

    const yaxisScale = d3
        .scaleLinear()
        .domain(dataRange.y)
        .range([height, 0])

    // Create body and axes - read more about d3.Selection
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "scatterplot" + name);
    
    // x-axis
    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(d3.axisTop(xaxisScale));

    // x-axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
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
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", - (props.height / 3))
        .text(titles.y);

    // add clickable-links
    // svg.selectAll("text")
    //     .filter(function(d){ return typeof(d) == "string"})
    //     .style("cursor","pointer")
    //     .on("mouseover", function(d, i){
    //         d3.select(this)
    //             .style("color","green")
    //             .style("font-weight", "bold")
    //     })
    //     .on("mouseout", function(d, i){
    //         d3.select(this)
    //             .style("color","black")
    //             .style("font-weight", "normal")
    //     })
    //     .on("click", function(d){ 
    //         document.location.href = linkBaseText + (d as String).split(': ')[1]
    //     })
    
    // var tooltip = d3.select('#' + name)
    //     .append("div")
    //     .attr("class", "tooltip")
    //     .style("opacity", 0)
    //     .style("background-color", "white")
    //     .style("border", "solid")
    //     .style("border-width", "2px")
    //     .style("border-radius", "5px")
    //     .style("padding", "5px")

    // add values
    svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d){ return d.x })
      .attr("cy", function(d){ return d.y })
      .style("fill", function(d) { return d.label }) 



            // .on("mouseover", function(d){
            //     tooltip
            //         .transition()
            //         .duration(50)
            //         .style("opacity", .9);		
            //     tooltip.html(
            //             "<b>Publication Info</b>: <br>" + 
            //             d.hoverOverText
            //         )	
            //         .style("left", (d3.event.pageX) + "px")		
            //         .style("top", (d3.event.pageY - 28) + "px");	
            //     })		
            // .on("mouseout", function(d){
            //     tooltip
            //         .transition()
            //         .duration(100)
            //         .style("opacity", 0)
            // })

//     // draw legend
//   var legend = svg.selectAll(".legend")
//   .data(color.domain())
// .enter().append("g")
//   .attr("class", "legend")
//   .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// // draw legend colored rectangles
// legend.append("rect")
//   .attr("x", width - 18)
//   .attr("width", 18)
//   .attr("height", 18)
//   .style("fill", color);

// // draw legend text
// legend.append("text")
//   .attr("x", width - 24)
//   .attr("y", 9)
//   .attr("dy", ".35em")
//   .style("text-anchor", "end")
//   .text(function(d) { return d;})
}