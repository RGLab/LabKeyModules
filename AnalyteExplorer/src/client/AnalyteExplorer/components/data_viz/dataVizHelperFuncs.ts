import { D3LineData } from "./d3/LinePlot.d3";

// transforms input data into format suitable for the line plot, also seperate data for trend line from cohorts
export const setupLinePlotData = (
  data: Map<string, { x: number; y: number; study: string }[]>
): D3LineData[][] => {
  let cohortData: D3LineData[] = [];
  let trendData: D3LineData[] = [];
  for (const [cohort, linePoints] of data) {
    if (linePoints.length > 0) {
      const formattedData = {
        name: cohort,
        study: linePoints[0].study,
        data: linePoints.sort((a, b) => a.x - b.x),
      };
      if (cohort === "Average") {
        trendData.push(formattedData);
      }
      cohortData.push(formattedData);
    }
  }

  // lineData contains trendData because it makes it easier to draw
  return [cohortData, trendData];
};
