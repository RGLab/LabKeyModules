import * as d3 from 'd3'
import { CubeDatum } from '../../../typings/CubeData';

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
    totalHeight: number;
    labels: string[];
    countMetric: string;
    barColor: string;
}


interface D3Barplot {
    create: (id: string, data: CubeDatum[], config: D3BarplotConfig) => void;
    update: (id: string, data: CubeDatum[], config: D3BarplotConfig) => void;
}

const createBarplot = (id: string, data: CubeDatum[], config: D3BarplotConfig) => {

    const svg = d3
        .select("#barplot-container-" + id).select("svg")
        .attr("height", config.totalHeight)
        .attr("width", config.width)
        .attr("id", "barplot-container-" + id)

    const xAxisSvg = d3.select("#xaxis-" + id).select("svg")
        .attr("width", config.width)
        .attr("height", 40)


    // Create margins
    const margin = { top: 0, right: 15, bottom: 0, left: 100 },
        width = config.width - margin.left - margin.right,
        height = config.totalHeight - margin.top - margin.bottom;

    const labels = config.labels.map(l => {
        let short = l
        if (l.length > 18) short = l.slice(0, 14) + "..."
        return ({ label: l, shortlabel: short })
    })
    const yaxisScale = d3
        .scaleBand()
        .domain(labels.map(l => l.label))
        .range([height, 0]);

    const barplot = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "barplot" + id)
        .attr("style", "overflow:auto")

    // y-axis short labels
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

    // y-axis long labels (for hover)
    const yaxisLongLabels = svg.append("g")
        .attr("id", "yaxis-labels-" + id)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


}

const updateBarplot = (id: string, data: CubeDatum[], config: D3BarplotConfig) => {
    const svg = d3.select("#barplot-container-" + id).select("svg")

    const xAxisSvg = d3.select("#xaxis-" + id).select("svg")

    const dataRange = [0, 10];
    const countMetric = config.countMetric
    data.forEach((v) => (v[countMetric] > dataRange[1]) && (dataRange[1] = v[countMetric]))

    const labels = config.labels.map(l => {
        let short = l
        if (l.length > 18) short = l.slice(0, 14) + "..."
        return ({ label: l, shortlabel: short })
    })

    const margin = { top: 0, right: 15, bottom: 0, left: 100 },
        width = config.width - margin.left - margin.right,
        height = config.totalHeight - margin.top - margin.bottom;

    const yaxisScale = d3
        .scaleBand()
        .domain(labels.map(l => l.label))
        .range([height, 0]);
    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange).nice()
        .range([0, width]);

    const barplot = d3.select("#barplot" + id)
    const xaxisGrid = svg.select("#xaxis-grid-" + id)
    const xaxisLabels = xAxisSvg.selectAll(".x.axis")
    // debugger
    const yaxisLongLabels = svg.select("#yaxis-labels-" + id)

    if (!yaxisLongLabels.selectAll("yaxis-long-label-container").empty()) debugger
    const labelContainers = yaxisLongLabels
        .selectAll("yaxis-long-label-container")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "yaxis-long-label-container")
    labelContainers
        .selectAll(".big-rect-cover")
        .data(d => [d])
        .enter()
        .append("rect")
        .attr("class", "big-rect-cover")
        .attr("x", - margin.left)
        .attr("y", d => yaxisScale(d.member))
        .attr("width", config.width)
        .attr("height", yaxisScale.bandwidth())
        .attr("fill", "transparent")
        .attr("stroke", "transparent")
    labelContainers
        .selectAll(".little-rect-cover")
        .data(d => [d])
        .enter()
        .append("rect")
        .attr("class", "little-rect-cover")
        .attr("x", d => d == null ? undefined : -margin.left)
        .attr("y", d => yaxisScale(d.member))
        .attr("width", 100)
        .attr("height", yaxisScale.bandwidth())
        .attr("fill", "transparent")
        .attr("stroke", "transparent")
    labelContainers.selectAll(".label-text")
        .data(d => [d])
        .enter()
        .append("text")
        .attr("class", "label-text")
        .attr("x", d => d.member.length < 18 ? -5 : - margin.left)
        .attr("y", d => yaxisScale((d.member)) + yaxisScale.bandwidth() / 1.5)
        .attr("text-anchor", d => d.member.length < 18 ? "end" : "start")
        .attr("font-size", ".8em")
        .attr("fill", "transparent")
    labelContainers.selectAll(".label-text").selectAll("tspan")
        .data((d: CubeDatum) => {
            let l = d.member
            if (l.length > 40) {
                let splitIndex = l.indexOf(" ")
                while (splitIndex < 40) {
                    const next = l.indexOf(" ", splitIndex + 1)
                    if (next > -1 && next < 40) { splitIndex = next } else { break }
                }
                let newlabel = [l.slice(0, splitIndex), l.slice(splitIndex + 1)]
                if (newlabel[1].length > 40) newlabel[1] = newlabel[1].slice(0, 36) + "..."
                return (newlabel)
            } else { return ([l]) }
        })
        .enter()
        .append("tspan")
        .attr("x", (d, i) => d.length < 18 && i === 0 ? -5 : - margin.left)
        .attr("dy", (d, i, data) => i > 0 ? "10" : data.length > 1 ? "-5" : "0")
        .text(d => d)

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

    labelContainers.selectAll(".label-number")
        .data(d => [d])
        .enter()
        .append("text")
        .attr("class", "label-number")
        .attr("x", config.width - margin.left)
        .attr("y", d => yaxisScale((d.member)) + yaxisScale.bandwidth() / 1.5)
        .attr("text-anchor", "end")
        .text(d => d[countMetric] == null ? 0 : d[countMetric])
        .attr("font-size", ".8em")
        .attr("fill", "transparent")



    const xaxisCall: any = d3.axisBottom(xaxisScale).ticks(3).tickSize(0)
    const xaxisGridCall: any = d3.axisBottom(xaxisScale).ticks(3).tickSize(-(height + 5)).tickFormat(() => "")
    xaxisGrid.transition()
        .duration(500)
        .call(xaxisGridCall)
        .selectAll("line").attr("stroke", "#ddd")
    xaxisLabels.transition()
        .duration(500)
        .call(xaxisCall)
    // svg.append("g")
    //     .attr("id", "xaxis-labels-" + name)
    //     .attr(
    //         "transform",
    //         `translate(${margin.left}, ${(height + margin.top)})`
    //     )
    //     .call(d3.axisBottom(xaxisScale).tickValues([Math.round((dataRange[1] + 5) / 10) * 10]).tickSize(-height))
    //     .selectAll("line").attr("stroke", "#bcbcbc").attr("stroke-width", "3")

    d3.selectAll(".domain").remove()

    // add data
    const boxes = barplot.selectAll("rect").data(data);
    boxes
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("x", xaxisScale(0))
        .attr("width", function (d: CubeDatum) {
            return xaxisScale(d[countMetric]);
        })
        .attr("y", function (d: CubeDatum) {
            return yaxisScale(d.member);
        })
        .attr("height", yaxisScale.bandwidth() - 1)
        .style("fill", config.barColor)
    boxes
        .transition()
        .duration(500)
        .attr("x", xaxisScale(0))
        .attr("width", function (d: CubeDatum) {
            return xaxisScale(d[countMetric]);
        })
        .attr("y", function (d: CubeDatum) {
            return yaxisScale(d.member);
        })
        .attr("height", yaxisScale.bandwidth() - 1)

    boxes.exit().remove();
}

export const D3Barplot: D3Barplot = {
    create: createBarplot,
    update: updateBarplot
}
