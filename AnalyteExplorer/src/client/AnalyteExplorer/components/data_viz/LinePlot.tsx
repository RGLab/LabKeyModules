import React, { CSSProperties } from "react";
import { D3LinePlot, D3LineData } from "./d3/LinePlot.d3";
import LinePlotTooltip from "./LinePlotTooltip";
import "./LinePlot.scss";

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
    width: "100%",
  };

  // transforms input data into format suitable for the line plot, also seperate data for trend line from cohorts
  const setupData = (
    data: Map<string, { x: number; y: number; study: string }[]>
  ): D3LineData[][] => {
    let cohortData: D3LineData[] = [];
    let trendData: D3LineData[] = [];
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
        cohortData.push(formattedData);
      }
    }

    // lineData contains trendData because it makes it easier to draw
    return [cohortData, trendData];
  };

  React.useEffect(() => {
    const [formattedCohortData, formattedTrendData] = setupData(data);

    D3LinePlot.create(
      name,
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
      className={name}
      style={{
        position: "relative",
        margin: "5px 10px",
      }}>
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
};

export default LinePlot;
