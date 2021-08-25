import React from "react";
import "./LinePlotTooltip.scss";

interface LinePlotTooltipProps {
  name: string;
}

const LinePlotTooltip: React.FC<LinePlotTooltipProps> = ({ name }) => {
  const style = {
    position: "absolute",
    backgroundColor: "white",
    border: "1px solid black",
    width: "auto",
    minWidth: "200px",
    height: "80px",
    padding: "3px 3px",
    display: "none",
  } as React.CSSProperties;
  return <div id={`tooltip-${name}`} style={style}></div>;
};

export default LinePlotTooltip;
