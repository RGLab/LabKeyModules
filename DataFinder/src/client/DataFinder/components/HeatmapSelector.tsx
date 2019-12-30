import * as React from 'react';
import { drawHeatmap } from "./d3/HeatmapSelector.d3"
import { HeatmapDatum, Filter,IAssayData } from '../../typings/CubeData';
import { HeatmapProps } from "../../typings/Components"

// React stuff ==================================== //

interface HeatmapSelectorProps {
  data: IAssayData;
  filterClick: (dim: string, filter: Filter) => void
}


export const HeatmapSelector: React.FC<HeatmapSelectorProps> = (props) => {
  // debugger;
  const [selected, setSelected] = React.useState([]);

  const options = {
    "breaks": [
      1,
      10,
      50,
      100,
      500,
      1000
    ],
    "colors": [
      "#FFFFFF",
      "#EDF8E9",
      "#C7E9C0",
      "#A1D99B",
      "#74C476",
      "#41AB5D",
      "#238B45",
      "#005A32"
    ],
    "xaxis": [
      "<0",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15-27",
      "28",
      "29-55",
      "56",
      ">56"
    ],
    "yaxis": [
      "PCR",
      "Neutralizing Antibody",
      "MBAA",
      "HLA Typing",
      "HAI",
      "Gene Expression",
      "Flow Cytometry",
      "ELISPOT",
      "ELISA",
      "CyTOF"
    ],
    "selected": []
  }

  function handleClick(d: HeatmapDatum) {
    const level = d.level
    const member = d.member

      props.filterClick("data", { level: level, member: member })
  }

  function clearSelection() {
    setSelected([]);
  }


  return (
    <div>
      <Heatmap
        data={props.data.timepoint}
        name={"heatmap"}
        height={250}
        width={800}
        xaxis={[]}
        yaxis={[]}
        breaks={[]}
        colors={[]}
        selected={selected}
        handleClick={handleClick}
      />

      <button onClick={clearSelection}>Clear Selection</button>
    </div>
  );
}

function Heatmap(props: HeatmapProps) {
  React.useEffect(() => {
      drawHeatmap(props);
  });

  return <div className={props.name} />;
}