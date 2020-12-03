import * as React from 'react';
import { drawAssayTimepointViewer } from "./d3/AssayTimepointViewer.d3"
import { HeatmapDatum, Filter, IAssayData, PlotDatum, FilterCategory, } from '../../typings/CubeData';
import { samplePalette } from '../helpers/colors'

import "./AssayTimepointViewer.scss"

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
  showSampleType: boolean
}

interface AssayTimepointViewerContainerProps {
  name: string,
  data: IAssayData;
  timepointCategories: FilterCategory[];
  sampleTypeAssayCategories: FilterCategory[];
}

export interface AxisDatum<data> {
  label: string,
  participantCount: number;
  studyCount: number;
  data: data
}

interface LegendProps {
  labels: string[];
  colors: string[];
  title: string;
  width: number;
}

// helpers
const createHeatmapData = (data: IAssayData, showSampleType: boolean, sampleTypeAssayCategories = []) => {
  // if (data.Assay.Timepoint.length > 0) debugger;
  let d: PlotDatum[];
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
  let d: PlotDatum[]
  let axisData: AxisDatum<Filter>[];
  if (axis == "x") {
    axisData = categories.map((c) => {
        let participantCount, studyCount
        data.Timepoint.Timepoint.forEach(cd => {
            if (cd.member == c.label) {
              participantCount = cd.participantCount === null ? 0 : cd.participantCount
              studyCount = cd.studyCount === null ? 0 : cd.studyCount
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
              participantCount = cd.participantCount === null ? 0 : cd.participantCount
              studyCount = cd.studyCount === null ? 0 : cd.studyCount
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
          participantCount : cd.participantCount === null ? 0 : cd.participantCount,
          studyCount : cd.studyCount === null ? 0 : cd.studyCount,
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


export const AssayTimepointViewerContainer: React.FC<AssayTimepointViewerContainerProps> = ({data, timepointCategories, sampleTypeAssayCategories, name}) => {
  const [showSampleType, setShowSampleType] = React.useState(false)

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
    "colors": samplePalette
  }
  const height = yaxisData.length * 17 + 55
  return (
    <div>
      <div className="df-barplot-title">
        <h4 >Assay by Study Day</h4>
        
        </div>
      
      <AssayTimepointViewer
        data={heatmapData}
        name={name}
        height={height}
        width={800}
        xaxis={xaxisData}
        yaxis={yaxisData}
        breaks={options.breaks}
        colors={options.colors}
        showSampleType={showSampleType}
      />
      <Legend2 labels={["0", "1-9", "10-49", "50-99", "100-499", "500-999", ">1000"]} colors={options.colors} title="Number of Participants " width={300}/>
    </div>
  )
}

const Legend: React.FC<LegendProps> = ({labels, colors, title, width}) => {
  return <div className="df-legend">
  
  <table style={{}}>
    <tr>
      <td className={"legend-label"}><span>{title}</span></td>
      {
        labels.map((l) => {
          return(<td className={"legend-label"}>{l}</td>)
        })
      }
    </tr>
    <tr>
      <td></td>
      {
        colors.map((color) => {
          return(<td className={"legend-color"} style={{backgroundColor: color, width: width/colors.length}}></td>)
        })
      }
    </tr>
    
  </table>
  </div>
}

const Legend2: React.FC<LegendProps> = ({labels, colors, title, width}) => {
  return <div className="df-legend2">
  
  <span className="legend2-label">{title}</span>
  <table >
    {colors.map((c, i) => {
      return(
        <tr>
          <td className="legend2-color" style={{backgroundColor: c}}></td>
          <td className={"legend2-label"} >{labels[i]}</td>
        </tr>
      )
    })}
    
  </table>
  </div>
}

function AssayTimepointViewer(props: AssayTimepointViewerProps) {
  React.useEffect(() => {
    drawAssayTimepointViewer(props);
  });

  return <>
    <div className={props.name} style={{display: "inline-block"}}/>
  </>
}