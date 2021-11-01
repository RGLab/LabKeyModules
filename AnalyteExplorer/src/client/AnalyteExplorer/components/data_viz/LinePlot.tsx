import React, { CSSProperties } from "react";
import { D3LinePlot } from "./d3/LinePlot.d3";
import LinePlotTooltip from "./LinePlotTooltip";
import { setupLinePlotData } from "./dataVizHelperFuncs";
import "./LinePlot.scss";

export interface LinePlotProps {
  data: Map<
    string,
    {
      x: number;
      y: number;
      study: string;
      sd: number;
      sample: string;
      research: string;
    }[]
  >;
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
    position: "relative",
    width: "100%",
  };

  React.useEffect(() => {
    const [formattedCohortData, formattedTrendData] = setupLinePlotData(data);
    D3LinePlot.create(
      name.replaceAll(" ", "_"),
      formattedCohortData,
      {
        width: width,
        height: height,
        xLabel: xLabel,
        yLabel: yLabel,
      },
      formattedTrendData
    );
  }, []);

  return (
    <div
      className={name.replaceAll(" ", "_")}
      style={{
        position: "relative",
        margin: "5px 10px",
      }}>
      <div className="df-lineplot-title">
        <h4>{name}</h4>
      </div>
      <div
        id={"lineplot-container-" + name.replaceAll(" ", "_")}
        className="lineplot-barplot"
        style={linePlotStyles}>
        <svg></svg>
        <LinePlotTooltip name={name.replaceAll(" ", "_")} />
      </div>
    </div>
  );
};

export default LinePlot;
