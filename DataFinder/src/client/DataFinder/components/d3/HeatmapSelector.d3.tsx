import * as d3 from 'd3'
import { HeatmapDatum, IAssayData, CubeDatum, Filter } from '../../../typings/CubeData';
import { HeatmapProps } from '../HeatmapSelector';
import { AxisDatum } from '../HeatmapSelector';
import { Axis, select } from 'd3';
import { List } from 'immutable';
// ================================================================== //
/* 
This is a heatmap component which was translated from an r2d3 fuction.
It takes the following arguments:
  * data (array of objects, each one representing a grid rectangle.
          objects should have the following format:
         {"assay": "",
          "id": "10b", // a unique id for this square
          "participantCount": 10,:
          "participantList": [], // array of participant IDs
          "studyCount": 2,
          "studyList": [], // array of study IDs
          "timepoint": "0"
          }
  )
  * name (class name for the div to stick it in)
  * width (width for the plot)
  * height (height for the plot)
  * options (object with the following format:
      {"breaks": [], //(numerical array with breaks for coloring)
       "colors": [], //(array of hex colors, where length = breaks.length + 2)
       "xaxis": [], //(character array with labels for the x-axis)
       "yaxis": [], //(character array with labels for the y-axis)
       "selected": [] //(elements that are currently selected)
      }
     )
*/



