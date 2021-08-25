import * as d3 from "d3";

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
  const margin = { top: 10, right: 30, bottom: 60, left: 60 },
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
    .attr("height", `${height}`)
    .attr("x", 0)
    .attr("y", 0);

  const svgContent = svg
    .append("g")
    .attr("class", "plot-content")
    .attr("clip-path", "url(#clip)");

  const xAxisElement = svg.append("g").call(xAxis);
  xAxisElement.selectAll(".domain").remove();
  xAxisElement.style("font-size", "16px");
  const yAxisElement = svg.append("g").call(yAxis);
  yAxisElement.style("font-size", "16px");

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

  // y = 0 line
  const baseLine = svgContent
    .append("line")
    .attr("class", "base-line")
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
        .attr("stroke", "#B4BBBF")
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
        .attr("stroke", "#FF5B00")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("class", "plot-line")
        .attr("id", "#trend-line-" + id)
        .attr("d", line)
    );
  }

  const circles = svgContent.selectAll(".dot").data(circleData);

  circles
    .join((enter) =>
      enter
        .append("circle")
        .attr("class", (d) => {
          return `dot ${d.study === "Trend" ? "trend-dot" : "cohort-dot"}`;
        })
        .on("mouseenter", function (d) {
          //using normal functions to preserve "this"
          d3.select(this).transition().duration(1).attr("r", 8);
          tooltip
            .style("left", xScale(d.point.x) + "px")
            .style("top", yScale(d.point.y) - 70 + "px")
            .style("display", "block");
          tooltip.html(
            `<b>Cohort:</b> ${d.cohort}<br><b>Study:</b> ${d.study}<br><b>Timepoint:</b> ${d.point.x}<br><b>log2-FC:</b> ${d.point.y}`
          );
        })
        .on("mouseleave", function (d) {
          d3.select(this).transition().duration(1).attr("r", 4);
          tooltip.style("display", "none");
        })
    )
    .attr("cx", (d) => xScale(d.point.x))
    .attr("cy", (d) => yScale(d.point.y))
    .attr("r", 4);

  const legend = svgContent.append("g").attr("class", "legend");

  const legendProps = {
    initialX: width - 100,
    initialY: height - 50,
    xGap: 20,
    yGap: 30,
  };

  legend
    .append("circle")
    .attr("cx", legendProps.initialX)
    .attr("cy", legendProps.initialY)
    .attr("r", 6)
    .style("fill", "#b4bbbf");
  legend
    .append("circle")
    .attr("cx", legendProps.initialX)
    .attr("cy", legendProps.initialY + legendProps.yGap)
    .attr("r", 6)
    .style("fill", "#ff5b00");
  legend
    .append("text")
    .attr("x", legendProps.initialX + legendProps.xGap)
    .attr("y", legendProps.initialY)
    .text("Cohorts")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  legend
    .append("text")
    .attr("x", legendProps.initialX + legendProps.xGap)
    .attr("y", legendProps.initialY + legendProps.yGap)
    .text("Trend")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  // https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 7])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", () => {
      // recover the new scale
      console.log("zoom");
      const newXScale = d3.event.transform.rescaleX(xScale);
      const newYScale = d3.event.transform.rescaleY(yScale);

      const newLine = d3
        .line<{ x: number; y: number }>()
        .x((d) => newXScale(d.x))
        .y((d) => newYScale(d.y));

      // update axes with these new boundaries
      xAxisElement.call(d3.axisBottom(newXScale));
      yAxisElement.call(d3.axisLeft(newYScale));

      // redraw all the lines
      svgContent.selectAll(".plot-line").attr("d", newLine);
      baseLine.attr("y1", newYScale(0)).attr("y2", newYScale(0));

      // reposition all circles

      svgContent
        .selectAll(".dot")
        .on(
          "mouseenter",
          function (d: { cohort: string; study: string; point: StudyPoint }) {
            //using normal functions to preserve "this"
            d3.select(this).transition().duration(1).attr("r", 8);
            tooltip
              .style("left", newXScale(d.point.x) + "px")
              .style("top", newYScale(d.point.y) - 70 + "px")
              .style("display", "block");
            tooltip.html(
              `<b>Cohort:</b> ${d.cohort}<br><b>Study:</b> ${d.study}<br><b>Timepoint:</b> ${d.point.x}<br><b>log2-FC:</b> ${d.point.y}`
            );
          }
        )
        .attr("cx", (d: { cohort: string; study: string; point: StudyPoint }) =>
          newXScale(d.point.x)
        )
        .attr("cy", (d: { cohort: string; study: string; point: StudyPoint }) =>
          newYScale(d.point.y)
        )
        .attr("r", 4);
    });

  // zoom area... not sure why this is needed?
  // svg
  //   .append("rect")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .attr("class", "zoom-rect")
  //   .style("fill", "none")
  //   .style("pointer-events", "all")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //   .call(zoom)
  //   .on("dblclick.zoom", null);

  const resetChart = () => {
    xAxisElement.call(d3.axisBottom(xScale));
    yAxisElement.call(d3.axisLeft(yScale));

    svgContent.selectAll(".plot-line").attr("d", line);
    baseLine.attr("y1", yScale(0)).attr("y2", yScale(0));

    svgContent
      .selectAll(".dot")
      .on(
        "mouseenter",
        function (d: { cohort: string; study: string; point: StudyPoint }) {
          //using normal functions to preserve "this"
          d3.select(this).transition().duration(1).attr("r", 8);
          tooltip
            .style("left", xScale(d.point.x) + "px")
            .style("top", yScale(d.point.y) - 70 + "px")
            .style("display", "block");
          tooltip.html(
            `<b>Cohort:</b> ${d.cohort}<br><b>Study:</b> ${d.study}<br><b>Timepoint:</b> ${d.point.x}<br><b>log2-FC:</b> ${d.point.y}`
          );
        }
      )
      .attr("cx", (d: { cohort: string; study: string; point: StudyPoint }) =>
        xScale(d.point.x)
      )
      .attr("cy", (d: { cohort: string; study: string; point: StudyPoint }) =>
        yScale(d.point.y)
      )
      .attr("r", 4);
  };

  svgContent
    .style("pointer-events", "all")
    .call(zoom)
    .on("dblclick.zoom", resetChart);

  const updateChart = () => {
    const extent = d3.event.selection;

    if (extent) {
      // console.log(d3.event);
      // console.log(xScale.invert(extent[0]));
      // console.log(xScale.invert(extent[1]));

      xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])]);
      svgContent.select(".brush").call(brush.move, null);

      xAxisElement.transition().duration(1000).call(d3.axisBottom(xScale));
      svgContent
        .selectAll(".plot-line")
        .transition()
        .duration(1000)
        .attr("d", line);
    }
  };

  //https://www.d3-graph-gallery.com/graph/line_brushZoom.html
  const brush = d3
    .brushX() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart);

  // svgContent.append("g").attr("class", "brush").call(brush);

  // svgContent.on("dblclick", function () {
  //   xScale.domain([0, 49]);
  //   xAxisElement.transition().call(d3.axisBottom(xScale));
  //   svgContent.selectAll(".plot-line").transition().attr("d", line);
  // });

  svg
    .append("text")
    .attr("class", "x label")
    .style("color", "black")
    .style("font-size", "16px")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", config.height - 25)
    .text(config.xLabel);

  svg
    .append("text")
    .attr("class", "y label")
    .style("font-size", "16px")
    .style("line-height", "16px")
    .attr("text-anchor", "end")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 14)
    .attr("transform", "rotate(-90)")
    .text(config.yLabel);
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
