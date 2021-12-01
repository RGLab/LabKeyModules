import React from "react";
import { tooltipStyle } from "./dataVizConstants";

interface LinePlotTooltipProps {
  name: string;
}

const LinePlotTooltip: React.FC<LinePlotTooltipProps> = ({ name }) => {
  return <div id={`tooltip-${name}`} style={tooltipStyle}></div>;
};

export default LinePlotTooltip;
