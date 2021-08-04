import React from "react";
import AnalyteMetadataBox from "./AnalyteMetadataBox";
import { CSVLink } from "react-csv";

import LinePlot, { LinePlotProps } from "./data_viz/LinePlot";

interface DownloadPageProps {
  data: any;
  filters: string[];
}

interface NivoDataFormat {
  id: string;
  color: string;
  data: { x: number; y: number }[];
}

interface MultiConditionNivoDataFormat {
  [condition: string]: NivoDataFormat[];
}

interface DataSkeleton {
  [condition: string]: {
    [cohort: string]: NivoDataFormat;
  };
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

interface ReChartsDataFormat {
  x: number;
  [y: string]: number;
}

interface D3LineData {
  cohort: string;
  data: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
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

const DownloadPage: React.FC<DownloadPageProps> = ({ data, filters }) => {
  // let dataByFilter: { [filter: string]: [] } = filters.reduce(
  //   (skeleton, filter) => {
  //     skeleton[filter] = [];
  //     return skeleton;
  //   },
  //   {}
  // );

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
    let dataMap = new Map<string, { x: number; y: number }[]>();
    let avgMap = new Map<number, number[]>();
    for (const { cohort, timepoint, mean_fold_change } of data) {
      if (dataMap.get(cohort) === undefined) {
        dataMap.set(cohort, [{ x: timepoint, y: mean_fold_change }]);
      } else {
        dataMap.set(cohort, [
          { x: timepoint, y: mean_fold_change },
          ...dataMap.get(cohort),
        ]);
      }

      if (avgMap.get(timepoint) === undefined) {
        avgMap.set(timepoint, [mean_fold_change]);
      } else {
        avgMap.set(timepoint, [mean_fold_change, ...avgMap.get(timepoint)]);
      }
    }

    let avgLineData = [];

    for (const [timepoint, yS] of avgMap) {
      avgLineData.push({ x: timepoint, y: getAverage(yS) });
    }

    dataMap.set("Average", avgLineData);

    return {
      name: condition,
      data: dataMap,
      xLabel: "timepoint",
      yLabel: "mean fold change",
      width: 700,
      height: 700,
    };
  };

  const d3DataByFilters = Object.entries(dataByFilter).map(([filter, data]) => {
    return organizeD3Data(filter, data);
  });

  return (
    <div>
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
