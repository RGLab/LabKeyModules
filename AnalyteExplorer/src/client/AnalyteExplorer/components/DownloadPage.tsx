import React from "react";
import AnalyteMetadataBox from "./AnalyteMetadataBox";
import { CSVLink } from "react-csv";
import { Spinner } from "react-bootstrap";

import LinePlot, { LinePlotProps } from "./data_viz/LinePlot";
import { ErrorMessageDownload } from "./ErrorMessage";
import "./DownloadPage.scss";

interface DownloadPageProps {
  data: any;
  filters: string[];
  errorMsg?: string;
}

interface RowData {
  analyte_id: string;
  analyte_type: string;
  cohort: string;
  condition: string;
  id: number;
  mean_fold_change: number;
  sample_type: string;
  sd_fold_change: number;
  study_accession: string;
  timepoint: number;
}

const getAverage = (numArr: number[]): number => {
  if (numArr !== undefined && numArr !== null) {
    let sum = 0;
    if (numArr.length === 0) {
      return sum;
    }
    for (const num of numArr) {
      sum += num;
    }
    return sum / numArr.length;
  }
  return null;
};

const DownloadPage: React.FC<DownloadPageProps> = ({
  data,
  filters,
  errorMsg,
}) => {
  if (data === null && errorMsg !== "") {
    return <ErrorMessageDownload />;
  }

  console.log(data);

  let dataByFilter: { [filter: string]: RowData[] } = {};

  for (const current of data.rows) {
    if (current !== undefined && current["condition"] !== undefined) {
      if (dataByFilter[current["condition"]] === undefined) {
        dataByFilter[current["condition"]] = [current];
      } else {
        dataByFilter[current["condition"]].push(current);
      }
    }
  }

  // already filtered
  const organizeD3Data = (
    condition: string,
    data: RowData[]
  ): LinePlotProps => {
    let dataMap = new Map<string, { x: number; y: number; study: string }[]>();
    let avgMap = new Map<number, number[]>();
    for (const {
      cohort,
      timepoint,
      mean_fold_change,
      study_accession,
    } of data) {
      if (dataMap.get(cohort) === undefined) {
        dataMap.set(cohort, [
          { x: timepoint, y: mean_fold_change, study: study_accession },
        ]);
      } else {
        dataMap.set(cohort, [
          { x: timepoint, y: mean_fold_change, study: study_accession },
          ...dataMap.get(cohort),
        ]);
      }

      if (avgMap.get(timepoint) === undefined) {
        avgMap.set(timepoint, [mean_fold_change]);
      } else {
        avgMap.set(timepoint, [mean_fold_change, ...avgMap.get(timepoint)]);
      }
    }

    let avgLineData: { x: number; y: number; study: string }[] = [];

    for (const [timepoint, yS] of avgMap) {
      avgLineData.push({ x: timepoint, y: getAverage(yS), study: "Trend" });
    }

    dataMap.set("Average", avgLineData);

    const aeMainWidth = (document.querySelector("#ae-main") as HTMLElement)
      .offsetWidth;

    return {
      name: condition,
      data: dataMap,
      xLabel: "timepoint",
      yLabel: "mean fold change",
      width: 1500,
      height: 700,
    };
  };

  const d3DataByFilters = Object.entries(dataByFilter).map(([filter, data]) => {
    return organizeD3Data(filter, data);
  });

  console.log(d3DataByFilters);

  //console.log((document.querySelector("#ae-main") as HTMLElement).offsetWidth);

  return (
    <div className="ae-download-content">
      <CSVLink data={data.rows}>Download Me!</CSVLink>
      {d3DataByFilters.map((d3Data) => {
        return (
          <LinePlot
            data={d3Data.data}
            name={d3Data.name}
            xLabel={d3Data.xLabel}
            yLabel={d3Data.yLabel}
            width={d3Data.width}
            height={d3Data.height}
          />
        );
      })}
    </div>
  );
};

export default DownloadPage;
