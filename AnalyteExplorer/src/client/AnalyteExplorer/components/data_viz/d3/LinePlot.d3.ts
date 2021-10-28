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

export interface D3LineData {
  name: string;
  study: string;
  data: StudyPoint[];
}

interface D3LinePlot {
  create: (
    id: string,
    data: D3LineData[],
    config: D3LinePlotConfig,
    trendData?: D3LineData[]
  ) => void;
}

interface CircleDataType {
  cohort: string;
  study: string;
  point: StudyPoint;
}

const roundTwoDecimal = (num: number): number => {
  if (num === null || num === 0) {
    return num;
  }
  return Math.round(num * 100) / 100;
};

const createLinePlot = (
  id: string,
  data: D3LineData[],
  config: D3LinePlotConfig,
  trendData: D3LineData[] = []
) => {
  // ------ Initial Setup ------
  const margin = { top: 10, right: 30, bottom: 60, left: 60 },
    width = config.width - margin.left - margin.right,
    height = config.height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().domain([0, 49]).range([0, width]);

  const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

  const xAxis = (g) =>
    g.attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

  const yAxis = (g) => g.call(d3.axisLeft(yScale));

  const svg = d3
    .select("#lineplot-container-" + id)
    .select("svg")
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("id", "svg-lineplot-" + id)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // add clipPath that'll bound viewbox when zooming
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

  // add axis to plot
  const xAxisElement = svg.append("g").call(xAxis);
  xAxisElement.selectAll(".domain").remove();
  xAxisElement.style("font-size", "16px");
  const yAxisElement = svg.append("g").call(yAxis);
  yAxisElement.style("font-size", "16px");

  // ----- Grid Lines -----

  // gridlines in x axis function
  function make_x_gridlines() {
    return d3.axisBottom(xScale).ticks(11);
  }

  // gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(yScale).ticks(11);
  }

  const xGrid = svgContent
    .append("g")
    .attr("class", "grid grid-x")
    .attr("transform", "translate(0," + height + ")")
    .call(
      make_x_gridlines()
        .tickSize(-height)
        .tickFormat(() => "")
    );

  const yGrid = svgContent
    .append("g")
    .attr("class", "grid grid-y")
    .call(
      make_y_gridlines()
        .tickSize(-width)
        .tickFormat(() => "")
    );

  // remove excessive grid lines from edges of plot
  svgContent.selectAll(".domain").remove();

  svgContent
    .selectAll(".grid line")
    .attr("stroke", "lightgrey")
    .attr("stroke-opacity", 0.7)
    .attr("shape-rendering", "crispEdges");

  // ----- Y = 0 Line -----
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

  // line function used for plotting data
  //https://stackoverflow.com/questions/42308115/d3v4-typescript-angular2-error-using-d3-line-xd-function
  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  // ----- Data Processsing ----- //

  let lineData: StudyPoint[][] = data.reduce((arr, current) => {
    // removes trendline from normal cohort lines so it doesn't get plotted twice
    if (current.name !== "Average") {
      arr.push(current.data);
    }
    return arr;
  }, []);

  let circleData: CircleDataType[] = data.reduce((arr, current) => {
    for (const point of current.data) {
      arr.push({ cohort: current.name, study: current.study, point: point });
    }
    return arr;
  }, []);

  // ----- Plotting Data ----- //

  // plotting lines
  const paths = svgContent.selectAll(".plot-line").data(lineData);
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

  // scaling tooltip x position to match the scaling of responsive svg chart
  const scaleTooltipX = (x: number): number => {
    const currentSVGWidth = document
      .querySelector(`#svg-lineplot-${id}`)
      .getBoundingClientRect().width;
    return x * roundTwoDecimal(currentSVGWidth / config.width);
  };

  // scaling tooltip y position to match the scaling of responsive svg chart
  const scaleTooltipY = (y: number): number => {
    const currentSVGHeight = document
      .querySelector(`#svg-lineplot-${id}`)
      .getBoundingClientRect().height;
    return y * roundTwoDecimal(currentSVGHeight / config.height);
  };

  // plotting circles w/ tooltip hover
  const tooltip = d3.select("#tooltip-" + id);
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
            .style(
              "left",
              scaleTooltipX(parseFloat(d3.select(this).attr("cx"))) + "px"
            )
            .style(
              "top",
              scaleTooltipY(parseFloat(d3.select(this).attr("cy"))) - 90 + "px"
            )
            .style("display", "block");
          tooltip.html(
            `<b>Cohort:</b> ${d.cohort}<br><b>Study:</b> ${
              d.study
            }<br><b>Timepoint:</b> ${
              d.point.x
            }<br><b>log2-FC:</b> ${roundTwoDecimal(d.point.y)}`
          );

          // tooltip2.style("visibility", "visible");
          // tooltip2.style("left", d3.select(this).attr("cx"));
          // tooltip2.style("top", d3.select(this).attr("cy"));
        })
        .on("mouseleave", function (d) {
          d3.select(this).transition().duration(1).attr("r", 4);
          tooltip.style("display", "none");
        })
    )
    .attr("cx", (d) => xScale(d.point.x))
    .attr("cy", (d) => yScale(d.point.y))
    .attr("r", 4);

  // ----- Legends -----
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

  // ----- Zoom Function -----
  // https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
  const zoom = d3
    .zoom()
    .scaleExtent([0.25, 15])
    .on("zoom", () => {
      // recover the new scale
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
        .on("mouseenter", function (d: CircleDataType) {
          //using normal functions to preserve "this"
          d3.select(this).transition().duration(1).attr("r", 8);
          tooltip
            .style(
              "left",
              scaleTooltipX(parseFloat(d3.select(this).attr("cx"))) + "px"
            )
            .style(
              "top",
              scaleTooltipY(parseFloat(d3.select(this).attr("cy"))) - 90 + "px"
            )
            .style("display", "block");
          tooltip.html(
            `<b>Cohort:</b> ${d.cohort}<br><b>Study:</b> ${
              d.study
            }<br><b>Timepoint:</b> ${
              d.point.x
            }<br><b>log2-FC:</b> ${roundTwoDecimal(d.point.y)}`
          );
        })
        .attr("cx", (d: CircleDataType) => newXScale(d.point.x))
        .attr("cy", (d: CircleDataType) => newYScale(d.point.y))
        .attr("r", 4);

      // redraw the grids
      function make_new_x_gridlines() {
        return d3.axisBottom(newXScale).ticks(11);
      }

      function make_new_y_gridlines() {
        return d3.axisLeft(newYScale).ticks(11);
      }

      xGrid.call(
        make_new_x_gridlines()
          .tickSize(-height)
          .tickFormat(() => "")
      );

      yGrid.call(
        make_new_y_gridlines()
          .tickSize(-width)
          .tickFormat(() => "")
      );

      svgContent.selectAll(".domain").remove();

      svgContent
        .selectAll(".grid line")
        .attr("stroke", "lightgrey")
        .attr("stroke-opacity", 0.7)
        .attr("shape-rendering", "crispEdges");
    });

  // on mouse doubleclick the chart resets to original state
  const resetChart = () => {
    xAxisElement.call(d3.axisBottom(xScale));
    yAxisElement.call(d3.axisLeft(yScale));

    svgContent.selectAll(".plot-line").attr("d", line);
    baseLine.attr("y1", yScale(0)).attr("y2", yScale(0));

    svgContent
      .selectAll(".dot")
      .on("mouseenter", function (d: CircleDataType) {
        //using normal functions to preserve "this"
        d3.select(this).transition().duration(1).attr("r", 8);
        tooltip
          .style(
            "left",
            scaleTooltipX(parseFloat(d3.select(this).attr("cx"))) + "px"
          )
          .style(
            "top",
            scaleTooltipY(parseFloat(d3.select(this).attr("cy"))) - 90 + "px"
          )
          .style("display", "block");
        tooltip.html(
          `<b>Cohort:</b> ${d.cohort}<br><b>Study:</b> ${
            d.study
          }<br><b>Timepoint:</b> ${
            d.point.x
          }<br><b>log2-FC:</b> ${roundTwoDecimal(d.point.y)}`
        );
      })
      .attr("cx", (d: CircleDataType) => xScale(d.point.x))
      .attr("cy", (d: CircleDataType) => yScale(d.point.y))
      .attr("r", 4);
  };

  svgContent
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .lower();

  svgContent.call(zoom).on("dblclick.zoom", resetChart);

  // Adding x-axis and y-axis labels
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

export const D3LinePlot: D3LinePlot = {
  create: createLinePlot,
};
