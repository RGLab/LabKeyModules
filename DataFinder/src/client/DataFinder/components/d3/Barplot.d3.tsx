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
interface DrawBarplotProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
    dataRange: number[];
    labels: string[];
}


export function drawBarplot(props: DrawBarplotProps) {
    // debugger;

    const data = props.data;
    const name = props.name;
    const labels = props.labels;
    const dataRange = [0,0];
    data.forEach((v) => (v.participantCount > dataRange[1]) && (dataRange[1] = v.participantCount) )
    // debugger
    // const newLabels = [];

    // data.map((e, i) => {
    //     newLabels.push(e.label);
    //     // if (e.value > dataRange[1]) dataRange[1] = e.value;
    // });

    const svg = d3
        .select("#barplot-container-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "barplot-container-" + name)


    // Create margins
    const margin = { top: 20, right: 15, bottom: 30, left: 50 },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;

    // Set scales using options

    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange).nice()
        .range([0, width]);

    const yaxisScale = d3
        .scaleBand()
        .domain(labels)
        .range([height, 0]);

    // Create body and axes
    // svg.append("g")
    //     .call(d3.axisLeft(yaxisScale));

    // svg.append("g")
    //     .call(d3.axisBottom(xaxisScale));
    let barplot: d3.Selection<SVGElement, any, HTMLElement, any>;
    if (!svg.selectAll("g").empty()) {
        svg.select("#xaxis-labels").remove()
        barplot=svg.select("#barplot" + name)
    } else {
        barplot = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "barplot" + name);
    
    svg.append("g")
        .attr("id", "yaxis-labels")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yaxisScale));
    }

    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr(
            "transform",
            "translate(" + margin.left + ", " + (height + margin.top) + ")"
        )
        .call(d3.axisBottom(xaxisScale));




    // add data
    const boxes = barplot.selectAll("rect").data(data);
    boxes
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("x", xaxisScale(0))
        .attr("width", function (d: CubeDatum) {
            return xaxisScale(d.participantCount);
        })
        .attr("y", function (d: CubeDatum) {
            return yaxisScale(d.member);
        })
        .attr("height", yaxisScale.bandwidth() - 5)
        .style("fill", "steelblue")
    boxes
        .transition()
        .duration(500)
        .attr("x", xaxisScale(0))
        .attr("width", function (d: CubeDatum) {
            return xaxisScale(d.participantCount);
        })
        .attr("y", function (d: CubeDatum) {
            return yaxisScale(d.member);
        })
        .attr("height", yaxisScale.bandwidth() - 5)

    boxes.exit().remove();
}

