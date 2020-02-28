import * as React from 'react';
import { drawAssayTimepointViewer } from "./d3/AssayTimepointViewer.d3"
import { HeatmapDatum, Filter, IAssayData, CubeDatum, FilterCategory, SelectedFilter, } from '../../typings/CubeData';
import { Cube } from '../../typings/Cube';
import { Axis } from 'd3';
import { Map, List } from 'immutable'

// React stuff ==================================== //


export interface AssayTimepointViewerProps {
  data: HeatmapDatum<Filter>[];
  name: string;
  width: number;
  height: number;
  xaxis: AxisDatum<Filter>[];
  yaxis: AxisDatum<Filter>[]
  breaks: number[];
  colors: string[];
  selected: Map<string, Map<string, SelectedFilter> | SelectedFilter>
  showSampleType: boolean
}

interface AssayTimepointViewerContainerProps {
  name: string,
  data: IAssayData;
  showSampleType: boolean;
  selected: Map<string, Map<string, SelectedFilter> | SelectedFilter>;
  timepointCategories: FilterCategory[];
  sampleTypeAssayCategories: FilterCategory[];
}

export interface AxisDatum<data> {
  label: string,
  participantCount: number;
  studyCount: number;
  data: data
}

// helpers
const createHeatmapData = (data: IAssayData, showSampleType: boolean, sampleTypeAssayCategories = []) => {
  // if (data.Assay.Timepoint.length > 0) debugger;
  let d: CubeDatum[];
  let heatmapData: HeatmapDatum<Filter>[];
  if (showSampleType) {
    // debugger
    d = data.Assay.SampleType
    heatmapData = d.map((cd) => {
      const m = cd.member.split(/\./)
      const timepoint = m[1]
      const assay = m[0]
      const sampleType = m[2]
      return {
        x: timepoint,
        y: assay + " (" + sampleType + ")",
        participantCount: cd.participantCount === null ? 0 : cd.participantCount,
        studyCount: cd.studyCount === null ? 0 : cd.studyCount,
        data: {
          level: cd.level,
          member: cd.member
        }
      }
    })
  } else {
    d = data.Assay.Timepoint
    heatmapData = d.map((cd) => {
      const m = cd.member.split(/\./)
      const l = cd.level.split(/\./)
      const timepoint = m[l.indexOf("Timepoint")]
      const assay = m[l.indexOf("Assay")]
      return {
        x: timepoint,
        y: assay,
        participantCount: cd.participantCount === null ? 0 : cd.participantCount,
        studyCount: cd.studyCount === null ? 0 : cd.studyCount,
        data: {
          level: cd.level,
          member: cd.member
        }
      }
    })
  }
  const removeIndices = []
  heatmapData.forEach((d, i) => {
    // if (showSampleType) debugger
    if (d.x == "Unknown" || (showSampleType && sampleTypeAssayCategories.indexOf(d.y) == -1)) removeIndices.push(i)
  })
  removeIndices.reverse().forEach((i) => {
    heatmapData.splice(i, 1)
  })
  return (heatmapData)
}

const createAxisData = (data: IAssayData, axis: string, showSampleType: boolean, categories: FilterCategory[] = null) => {
  // debugger;
  let d: CubeDatum[]
  let axisData: AxisDatum<Filter>[];
  if (axis == "x") {
    axisData = categories.map((c) => {
        let participantCount, studyCount
        data.Timepoint.forEach(cd => {
            if (cd.member == c.label) {
                participantCount = cd.participantCount
                studyCount = cd.studyCount
            }           
        })
      return({
        label: c.label, 
        participantCount: participantCount,
        studyCount: studyCount,
        data: {level: "Timepoint", member: c.label}
      })
    })
    axisData.pop() // remove "unknown"
  } else if (axis == "y") {
    if (showSampleType) {
      const getAxisText = member => (member.split(/\./)[1] + " (" + member.split(/\./)[0] + ")")
      axisData = categories.map((c) => {
        let participantCount, studyCount
        data.Assay.Assay.forEach(cd => {
            if (cd.member == c.label) {
                participantCount = cd.participantCount
                studyCount = cd.studyCount
            }           
        })
        return({
          label: getAxisText(c.label), 
          participantCount: participantCount,
          studyCount: studyCount,
          data: {level: "SampleType.Assay", member: c.label}
        })
      })
    } else {
      d = data.Assay.Assay
      axisData = d.map((cd) => { return ({ 
          label: cd.member, 
          participantCount: cd.participantCount,
          studyCount: cd.studyCount,
          data: { level: cd.level, member: cd.member } }) })
    }
    axisData.sort((a, b) => {
      if (a.label == b.label) return 0;
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
    })
  }



  return (axisData)
}


export const AssayTimepointViewerContainer: React.FC<AssayTimepointViewerContainerProps> = ({data, showSampleType, selected, timepointCategories, sampleTypeAssayCategories, name}) => {
  // debugger;

  // Transform data into appropriate format

  const xaxisData: AxisDatum<Filter>[] = createAxisData(data, "x", showSampleType, timepointCategories)
  const yaxisData: AxisDatum<Filter>[] = createAxisData(data, "y", showSampleType, sampleTypeAssayCategories)
  const heatmapData: HeatmapDatum<Filter>[] = createHeatmapData(data, showSampleType, yaxisData.map(e => e.label))
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
    ]
  }
  const height = yaxisData.length * 17 + 55
  return (
    <div>
      <AssayTimepointViewer
        data={heatmapData}
        name={name}
        height={height}
        width={800}
        xaxis={xaxisData}
        yaxis={yaxisData}
        breaks={options.breaks}
        colors={options.colors}
        selected={selected}
        showSampleType={showSampleType}
      />
    </div>
  );
}

function AssayTimepointViewer(props: AssayTimepointViewerProps) {
  React.useEffect(() => {
    drawAssayTimepointViewer(props);
  });

  return <>
    <div className={props.name} />
  </>;
}