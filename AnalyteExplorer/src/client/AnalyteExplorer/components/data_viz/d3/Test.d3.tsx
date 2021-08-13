import * as d3 from "d3";
//https://stackoverflow.com/questions/61040750/how-to-make-data-key-function-to-work-with-typescript

function randomLetters() {
  return d3
    .shuffle("abcdefghijklmnopqrstuvwxyz".split(""))
    .slice(0, Math.floor(1 + Math.random() * 20))
    .sort();
}

const createTestPlot = (data: string[]) => {
  console.log(data);
  const svg = d3
    .select("#testplot-container")
    .select("svg")
    .attr("viewBox", `0 0 ${500} ${500}`)
    .attr("id", "svg-testplot");
  //   const cirlces = svg.selectAll("circle").data(data);

  //   cirlces
  //     .join(
  //       (enter) => enter.append("circle").style("fill", "blue"),
  //       (update) =>
  //         update
  //           .transition()
  //           .duration(1000)
  //           .attr("transform", (d, i) => `translate(${10},${i * 30})`)
  //           .style("fill", "green")
  //           .selection(),
  //       (exit) =>
  //         exit
  //           .style("fill", "red")
  //           .transition()
  //           .duration(1000)
  //           .attr("transform", (d, i) => `translate(${100},${i * 30})`)
  //           .remove()
  //     )
  //     .attr("cx", (d) => d * 50)
  //     .attr("r", 10)
  //     .attr("cy", (d) => d * 50);
  let randomData = randomLetters();
  const t = svg.transition().duration(750);
  svg
    .selectAll("text")
    .data(data, (d) => "" + d)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("fill", "green")
          .attr("x", (d, i) => i * 16)
          .attr("y", 0)
          .text((d) => d)
          .call((enter) => enter.transition(t).attr("y", 30)),
      (update) =>
        update
          .attr("fill", "black")
          .attr("y", 30)
          .call((update) => update.transition(t).attr("x", (d, i) => i * 16)),
      (exit) =>
        exit
          .attr("fill", "brown")
          .call((exit) => exit.transition(t).attr("y", 60).remove())
    );
};

export const TestPlot = {
  create: createTestPlot,
};
