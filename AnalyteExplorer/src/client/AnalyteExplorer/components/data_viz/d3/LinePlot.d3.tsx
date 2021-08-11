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

export interface Point {
  x: number;
  y: number;
}

interface D3LinePlot {
  create: (id: string, data: any, config: D3LinePlotConfig) => void;
  update: (id: string, data: any, config: D3LinePlotConfig) => void;
}

const xaxisTitle = { height: 40 };

const createLinePlot = (
  id: string,
  data: { name: string; data: Point[] }[],
  config: D3LinePlotConfig
) => {
  const lineplotHeight = config.height - xaxisTitle.height - 10;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 },
    width = config.width - margin.left - margin.right,
    height = lineplotHeight - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([0, 49])
    .range([margin.left, config.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([-1, 1])
    .range([config.height - margin.bottom, margin.top]);

  //https://stackoverflow.com/questions/42308115/d3v4-typescript-angular2-error-using-d3-line-xd-function

  const xAxis = (g) =>
    g
      .attr("transform", `translate(0,${config.height - margin.bottom})`)
      .call(d3.axisBottom(x));

  const yAxis = (g) =>
    g.call(d3.axisLeft(y)).attr("transform", `translate(${margin.left},0)`);

  const svg = d3
    .select("#lineplot-container-" + id)
    .select("svg")
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("id", "svg-lineplot-" + id);

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => x(d.x))
    .y((d) => y(d.y));

  let lData = data.reduce((arr, current) => {
    arr.push(current.data);
    return arr;
  }, []);

  const paths = svg.selectAll(".plot-line").data(lData);
  const t = svg.transition().duration(750);

  paths.join(
    (enter) =>
      enter
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("class", "plot-line")
        .attr("d", line),
    (update) => update.attr("stroke", "blue"),
    (exit) => exit.remove()
  );

  svg
    .append("text")
    .attr("class", "x label")
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("x", config.width / 2)
    .attr("y", config.height - 12)
    .text(config.xLabel);

  svg
    .append("text")
    .attr("class", "y label")
    .style("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("x", -config.height / 2)
    .attr("y", 12)
    .attr("transform", "rotate(-90)")
    .text(config.yLabel);
};

const updateLinePlot = (id: string, data: any, config: D3LinePlotConfig) => {
  const lineplotHeight = config.height - xaxisTitle.height - 10;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 },
    width = config.width - margin.left - margin.right,
    height = lineplotHeight - margin.top - margin.bottom;

  const svg = d3.select("#lineplot-container-" + id).select("svg");

  const x = d3
    .scaleLinear()
    .domain([0, 49])
    .range([margin.left, config.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([-1, 1])
    .range([config.height - margin.bottom, margin.top]);

  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => x(d.x))
    .y((d) => y(d.y));

  let lData = data.reduce((arr, current) => {
    arr.push(current.data);
    return arr;
  }, []);

  const paths = svg.selectAll(".plot-line").data(lData);
};

export const D3LinePlot: D3LinePlot = {
  create: createLinePlot,
  update: updateLinePlot,
};
