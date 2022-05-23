import {
  MaBarPlotDatum,
  MaBarPlotProps,
  MaLinePlotDatum,
  MaLinePlotProps,
  MaPlotTitles,
} from "../PlotComponents/mostAccessedPlots";

import { TransformedMaData } from "../StudyStatsTransformationFunctions";

export function createLinePlotProps(
  data: TransformedMaData["byMonth"]
): MaLinePlotProps {
  // logic for updating titles
  const lineTitles: MaPlotTitles = {
    x: "Date",
    y: "Number of User Interactions",
    main: "ImmuneSpace Usage over Time",
  };

  const lineData = [];
  const lineLabels = [];
  data.forEach((element) => {
    const datum: MaLinePlotDatum = {
      UI: element["UI"],
      ISR: element["ISR"],
      total: element["total"],
    };
    lineData.push(datum);
    lineLabels.push(element["date"]);
  });

  // logic for updating props
  const lineProps: MaLinePlotProps = {
    data: lineData,
    titles: lineTitles,
    labels: lineLabels,
    name: "byMonth",
    width: 1100,
    height: 600,
    linkBaseText: "test month",
  };

  return lineProps;
}

export const createBarPlotProps = (
  data: TransformedMaData["byStudy"],
  order: string,
  labkeyBaseUrl: string
): MaBarPlotProps => {
  // Remove zero values to avoid odd looking chart since sorting is done
  // using a quicksort that leaves secondary sort in groups
  // this deep clone is necessary as shallowclone does not work
  const tmp = JSON.parse(JSON.stringify(data));
  const tmpStudyData = tmp.filter((el) => el[order] > 10); // is this necessary
  tmpStudyData.sort((a, b) => (a[order] > b[order] ? 1 : -1));

  // logic for updating titles
  const barTitles: MaPlotTitles = {
    x: "Number of User Interactions",
    y: "Study Id",
    main: "ImmuneSpace Usage by ImmuneSpaceR API and UI",
  };

  const barData = [];
  const barLabels = [];
  tmpStudyData.forEach((element) => {
    const datum: MaBarPlotDatum = {
      UI: element["UI"],
      ISR: element["ISR"],
      total: element["total"],
    };
    barData.push(datum);
    barLabels.push(element["study"]);
  });

  // logic for updating props
  const barProps: MaBarPlotProps = {
    data: barData,
    labels: barLabels,
    titles: barTitles,
    name: "byStudy",
    width: 700,
    height: barData.length * 10 + 80,
    linkBaseText: labkeyBaseUrl + "/project/Studies/",
  };

  return barProps;
};
