import * as d3 from 'd3'
import { PlotDatum } from '../../../typings/CubeData';

// ================================================================== //
/* 
This is a barplot component which takes the following arguments in 
the props: 
  * data
  * name (id for the div to stick it in)
  * width
  * height

*/
// Types

interface D3BarplotConfig {
    width: number;
    height: number;
    labels: string[];
    countMetric: string;
    barColor: string;
}


interface D3Barplot {
    create: (id: string, data: PlotDatum[], config: D3BarplotConfig) => void;
    update: (id: string, data: PlotDatum[], config: D3BarplotConfig) => void;
}


const xaxisTitle = {height: 40}

const createBarplot = (id: string, data: PlotDatum[], config: D3BarplotConfig) => {

    // Create margins
    const barplotHeight = config.height - xaxisTitle.height - 10
    const margin = { top: 0, right: 15, bottom: 0, left: 100 },
    width = config.width - margin.left - margin.right,
    height = barplotHeight - margin.top - margin.bottom;

    // Add svg for bars and separate one for x-axis to allow
    const svg = d3
        .select("#barplot-container-" + id).select("svg")
        .attr("height", barplotHeight)
        .attr("width", config.width)
        .attr("id", "svg-barplot-" + id)

    const xAxisSvg = d3.select("#xaxis-" + id).select("svg")
        .attr("width", config.width)
        .attr("height", xaxisTitle.height)


    // Get long and short versions of y-axis labels
    const labels = config.labels.map(l => {
        let short = l
        const maxLength = Math.round( margin.left / 5.5 )
        if (l.length > maxLength) short = l.slice(0,  maxLength - 3) + "..."
        return ({ label: l, shortlabel: short })
    })
    const yaxisScale = d3
        .scaleBand()
        .domain(labels.map(l => l.label))
        .range([height, 0]);

    // Add container for bars
    const barplot = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "bars-" + id)
        .attr("style", "overflow:auto")

    // Add y-axis short labels
    const yaxisLabels = svg.append("g")
        .attr("id", "yaxis-labels-short-" + id)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    yaxisLabels.selectAll("text")
        .data(labels)
        .enter()
        .append("text")
        .attr("x", -5)
        .attr("y", (d) => {
            return yaxisScale((d.label)) + yaxisScale.bandwidth() / 1.5;
        })
        .attr("text-anchor", "end")
        .attr("font-size", ".8em")
        .text(d => d.shortlabel)

    // Insert vertical grid lines (before bars)
    const xaxisGrid = svg.insert("g", ":first-child")
        .attr("id", "xaxis-grid-" + id)
        .attr(
            "transform",
            `translate(${margin.left}, ${(height + 5 + margin.top)})`
        )

    // x-axis label container (scale changes on update)
    const xaxisLabels = xAxisSvg.append("g")
        .attr("class", "x axis")
        .attr(
            "transform",
            `translate(${margin.left}, 0)`
        )

    // x-axis title
    xAxisSvg.append("g")
        .attr(
            "transform",
            `translate(${margin.left}, 0)`
        )
        .append("text")
        .attr("x", (width) / 2)
        .attr("y", 30)
        .text(config.countMetric == "studyCount" ? "Studies" : "Participants")
        .attr("text-anchor", "middle")
        .attr("font-size", "0.8em")

    // y-axis long labels container (for hover)
    const yaxisLongLabels = svg.append("g")
        .attr("id", "yaxis-labels-" + id)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
}

