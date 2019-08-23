// React stuff ==================================== //

function AssayTpHeatmap(props) {
  const [selected, setSelected] = React.useState([]);
  const [options, setOptions] = React.useState({});

  function handleClick(id) {
    var tmp = selected.slice();
    if (selected.includes(id)) {
      tmp.splice(selected.indexOf(id), 1);
      setSelected(tmp);
    } else {
      tmp.push(id);
      setSelected(tmp);
    }
  }
  function clearSelection() {
    setSelected([]);
  }

  React.useEffect(() => {
    // load the data
    if (options.breaks == undefined) {
      $.getJSON("/data/options.json", function (json) {
        setOptions(json);
      });
    }
  });


  return (
    <div>
      <Heatmap
        data={props.data}
        options={options}
        selected={selected}
        height={250}
        name={"heatmap"}
        width={800}
        handleClick={handleClick}
      />

      <button onClick={clearSelection}>Clear Selection</button>
    </div>
  );
}

function Heatmap(props) {
  React.useEffect(() => {
    if (props.data.length > 0 && props.options.breaks != undefined) {
      drawHeatmap(props);
    }
  });

  return <div className={props.name} />;
}


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

function drawHeatmap(props) {
  const data = props.data;
  const name = props.name;
  const options = props.options;
  const selected = props.selected;

  d3.select("." + name + " > *").remove();
  var svg = d3
    .select("." + name)
    .append("svg")
    .attr("height", props.height)
    .attr("width", props.width)
    .attr("id", "heatmap-" + name);

  // get position
  var coord = svg.node().getBoundingClientRect();
  // x, y, width, top, right, left, height, bottom

  // Create margins
  var margin = { top: 20, right: 0, bottom: 40, left: 175 },
    width = props.width - margin.left - margin.right,
    height = props.height - margin.top - margin.bottom;

  // // Define the div for the tooltip
  var tooltip = d3.select("#heatmap-label");
  var arrow = d3.select(".arrow-down");

  // Set scales using options
  // color scale
  var colorScale = d3
    .scaleThreshold()
    .domain(options.breaks)
    .range(options.colors);

  var xaxisScale = d3
    .scaleBand()
    .domain(options.xaxis)
    .range([0, width]);

  var yaxisScale = d3
    .scaleBand()
    .domain(options.yaxis)
    .range([0, height]);

  // Create body and axes

  if (svg.selectAll("g").empty()) {
    var heatmap = svg
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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //.call(d3.axisLeft(yaxisScale));
  } else {
    var heatmap = svg.select("#heatmap"),
      xaxislabels = svg.select("#xaxis-labels"),
      yaxislabels = svg.select("#yaxis-labels");
  }

  // y-axis tags
  var yAxisTagPoints = function (assay) {
    var x1 = xaxisScale(0) - xaxisScale.bandwidth() - margin.left + 5,
      x2 = xaxisScale(0) - xaxisScale.bandwidth() - 5,
      x3 = xaxisScale(0) - xaxisScale.bandwidth(),
      y1 = yaxisScale(assay) + yaxisScale.bandwidth() - 1,
      y2 = yaxisScale(assay) + yaxisScale.bandwidth() / 2,
      y3 = yaxisScale(assay) + 1;
    return (
      x1 +
      "," +
      y3 +
      " " +
      x2 +
      "," +
      y3 +
      " " +
      x3 +
      "," +
      y2 +
      " " +
      x2 +
      "," +
      y1 +
      " " +
      x1 +
      "," +
      y1 +
      " "
    );
  };

  var yaxistext = yaxislabels.selectAll("text").data(options.yaxis);
  yaxistext
    .enter()
    .append("text")
    .attr("x", function (d) {
      return xaxisScale(0) - xaxisScale.bandwidth() - margin.left / 2;
    })
    .attr("y", function (d) {
      return yaxisScale(d) + yaxisScale.bandwidth() / 2;
    })
    .attr("text-anchor", "middle")
    .attr("font-size", ".8em")
    .attr("dominant-baseline", "central")
    .text(function (d) {
      return d;
    });

  var yaxispolygons = yaxislabels.selectAll("polygon").data(options.yaxis);
  yaxispolygons
    .enter()
    .append("polygon")
    .attr("points", function (d) {
      return yAxisTagPoints(d);
    })
    .attr("fill", "transparent")
    .attr("stroke", "#e5e5e5")
    .on("mouseover", function (d) {
      // Change style
      d3.select(this)
        .attr("stroke-width", "2px")
        .attr("stroke", "black");
    })
    .on("mouseout", function (d) {
      // Reset to original
      d3.select(this)
        .attr("stroke-width", "1px")
        .attr("stroke", "#e5e5e5");
    });

  // x-axis tags
  var xAxisTagPoints = function (tp) {
    var x1 = xaxisScale(tp) + 1,
      x2 = xaxisScale(tp) + xaxisScale.bandwidth() / 2,
      x3 = xaxisScale(tp) + xaxisScale.bandwidth() - 1,
      y1 = 0,
      y2 = y1 + 5,
      y3 = y1 + 20;
    return (
      x1 +
      "," +
      y3 +
      " " +
      x1 +
      "," +
      y2 +
      " " +
      x2 +
      "," +
      y1 +
      " " +
      x3 +
      "," +
      y2 +
      " " +
      x3 +
      "," +
      y3 +
      " "
    );
  };

  var xaxis = xaxislabels.selectAll("labels").data(options.xaxis);

  if (svg.select("#xaxis-title").empty()) {
    xaxis
      .enter()
      .append("text")
      .attr("x", function (d) {
        return xaxisScale(d) + xaxisScale.bandwidth() / 2;
      })
      .attr("y", function (d) {
        return 17;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", ".8em")
      .text(function (d) {
        return d;
      });

    xaxis
      .enter()
      .append("polygon")
      .attr("points", function (d) {
        return xAxisTagPoints(d);
      })
      .attr("fill", "transparent")
      .attr("stroke", "#e5e5e5")
      .on("mouseover", function (d) {
        // Change style
        d3.select(this)
          .attr("stroke-width", "2px")
          .attr("stroke", "black");
      })
      .on("mouseout", function (d) {
        // Reset to original
        d3.select(this)
          .attr("stroke-width", "1px")
          .attr("stroke", "#e5e5e5");
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
    .attr("x", function (d) {
      return xaxisScale(d.timepoint);
    })
    .attr("width", xaxisScale.bandwidth() - 1)
    .attr("y", function (d) {
      return yaxisScale(d.assay);
    })
    .attr("height", yaxisScale.bandwidth() - 1)
    .attr("id", function (d) {
      return d.id;
    })
    .style("fill", function (d) {
      return colorScale(d.participantCount);
    })
    .attr("stroke-width", "1px")
    .attr("stroke", function (d) {
      if (selected.includes(this.id)) {
        return "#111111";
      } else {
        return "transparent";
      }
    })
    .on("mouseover", function (d, i) {
      // Tooltip coordinates
      var r = coord.right - margin.left - coord.x - xaxisScale(d.timepoint);
      var t =
        coord.top + margin.top + yaxisScale(d.assay) + yaxisScale.bandwidth();
      // Change style
      d3.select(this)
        .attr("stroke-width", "3px")
        .attr("stroke", "black")
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
        .style("right", r - (xaxisScale.bandwidth() / 2 - 5) + "px")
        .style("top", t - yaxisScale.bandwidth() - 12 + "px");
      tooltip
        .html(
          d.participantCount +
          " participants <br>" +
          d.studyCount +
          " studies <br>" +
          d.assay +
          " at day " +
          d.timepoint
        )
        .style("right", r - xaxisScale.bandwidth() / 2 + "px")
        .style("top", t - yaxisScale.bandwidth() - 50 - 12 + "px");
    })
    .on("mouseout", function (d) {
      // Reset to original
      d3.select(this)
        .attr("stroke-width", "1px")
        .attr("stroke", function (d) {
          if (selected.includes(this.id)) {
            return "#111111";
          } else {
            return "transparent";
          }
        })
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
      var id = this.id;
      props.handleClick(id);
    });

  boxes
    .transition()
    .duration(100)
    .attr("x", function (d) {
      return xaxisScale(d.timepoint);
    })
    .attr("width", xaxisScale.bandwidth() - 1)
    .attr("y", function (d) {
      return yaxisScale(d.assay);
    })
    .attr("height", yaxisScale.bandwidth() - 1)
    .attr("id", function (d, i) {
      return d.id;
    })
    .style("fill", function (d) {
      if (selected.includes(this.id)) {
        return "#fff766";
      } else {
        return colorScale(d.participantCount);
      }
    })
    .attr("stroke", function (d) {
      if (selected.includes(this.id)) {
        return "#111111";
      } else {
        return "transparent";
      }
    });

  yaxistext
    .transition()
    .duration(0)
    .attr("x", function (d) {
      return xaxisScale(0) - xaxisScale.bandwidth() - margin.left / 2;
    })
    .attr("y", function (d) {
      return yaxisScale(d) + yaxisScale.bandwidth() / 2;
    })
    .attr("text-anchor", "middle")
    .attr("font-size", ".8em")
    .attr("dominant-baseline", "central")
    .text(function (d) {
      return d;
    });
  yaxispolygons
    .transition()
    .duration(0)
    .attr("points", function (d) {
      return yAxisTagPoints(d);
    })
    .attr("fill", "transparent")
    .attr("stroke", "#e5e5e5");

  boxes.exit().remove();
  yaxistext.exit().remove();
  yaxispolygons.exit().remove();
}