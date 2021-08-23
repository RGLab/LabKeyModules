import { saveBatches } from "@labkey/api/dist/labkey/Experiment";
import * as d3 from "d3";
import { path } from "d3";

export interface D3LinePlotConfig {
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
  countMetric?: string;
  barColor?: string;
}

export interface StudyPoint {
  x: number;
  y: number;
  study: string;
}

interface D3LinePlot {
  create: (
    id: string,
    data: { name: string; study: string; data: StudyPoint[] }[],
    config: D3LinePlotConfig,
    trendData?: { name: string; study: string; data: StudyPoint[] }[]
  ) => void;
}

const xaxisTitle = { height: 40 };

const createLinePlot = (
  id: string,
  data: { name: string; study: string; data: StudyPoint[] }[],
  config: D3LinePlotConfig,
  trendData?: { name: string; study: string; data: StudyPoint[] }[]
) => {
  //const lineplotHeight = config.height - xaxisTitle.height - 10; // need to actually figure out how tall the xaxis is
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = config.width - margin.left - margin.right,
    height = config.height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().domain([0, 49]).range([0, width]);

  const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

  //https://stackoverflow.com/questions/42308115/d3v4-typescript-angular2-error-using-d3-line-xd-function

  const xAxis = (g) =>
    g.attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

  const yAxis = (g) => g.call(d3.axisLeft(yScale));
  //.attr("transform", `translate(${margin.left},0)`);

  const svg = d3
    .select("#lineplot-container-" + id)
    .select("svg")
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("id", "svg-lineplot-" + id)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("x", 0)
    .attr("y", 0);

  const svgContent = svg
    .append("g")
    .attr("class", "plot-content")
    .attr("clip-path", "url(#clip)");

  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 5])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", () => {
      const zoomState = d3.zoomTransform(svg.node() as Element);

      const newXScale = zoomState.rescaleX(xScale);
      console.log(xScale.domain());
      console.log(newXScale.domain());
      xScale.domain(newXScale.domain());
    });

  const xAxisElement = svg.append("g").call(xAxis);
  xAxisElement.selectAll(".domain").remove();
  xAxisElement.style("font-size", "16px");
  const yAxisElement = svg.append("g").call(yAxis);
  //yAxisElement.selectAll(".domain").remove();
  yAxisElement.style("font-size", "16px");
  svg.call(zoom);

  // gridlines in x axis function
  function make_x_gridlines() {
    return d3.axisBottom(xScale).ticks(11);
  }

  // gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(yScale).ticks(11);
  }

  svgContent
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(
      make_x_gridlines()
        .tickSize(-height)
        .tickFormat(() => "")
    );

  const yGrid = svgContent
    .append("g")
    .attr("class", "grid")
    .call(
      make_y_gridlines()
        .tickSize(-width)
        .tickFormat(() => "")
    );

  svgContent.selectAll(".domain").remove();

  svgContent
    .selectAll(".grid line")
    .attr("stroke", "lightgrey")
    .attr("stroke-opacity", 0.7)
    .attr("shape-rendering", "crispEdges");

  svgContent
    .append("line")
    .attr("x1", 0)
    .attr("y1", yScale(0))
    .attr("x2", width)
    .attr("y2", yScale(0))
    .attr("stroke-width", 1)
    .attr("stroke", "black")
    .attr("transform", `translate(0, ${0.5})`); // transform is used to align the line with the y axis tick @0

  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  let lineData: StudyPoint[][] = data.reduce((arr, current) => {
    arr.push(current.data);
    return arr;
  }, []);

  let circleData: { cohort: string; study: string; point: StudyPoint }[] =
    data.reduce((arr, current) => {
      for (const point of current.data) {
        arr.push({ cohort: current.name, study: current.study, point: point });
      }
      return arr;
    }, []);

  const paths = svgContent.selectAll(".plot-line").data(lineData);
  //const t = svg.transition().duration(750);

  const tooltip = d3.select("#tooltip-" + id);

  paths.join(
    (enter) =>
      enter
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-opacity", 0.7)
        .attr("class", "plot-line")
        .attr("d", line),
    (update) => update.attr("stroke", "blue"),
    (exit) => exit.remove()
  );

  if (trendData !== undefined && trendData.length > 0) {
    let trendLineData: StudyPoint[][] = [trendData[0].data];
    const trendLine = svgContent
      .selectAll("#trend-line-" + id)
      .data(trendLineData);

    trendLine.join((enter) =>
      enter
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("id", "#trend-line-" + id)
        .attr("d", line)
    );
  }

  // const circles = svgContent.selectAll("circle").data(circleData);

  // circles
  //   .join((enter) =>
  //     enter
  //       .append("circle")
  //       .style("fill", "blue")
  //       .on("mouseenter", function (d) {
  //         //using normal functions to preserve "this"
  //         d3.select(this).transition().duration(1).attr("r", 8);
  //         tooltip
  //           .style("left", xScale(d.point.x) + 8 + "px")
  //           .style("top", y(d.point.y) + "px")
  //           .style("display", "block");
  //         tooltip.html(
  //           `Cohort: ${d.cohort}<br>Study: ${d.study}<br>Timepoint: ${d.point.x}<br>log2-FC: ${d.point.y}`
  //         );
  //       })
  //       .on("mouseleave", function (d) {
  //         d3.select(this)
  //           .transition()
  //           .duration(1)
  //           .attr("r", (d) => 4);
  //         tooltip.style("display", "none");
  //       })
  //   )
  //   .attr("cx", (d) => xScale(d.point.x))
  //   .attr("cy", (d) => y(d.point.y))
  //   .attr("r", 4);

  // svg
  //   .append("text")
  //   .attr("class", "x label")
  //   .style("font-size", "12px")
  //   .attr("text-anchor", "middle")
  //   .attr("x", config.width / 2)
  //   .attr("y", config.height - 12)
  //   .text(config.xLabel);

  // svg
  //   .append("text")
  //   .attr("class", "y label")
  //   .style("font-size", "12px")
  //   .attr("text-anchor", "end")
  //   .attr("x", -config.height / 2)
  //   .attr("y", 12)
  //   .attr("transform", "rotate(-90)")
  //   .text(config.yLabel);
};

// const updateLinePlot = (id: string, data: any, config: D3LinePlotConfig) => {
//   const lineplotHeight = config.height - xaxisTitle.height - 10;
//   const margin = { top: 20, right: 30, bottom: 40, left: 40 },
//     width = config.width - margin.left - margin.right,
//     height = lineplotHeight - margin.top - margin.bottom;

//   const svg = d3.select("#lineplot-container-" + id).select("svg");

//   const x = d3
//     .scaleLinear()
//     .domain([0, 49])
//     .range([margin.left, config.width - margin.right]);

//   const y = d3
//     .scaleLinear()
//     .domain([-1, 1])
//     .range([config.height - margin.bottom, margin.top]);

//   const line = d3
//     .line<{ x: number; y: number }>()
//     .x((d) => x(d.x))
//     .y((d) => y(d.y));

//   let lData = data.reduce((arr, current) => {
//     arr.push(current.data);
//     return arr;
//   }, []);

//   const paths = svg.selectAll(".plot-line").data(lData);
// };

export const D3LinePlot: D3LinePlot = {
  create: createLinePlot,
};