const updateBarplot = (id: string, data: PlotDatum[], config: D3BarplotConfig) => {
    // Prelims -----------------
    const svg = d3.select("#barplot-container-" + id).select("svg")
    const xAxisSvg = d3.select("#xaxis-" + id).select("svg")
    const barplot = d3.select("#bars-" + id)
    const xaxisGrid = svg.select("#xaxis-grid-" + id)
    const xaxisLabels = xAxisSvg.selectAll(".x.axis")
    // yaxisLongLabels -- a group on top of the othe
    const yaxisLongLabels = svg.select("#yaxis-labels-" + id) 

    

    // Create margins
    const barplotHeight = config.height - xaxisTitle.height - 10
    const margin = { top: 0, right: 15, bottom: 0, left: 100 },
    width = config.width - margin.left - margin.right,
    height = barplotHeight - margin.top - margin.bottom;
    
    const yaxisScale = d3
        .scaleBand()
        .domain(config.labels.map(l => l))
        .range([height, 0]);
    

    // Make the updates ------------
    // Bind data
    // Get range of data for x-axis
    const dataRange = [0, 10];
    const countMetric = config.countMetric
    data.forEach((v) => (v[countMetric] > dataRange[1]) && (dataRange[1] = v[countMetric]))
    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange).nice()
        .range([0, width]);
    const updateXaxis: any = d3.axisBottom(xaxisScale).ticks(3).tickSize(0)
    const updateXaxisGrid: any = d3.axisBottom(xaxisScale).ticks(3).tickSize(-(height + 5)).tickFormat(() => "")

    // Bind the data
    const boxes = barplot.selectAll("rect").data(data);

    const yaxisHoverLabels = yaxisLongLabels
        .selectAll(".yaxis-long-label-container")
        .data(data)

    // ---- enter ----
    // bars on the barplot
    boxes
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("x", xaxisScale(0))
        .attr("width", function (d: PlotDatum) {
            return xaxisScale(d[countMetric]);
        })
        .attr("y", function (d: PlotDatum) {
            return yaxisScale(d.member);
        })
        .attr("height", yaxisScale.bandwidth() - 1)
        .style("fill", config.barColor)
    
    // Labels for hover
    const labelContainers = yaxisHoverLabels
        .enter()
        .append("g")
        .attr("class", "yaxis-long-label-container") 

    labelContainers
        .append("text")
        .attr("class", "label-number")
        .attr("x", config.width - margin.left)
        .attr("y", d => yaxisScale((d.member)) + yaxisScale.bandwidth() / 1.5)
        .attr("text-anchor", "end")
        .text(d => d[countMetric] == null ? 0 : d[countMetric])
        .attr("font-size", ".8em")
        .attr("fill", "transparent")
        
    // Rect over the whole area around the bar to use for adding mouseover event
    labelContainers
        .append("rect")
        .attr("class", "big-rect-cover")
        .attr("x", - margin.left)
        .attr("y", (d: PlotDatum) => {return(yaxisScale(d.member))})
        .attr("width", config.width)
        .attr("height", yaxisScale.bandwidth())
        .attr("fill", "transparent")
        .attr("stroke", "transparent")
    // rect over the short label. Will become opaque to cover this label
    // and replace with the long version on mouseover. 
    labelContainers
        .append("rect")
        .attr("class", "little-rect-cover")
        .attr("x", d => d == null ? undefined : -margin.left)
        .attr("y", (d: PlotDatum) => yaxisScale(d.member))
        .attr("width", 100)
        .attr("height", yaxisScale.bandwidth())
        .attr("fill", "transparent")
        .attr("stroke", "transparent")
    // y-axis labels
    labelContainers
        .append("text")
        .attr("class", "label-text")
        .attr("x", (d: PlotDatum) => d.member.length < 18 ? -5 : - margin.left)
        .attr("y", (d: PlotDatum) => yaxisScale((d.member)) + yaxisScale.bandwidth() / 1.5)
        .attr("text-anchor", (d: PlotDatum) => d.member.length < 18 ? "end" : "start")
        .attr("font-size", ".8em")
        .attr("fill", "transparent")
      .selectAll("tspan")
        .data((d: PlotDatum) => {
            let l = d.member
            const maxLength = Math.round( (config.
                width - margin.right - 10) / 5.5 )
            if (l.length > maxLength) {
                let splitIndex = l.indexOf(" ")
                while (splitIndex < maxLength) {
                    const next = l.indexOf(" ", splitIndex + 1)
                    if (next > -1 && next < maxLength) { splitIndex = next } else { break }
                }
                let newlabel = [l.slice(0, splitIndex), l.slice(splitIndex + 1)]
                if (newlabel[1].length > maxLength) newlabel[1] = newlabel[1].slice(0, maxLength - 4) + "..."
                return (newlabel)
            } else { return ([l]) }
        })
        .enter()
        .append("tspan")
        .attr("x", (d, i) => d.length < 18 && i === 0 ? -5 : - margin.left)
        .attr("dy", (d, i, data) => i > 0 ? "10" : data.length > 1 ? "-5" : "0")
        .text(d => d)
    
    

    // ---- update ----
    boxes
        .transition()
        .duration(500)
        .attr("width", function (d: PlotDatum) {
            return xaxisScale(d[countMetric]);
        })

    yaxisHoverLabels
        .selectAll(".label-number")
        .data(d => [d])
        .text(d => d[countMetric] == null ? 0 : d[countMetric])

    xaxisLabels.transition()
        .duration(500)
        .call(updateXaxis)
    xaxisGrid.transition()
        .duration(500)
        .call(updateXaxisGrid)
        .selectAll("line").attr("stroke", "#ddd")
    d3.selectAll(".domain").remove() // Removes the line on the bottom of the plot

    // ---- exit ----
    boxes.exit().remove();

    // ----- Mouseover event -----
    yaxisLongLabels.selectAll("g")
        .on("mouseover", function (d) {
            d3.select(this)
                .selectAll(".label-text")
                .transition()
                .duration(100)
                .attr("fill", "black")
                .attr("font-weight", "bold")
            d3.select(this)
                .selectAll(".label-number")
                .transition()
                .duration(100)
                .attr("fill", "black")
                .attr("font-weight", "bold")
            d3.select(this)
                .selectAll(".little-rect-cover")
                .transition()
                .duration(100)
                .attr("fill", "white")
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .selectAll(".label-text")
                .transition()
                .duration(100)
                .attr("fill", "transparent")
                .attr("font-weight", "normal")
            d3.select(this)
                .selectAll(".label-number")
                .transition()
                .duration(100)
                .attr("fill", "transparent")
                .attr("font-weight", "normal")
            d3.select(this)
                .selectAll(".little-rect-cover")
                .transition()
                .duration(100)
                .attr("fill", "transparent")
        })

}

export const D3Barplot: D3Barplot = {
    create: createBarplot,
    update: updateBarplot
}
