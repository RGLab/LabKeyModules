import {categoricalLabels, LABELS} from "./constants"
import {ScatterPlotProps, ScatterPlotDatum, ScatterPlotDataRange} from "../PlotComponents/similarStudyScatterPlot"

function makePropsWithIndex (data, label, dataType, dataRange, labkeyBaseUrl, index, ){
    // For plotting categorical values, ensure that colored dots
    // are plotted last to be visually on top by having them plot last
    data.sort((a,b) => 
        (a[dataType][label] > b[dataType][label]) ? 1 : -1
    )

    // deep copy to ensure sort stays put
    const sortedData = {...data};

    const plotProps: ScatterPlotProps = {
        data: sortedData,
        name: label,
        width: 300,
        height: 300,
        dataRange: dataRange,
        linkBaseText: labkeyBaseUrl + "/project/Studies/",
        colorIndex: index,
        categoricalVar: categoricalLabels.includes(label),
        dataType: getLabelType(label)
    }
    
    return(plotProps)
}

const getLabelType = (label) => {
    if(LABELS.assays.includes(label)){
        return("assays")
    }else if(LABELS.condition.includes(label)){
        return("condition")
    }else{
        return("studyDesign")
    }
}

interface SSPlotPropList {
    [key: string]: ScatterPlotProps[];
}

export const createSsPlotPropsList = (
  transformedSsData: ScatterPlotDatum[],
  ssDataRange: ScatterPlotDataRange,
  labkeyBaseUrl: string
): SSPlotPropList => {
  const ssPlotPropsList: SSPlotPropList = {};
  Object.keys(LABELS).forEach(function (key) {
    const subList: ScatterPlotProps[] = [];
    LABELS[key].forEach((label, index) => {
      subList.push(
        makePropsWithIndex(
          transformedSsData,
          label,
          key,
          ssDataRange,
          labkeyBaseUrl,
          index
        )
      );
    });
    ssPlotPropsList[key] = subList;
  });

  return ssPlotPropsList;
};