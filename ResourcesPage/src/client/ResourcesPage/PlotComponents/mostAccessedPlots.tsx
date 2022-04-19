import * as React from "react";
import { drawMaBarPlot, drawMaLinePlot } from "./d3/mostAccessedPlots.d3";

// Create Typing for bar plot data - need [key: string]: number 'Indexer' to allow
// for use of d3.stack() fn that stacks the bars. The indexer explains how the other
export interface MaBarPlotDatum {
  [key: string]: number;
  ISR: number;
  UI: number;
  total: number;
}

export interface MaPlotTitles {
  x: string;
  y: string;
  main: string;
}

export interface MaBarPlotProps {
  data: MaBarPlotDatum[];
  labels: string[];
  titles: MaPlotTitles;
  name: string;
  width: number;
  height: number;
  linkBaseText: string;
}

export interface MaLinePlotDatum {
  [key: string]: number;
  ISR: number;
  UI: number;
  total: number;
}

export interface MaLinePlotProps {
  data: MaLinePlotDatum[];
  labels: string[];
  titles: MaPlotTitles;
  name: string;
  width: number;
  height: number;
  linkBaseText: string;
}

// render the d3 barplot element
export const MaBarPlot: React.FC<MaBarPlotProps> = (props) => {
  // This will look for the id given by props.name to svg-element
  React.useEffect(() => {
    drawMaBarPlot(props);
  }, []);

  return (
    <div id={props.name}>
      <svg id={"ma-barplot-" + props.name}></svg>
    </div>
  );
};

export const MaLinePlot: React.FC<MaLinePlotProps> = (props) => {
  // This will look for the id given by props.name to svg-element
  React.useEffect(() => {
    drawMaLinePlot(props);
  }, []);

  return (
    <div id={props.name}>
      <svg id={"ma-lineplot-" + props.name}></svg>
    </div>
  );
};