export const drawHeatmap = (props: HeatmapProps) => {
  // if (props.showSampleType) debugger
  const data = props.data;
  const name = props.name;
  const selected = props.selected;

  // if (data.length > 0) debugger

  d3.select("." + name + " > *").remove();
  var svg = d3
    .select("." + name)
    .append("svg")
    .attr("height", props.height)
    .attr("width", props.width)
    .attr("id", "heatmap-" + name);

  // debugger
  // x, y, width, top, right, left, height, bottom

  // Create margins
  var margin = { top: 15, right: 15, bottom: 40, left: 175 },
    width = props.width - margin.left - margin.right,
    height = props.height - margin.top - margin.bottom;

  // Define the div for the tooltip
  var tooltip = d3.select("#heatmap-label");
  var arrow = d3.select(".arrow-down");

  // Set scales using options
  // color scale
  var colorScale = d3
    .scaleThreshold<number, string>()
    .domain(props.breaks)
    .range(props.colors);

  var xaxisScale = d3
    .scaleBand()
    .domain(props.xaxis.map((e) => e.label))
    .range([0, width]);

  var yaxisScale = d3
    .scaleBand()
    .domain(props.yaxis.map((e) => e.label))
    .range([0, height]);

  // Create body and axes
  let heatmap: d3.Selection<SVGElement, any, HTMLElement, any>;

  if (svg.selectAll("g").empty()) {
    heatmap = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("id", "heatmap");
    var xaxislabels = svg
      .append("g")
      .attr("id", "xaxis-labels")
      .attr(
        "transform",
        "translate(" + margin.left + ", " + (height + margin.top) + ")"
      );
    //.call(d3.axisBottom(xaxisScale));

    var yaxislabels = svg
      .append("g")
      .attr("id", "yaxis-labels")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    // .call(d3.axisLeft(yaxisScale));
  } else {
    heatmap = svg.select("#heatmap"),
      xaxislabels = svg.select("#xaxis-labels"),
      yaxislabels = svg.select("#yaxis-labels");
  }

  // y-axis tags
  var yAxisTagPoints = function (assay: string) {
    var x1 = xaxisScale("<0") - margin.left + 5,
      x2 = xaxisScale("<0") - 5,
      x3 = xaxisScale("<0"),
      y1 = yaxisScale(assay) + yaxisScale.bandwidth() - 1,
      y2 = yaxisScale(assay) + yaxisScale.bandwidth() / 2,
      y3 = yaxisScale(assay) + 1;
    return (`${x1},${y3} ${x2},${y3} ${x3},${y2} ${x2},${y1} ${x1},${y1} `);
  };

  var yaxistext = yaxislabels.selectAll("text").data(props.yaxis);
  yaxistext
    .enter()
    .append("text")
    .attr("x", (d) => {
      return xaxisScale("<0") - margin.left / 2;
    })
    .attr("y", (d) => {
      return yaxisScale((d.label)) + yaxisScale.bandwidth() / 2;
    })
    .attr("text-anchor", "middle")
    .attr("font-size", ".8em")
    .attr("dominant-baseline", "central")
    .text((d) => {
      return d.label;
    });

  var yaxispolygons = yaxislabels.selectAll("polygon").data(props.yaxis);
  // debugger
  yaxispolygons
    .enter()
    .append("polygon")
    .attr("points", (d) => {
      return yAxisTagPoints(d.label);
    })
    .attr("fill", "transparent")
    .attr("stroke", function (d) {
      if (selected.getIn(["Assay", "Assay"]) != undefined || selected.getIn(["SampleType", "Assay"]) != undefined) {
        let s = false
        if (props.showSampleType) {
          // debugger
          if (selected.getIn(["SampleType", "Assay"])) {
            selected.getIn(["SampleType", "Assay"]).forEach(memberList => {
              if (memberList.includes(d.data.member)) s = true
            })
          }
        } else {
          if (selected.getIn(["Assay", "Assay"])) {
            selected.getIn(["Assay", "Assay"]).forEach(memberList => {
              if (memberList.includes(d.label)) s = true
            });
          }
        }
        if (s) return "black"
      }
      return ("#e5e5e5")
    })
    .on("mouseover", function (d) {
      // Change style
      d3.select(this)
        .attr("stroke-width", "3px")
    })
    .on("mouseout", function (d) {
      // Reset to original
      d3.select(this)
        .attr("stroke-width", "1px")

    })
    .on("click", function (d) {
      props.handleClick(d.data);
    });

  // x-axis tags
  var xAxisTagPoints = function (tp: string) {
    var x1 = xaxisScale(tp) + 1,
      x2 = xaxisScale(tp) + xaxisScale.bandwidth() / 2,
      x3 = xaxisScale(tp) + xaxisScale.bandwidth() - 1,
      y1 = 0,
      y2 = y1 + 5,
      y3 = y1 + 20;
    return (`${x1},${y3} ${x1},${y2} ${x2},${y1} ${x3},${y2} ${x3},${y3} `);
  };

  var xaxis = xaxislabels.selectAll("labels").data(props.xaxis);

  if (svg.select("#xaxis-title").empty()) {
    xaxis
      .enter()
      .append("text")
      .attr("x", (d) => {
        return xaxisScale(d.label) + xaxisScale.bandwidth() / 2;
      })
      .attr("y", (d) => {
        return 17;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", ".8em")
      .text((d) => {
        return d.label;
      });

    xaxis
      .enter()
      .append("polygon")
      .attr("points", (d) => {
        return xAxisTagPoints(d.label);
      })
      .attr("fill", "transparent")
      .attr("stroke", function (d) {
        if (selected.getIn(["Timepoint"])) {
          let s = false
          selected.getIn(["Timepoint"]).forEach((memberList) => {
            if (memberList.includes(d.label)) s = true
          });
          if (s) return "black"
        }
        return ("#e5e5e5")
      })
      .on("mouseover", function (d) {
        // Change style
        d3.select(this)
          .attr("stroke-width", "3px")
        // .attr("stroke", "black");
      })
      .on("mouseout", function (d) {
        // Reset to original
        d3.select(this)
          .attr("stroke-width", "1px")
      })
      .on("click", function (d) {
        props.handleClick(d.data);
      });

    xaxislabels
      .append("text")
      .attr("id", "xaxis-title")
      .attr("x", width / 2)
      .attr("y", "35")
      .attr("text-anchor", "middle")
      .text("Study Day");
  }

  // add data
  var boxes = heatmap.selectAll("rect").data(data);
  boxes
    .enter()
    .append("rect")
    .attr("x", (d) => {
      return xaxisScale(d.x) + 3;
    })
    .attr("width", xaxisScale.bandwidth() - 3)
    .attr("y", (d) => {
      return yaxisScale(d.y) + 3;
    })
    .attr("height", yaxisScale.bandwidth() - 3)
    .style("fill", (d) => {
      return colorScale(d.participantCount);
    })
    .attr("stroke-width", "1px")
    .attr("stroke", function (d: HeatmapDatum<Filter>) {
        let s = false
        if (props.showSampleType && selected.getIn(["Assay", "SampleType"])) {
          selected.getIn(["Assay", "SampleType"]).forEach((memberList) => {
            if (memberList.includes(d.data.member)) s = true
          })
        } else if (selected.getIn(["Assay", "Timepoint"])) {
          selected.getIn(["Assay", "Timepoint"]).forEach((memberList) => {
            if (memberList.includes(d.data.member)) s = true
          });
        }
        if (s) return "black"
      return ("#e5e5e5")
    })
    .on("mouseover", function (d, i) {
      // get position
      var coord = this.getBoundingClientRect();
      // Tooltip coordinates
      var r = (coord.right + window.scrollX);
      var t = coord.top + window.scrollY;
      // Change style
      d3.select(this)
        .attr("stroke-width", "3px")
        .attr("z-index", "10000");
      // Tooltip
      tooltip
        .transition()
        .duration(100)
        .style("opacity", 0.9);
      arrow
        .transition()
        .duration(100)
        .style("opacity", 0.9);
      arrow
        .style("left", r - (xaxisScale.bandwidth() / 2 - 5) + "px")
        .style("top", t - 12 + "px");
      tooltip
        .html(
          d.participantCount +
          " participants <br>" +
          d.studyCount +
          " studies <br>" +
          d.y +
          " at day " +
          d.x
        )
        .style("left", r - xaxisScale.bandwidth() / 2 + "px")
        .style("top", t - 50 - 12 + "px");
    })
    .on("mouseout", function (d, i) {
      // Reset to original
      d3.select(this)
        .attr("stroke-width", "1px")
        .attr("z-index", 10);
      tooltip
        .transition()
        .duration(100)
        .style("opacity", 0);
      arrow
        .transition()
        .duration(100)
        .style("opacity", 0);
    })
    .on("click", function (d, i) {
      props.handleClick(d.data);
    });

  boxes
    .transition()
    .duration(300)
    .attr("x", (d) => {
      return xaxisScale(d.x);
    })
    .attr("width", xaxisScale.bandwidth() - 1)
    .attr("y", (d) => {
      return yaxisScale(d.y);
    })
    .attr("height", yaxisScale.bandwidth() - 1)
    .style("fill", (d) => {
      return colorScale(d.participantCount);
    })
    .attr("stroke", (d) => {
      return "transparent";
      // }
    });

  boxes.exit().remove();
  yaxistext.exit().remove();
  yaxispolygons.exit().remove();
}