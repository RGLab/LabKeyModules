import React from "react";
import { ResponsiveLine, PointTooltip, PointTooltipProps } from "@nivo/line";
import "./AnalyteLinePlot.scss";
//import { graphData } from "./mockData";

interface LinePlotProps {
  data: any;
}

const CustomToolTip: PointTooltip = ({ point }) => {
  return <div>{`x: ${point.x}`}</div>;
};

const MyResponsiveLine = (data) => {
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      colors={{ datum: "color" }}
      xScale={{ type: "linear" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "timepoint",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "mean fold change",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      pointSize={6}
      // pointColor={{ theme: "background" }}
      pointBorderWidth={0}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      tooltip={CustomToolTip}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

const AnalyteLinePlot: React.FC<LinePlotProps> = ({ data }) => {
  return <div className="ae-plot-container">{MyResponsiveLine(data)}</div>;
};

export default AnalyteLinePlot;
