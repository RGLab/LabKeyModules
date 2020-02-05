import * as d3 from 'd3';

import { MaBarPlotProps, MaLinePlotProps } from '../mostAccessedPlots';
import { area } from 'd3';

// ================================================================== //

export function drawMaBarPlot(props: MaBarPlotProps) {

    const data = props.data
    const labels = props.labels
    const titles = props.titles
    const name = props.name
    const linkBaseText = props.linkBaseText

    // select div
    const svg = d3
        .select("#ma-barplot-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "ma-barplot-" + name); // why give it same id??

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
        .domain([0, d3.max(data, function(d) { return d.total})]).nice() // number
        .range([0, width]);

    const yaxisScale = d3
        .scaleBand()
        .domain(labels.map(function(label) { return label }))
        .range([height, 0])

    // Create body and axes - read more about d3.Selection
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "ma-barplot" + name);
    
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

    // color palette - ['blue', 'orange', ...]
    var colors = d3.schemeCategory10

    // stack the data
    // https://github.com/d3/d3-shape/blob/v1.3.7/README.md#stack
    var stackFn = d3.stack()
        .keys(['UI','ISR'])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)

    const stackedData = stackFn(data)

    svg.append("g")
        .selectAll("g")
        // Enter in the stack data
        .data(stackedData)
        .enter().append("g")
            // Loop 1: each subArray is given attributes prior to any
            // rectangles being drawn for that subArray
            .attr("fill", function(d, i) { return colors[i]; })
            .selectAll("rect")
            .data(function(subArray) { return subArray })
            .enter().append("rect")
                // Loop 2: Go through each subArray to work on individual elements
                .attr("x", function(d) { return xaxisScale(d[0]) + margin.left + 6; })
                .attr("y", function(d, i) { return yaxisScale(labels[i]) + margin.top + 1; })
                .attr("height", function(d) { return yaxisScale.bandwidth(); })
                .attr("width",function(d){ return xaxisScale(d[1] - d[0])} )
        
   
    // // add clickable-links
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

    // add values - grouped bar plot
    // svg.selectAll("rect")
    //     .data(data)
    //     .enter()
    //     .append("rect")
    //         .attr("class", "rect")
    //         .attr("x", margin.left)
    //         .attr("y", function(d) { 
    //             return yaxisScale(d.studyName) + margin.top; 
    //         })
    //         .attr("height", yaxisScale.bandwidth())
    //         .attr("width", function(d) { 
    //             return xaxisScale(d.ISR); 
    //         })
    //         .attr("fill", 'yellow')
    //     .append("rect")
    //         .attr("class", "rect")
    //         .attr("x", function(d){ return xaxisScale(d.ISR) + margin.left})
    //         .attr("y", function(d) { 
    //             return yaxisScale(d.studyName) + margin.top; 
    //         })
    //         .attr("height", yaxisScale.bandwidth())
    //         .attr("width", function(d) { 
    //             return xaxisScale(d.UI); 
    //         })
    //         .attr("fill", 'blue')
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
}

export function drawMaLinePlot(props: MaLinePlotProps) {

    const data = props.data
    const labels = props.labels
    const titles = props.titles
    const name = props.name
    const linkBaseText = props.linkBaseText

    // select div
    const svg = d3
        .select("#ma-lineplot-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "ma-lineplot-" + name); // why give it same id??

    // set margins
    const margin = {
                top: 50, 
                right: 30, 
                bottom: 70, 
                left: 130
        },
        width  = props.width - margin.left - margin.right,
        height = props.height - margin.top  - margin.bottom;

    // const layerNames = ['UI','ISR']
    // Set scales using arguments
    const xaxisScale = d3
        .scaleBand()
        .domain(labels)
        .range([0, width]);

    const yaxisScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.total})]).nice()
        .range([height, 0])

    // Create body and axes - read more about d3.Selection
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "ma-lineplot" + name);
    
    // x-axis
    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr("transform", "translate(" + margin.left + ", " + (height + margin.top) + ")")
        // .attr("transform", "rotate(-45)")
        .call(d3.axisBottom(xaxisScale))
        .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

    // x-axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", props.width / 2)
        .attr("y", props.height - 10)
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
    
    var colors = d3.schemeCategory10

    // stack the data
    // https://github.com/d3/d3-shape/blob/v1.3.7/README.md#stack

    var stackFn = d3.stack()
        .keys(['UI','ISR'])

    const stackedData = stackFn(data)

    // Need to make copy due to typing
    var tmp = []
    stackedData.forEach(function(d){
        tmp.push(d)
    })

    const area = d3.area()
                    .x((d,i) => xaxisScale(labels[i]) + margin.left)
                    .y0(d => yaxisScale(d[0]) + margin.top)
                    .y1(d => yaxisScale(d[1]) + margin.top)

    svg.append("g")
        .selectAll("path")
        .data(tmp)
        .enter()
        .append("path")
            .style("fill", function(d,i){ return colors[i]})
            .attr("d", area)
        // .append("title")
        //     .text(({key}) => key);
}