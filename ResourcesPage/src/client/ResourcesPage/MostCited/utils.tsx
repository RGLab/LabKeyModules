import {
  BarPlotProps,
  BarPlotTitles,
} from "../PlotComponents/mostCitedBarPlot";

import { TransformedPmData, PmDataRange } from "../StudyStatsTransformationFunctions";

export const updatePmPlotData = (
  transformedPmData: TransformedPmData,
  pmDataRange: PmDataRange,
  pmOrderBy: string
): BarPlotProps => {
  const copy = JSON.parse(JSON.stringify(transformedPmData)); // is this necessary 
  copy.byPubId.sort((a, b) => (a[pmOrderBy] > b[pmOrderBy] ? 1 : -1));

  const titles: BarPlotTitles = {
    x: "Number of Citations",
    y: "Study and PubMed Id",
    main: "Number of Citations by PubMed Id",
  };
  const plotProps: BarPlotProps = {
    data: copy.byPubId,
    titles: titles,
    name: "byPubId",
    width: 850,
    height: copy.byPubId.length * 12 + 80,
    dataRange: pmDataRange.byPubId,
    linkBaseText: "https://www.ncbi.nlm.nih.gov/pubmed/",
  };

  return plotProps;
};
