import React, { CSSProperties } from "react";
//import { TestPlot } from "./d3/Test.d3";
import { D3LinePlot, D3LinePlotConfig } from "./d3/LinePlot.d3";
import { StudyPoint } from "./d3/LinePlot.d3";
import LinePlotTooltip from "./LinePlotTooltip";
import * as d3 from "d3";

export interface LinePlotProps {
  data: Map<string, { x: number; y: number; study: string }[]>;
  name: string;
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
}

const LinePlot: React.FC<LinePlotProps> = ({
  data,
  name,
  width,
  height,
  xLabel,
  yLabel,
}) => {
  const linePlotStyles: CSSProperties = {
    width: width,
    height: height,
  };

  const setupData = (
    data: Map<string, { x: number; y: number; study: string }[]>
  ): { name: string; study: string; data: StudyPoint[] }[][] => {
    let linedData: { name: string; study: string; data: StudyPoint[] }[] = [];
    let trendData: { name: string; study: string; data: StudyPoint[] }[] = [];
    for (const [cohort, linePoints] of data) {
      if (linePoints.length > 0) {
        const formattedData = {
          name: cohort,
          study: linePoints[0].study,
          data: linePoints.sort((a, b) => a.x - b.x),
        };
        if (cohort === "Average") {
          trendData.push(formattedData);
        }
        linedData.push(formattedData);
      }
    }

    return [linedData, trendData];
  };

  function randomLetters() {
    return d3
      .shuffle("abcdefghijklmnopqrstuvwxyz".split(""))
      .slice(0, Math.floor(1 + Math.random() * 20))
      .sort();
  }

  // const randomizeData = () => {
  //   TestPlot.create(randomLetters());
  // };

  React.useEffect(() => {
    const [formattedLineData, formattedTrendData] = setupData(data);
    D3LinePlot.create(
      name,
      formattedLineData,
      {
        width: width,
        height: height,
        xLabel: xLabel,
        yLabel: yLabel,
      },
      formattedTrendData
    );
  }, []);

  // React.useEffect(() => {
  //   //const args = setup(props)
  //   //D3LinePlot.update(name, [], { width: 1000, height: 100 });
  //   const formattedData = setupData(data);
  //   D3LinePlot.update(name, formattedData, {
  //     width: width,
  //     height: height,
  //     xLabel: xLabel,
  //     yLabel: yLabel,
  //   });
  // }, [data]);

  // React.useEffect(() => {
  //   TestPlot.create(randomData);
  // }, [randomData]);

  return (
    <div className={name} style={{ position: "relative", height: "1000px" }}>
      <div className="df-lineplot-title">
        <h4>{name}</h4>
      </div>
      <div
        id={"lineplot-container-" + name}
        className="lineplot-barplot"
        style={linePlotStyles}>
        <svg></svg>
      </div>
      <LinePlotTooltip name={name} />
    </div>
  );

  // return (
  //   <div>
  //     <button onClick={randomizeData}>Randomize</button>
  //     <div id="testplot-container">
  //       <svg></svg>
  //     </div>
  //   </div>
  // );
};

export default LinePlot;
