import React, { CSSProperties } from "react";
import { D3LinePlot, D3LinePlotConfig } from "./d3/LinePlot.d3";
import { Point } from "./d3/LinePlot.d3";

export interface LinePlotProps {
  data: Map<string, { x: number; y: number }[]>;
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

  React.useEffect(() => {
    let formattedData: { name: string; data: Point[] }[] = [];
    for (const [cohort, linePoints] of data) {
      formattedData.push({
        name: cohort,
        data: linePoints.sort((a, b) => a.x - b.x),
      });
    }
    D3LinePlot.create(name, formattedData, {
      width: width,
      height: height,
      xLabel: xLabel,
      yLabel: yLabel,
    });
  }, []);

  React.useEffect(() => {
    //const args = setup(props)
    //D3LinePlot.update(name, [], { width: 1000, height: 100 });
  }, [data]);

  return (
    <div className={name}>
      <div className="df-lineplot-title">
        <h4>{name}</h4>
      </div>
      <div
        id={"lineplot-container-" + name}
        className="lineplot-barplot"
        style={linePlotStyles}>
        <svg></svg>
      </div>
      <div id={"xaxis-" + name}>
        <svg></svg>
      </div>
    </div>
  );
};

export default LinePlot;
