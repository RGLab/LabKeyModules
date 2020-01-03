import * as React from 'react';
import { drawHeatmap } from "./d3/HeatmapSelector.d3"
import { HeatmapDatum, Filter,IAssayData, CubeDatum, SelectedFilter } from '../../typings/CubeData';
import { Cube } from '../../typings/Cube';
import { Axis } from 'd3';

// React stuff ==================================== //


export interface HeatmapProps {
  data: HeatmapDatum<Filter>[];
  name: string;
  width: number;
  height: number;
  xaxis: { label: string; data: Filter }[];
  yaxis: { label: string; data: Filter }[]
  breaks: number[];
  colors: string[];
  selected: {[index: string]: {[index: string]: SelectedFilter}|SelectedFilter};
  handleClick: (d: Filter) => void
}

interface HeatmapSelectorProps {
  data: IAssayData;
  filterClick: (dim: string, filter: Filter) => () => void
  showSampleType: boolean;
  selected: {[index: string]: {[index: string]: SelectedFilter}|SelectedFilter}
}

export interface AxisDatum<data> {
  label: string,
  data: data
}

// helpers
const createHeatmapData = (data: IAssayData, showSampleType: boolean) => {
  // if (data.assay.timepoint.length > 0) debugger;
  let d: CubeDatum[];
  let heatmapData: HeatmapDatum<Filter>[];
  if (showSampleType) {
    d = data.assay.sampleType
    heatmapData = d.map((cd) => {
      const m = cd.member.split(/\./)
      const l = cd.level.split(/\./)
      const timepoint = m[l.indexOf("timepoint")]
      const assay = m[l.indexOf("assay")]
      const sampleType = m[l.indexOf("sampleType")]
      return {
        x: timepoint,
        y: assay + " (" + sampleType + ")",
        count: cd.count,
        data: {
          level: cd.level,
          member: cd.member
        }
      }
    })
  } else {
    d = data.assay.timepoint
    heatmapData = d.map((cd) => {
      const m = cd.member.split(/\./)
      const l = cd.level.split(/\./)
      const timepoint = m[l.indexOf("timepoint")]
      const assay = m[l.indexOf("assay")]
      return {
        x: timepoint,
        y: assay,
        count: cd.count,
        data: {
          level: cd.level,
          member: cd.member
        }
      }
    })
  }
  return(heatmapData)
}

const createAxisData = (data: IAssayData, axis: string, showSampleType: boolean) => {
  // debugger;
  let d: CubeDatum[]
  let axisData: AxisDatum<Filter>[];
  if (axis == "x") {
    const d = data.timepoint
    axisData = d.map((cd) => {return({label: cd.member, data: {level: cd.level, member: cd.member}})})
  } else if (axis == "y") {
    if (showSampleType) {
      const d = data.assay.sampleType
      
    } else {
      const d = data.assay.assay
      axisData = d.map((cd) => {return({label: cd.member, data: {level: cd.level, member: cd.member}})})
    }
  }

  axisData.sort((a, b) => {
    if (a.label == b.label) return 0;
    if (a.label > b.label) return 1;
    if (a.label < b.label) return -1;
  })

  return(axisData)
}


export const HeatmapSelector: React.FC<HeatmapSelectorProps> = (props) => {
  // debugger;
  
  // Transform data into appropriate format
  const heatmapData: HeatmapDatum<Filter>[] = createHeatmapData(props.data, props.showSampleType)
  const xaxisData: AxisDatum<Filter>[] = createAxisData(props.data, "x", props.showSampleType)
  const yaxisData: AxisDatum<Filter>[] = createAxisData(props.data, "y", props.showSampleType)

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

  function handleClick(d: Filter) {
      props.filterClick("data", d)()
  }



  return (
    <div>
      <Heatmap
        data={heatmapData}
        name={"heatmap"}
        height={250}
        width={800}
        xaxis={xaxisData}
        yaxis={yaxisData}
        breaks={options.breaks}
        colors={options.colors}
        handleClick={handleClick}
        selected={props.selected}
      />
    </div>
  );
}

function Heatmap(props: HeatmapProps) {
  React.useEffect(() => {
      drawHeatmap(props);
  });

  return <div className={props.name} />;
}