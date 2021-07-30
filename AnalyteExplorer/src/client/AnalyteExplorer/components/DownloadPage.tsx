import React from "react";
import AnalyteLinePlot from "./data_viz/AnalyteLinePlot";
import AnalyteMetadataBox from "./AnalyteMetadataBox";
import { CSVLink } from "react-csv";
import {
  LineChart,
  Line,
  Tooltip,
  TooltipProps,
  XAxis,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  YAxis,
} from "recharts";

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

const DownloadPage: React.FC<DownloadPageProps> = ({ data, filters }) => {
  // let dataByFilter: { [filter: string]: [] } = filters.reduce(
  //   (skeleton, filter) => {
  //     skeleton[filter] = [];
  //     return skeleton;
  //   },
  //   {}
  // );

  let dataByFilter: { [filter: string]: RowData[] } = data.rows.reduce(
    (dataByFilter, current: RowData) => {
      if (current["condition"] !== undefined) {
        if (dataByFilter[current["condition"]] === undefined) {
          dataByFilter[current["condition"]] = [current];
        } else {
          dataByFilter[current["condition"]].push(current);
        }
      }
      return dataByFilter;
    },
    {}
  );

  //console.log(dataByFilter);

  const organizeReChartsData = (data: RowData[]): ReChartsDataFormat[] => {
    let dataMap = new Map<number, ReChartsDataFormat>();
    // each cohort is a line
    for (const { cohort, timepoint, mean_fold_change } of data) {
      if (dataMap.get(timepoint) === undefined) {
        dataMap.set(timepoint, { x: timepoint, [cohort]: mean_fold_change });
      } else {
        let timepointData = dataMap.get(timepoint);
        timepointData[cohort] = mean_fold_change;
        dataMap.set(timepoint, timepointData);
      }
    }
    console.log(dataMap);
    let sortedMapVals = Array.from(dataMap.values()).sort((a, b) => a.x - b.x);
    return sortedMapVals;
  };

  const organizedRechartData = Object.values(dataByFilter).map((data) => {
    return organizeReChartsData(data);
  });

  console.log(organizedRechartData);

  const organizeData = (
    data: RowData[],
    filters: string[]
  ): MultiConditionNivoDataFormat => {
    console.log(data);
    let skeleton: DataSkeleton = filters.reduce((skeleton, filter) => {
      skeleton[filter] = {};
      return skeleton;
    }, {});

    let averageLine: { [condition: string]: { [x: number]: number[] } } = {};

    for (const { condition, cohort, timepoint, mean_fold_change } of data) {
      //skeleton[condition].push({ x: timepoint, y: mean_fold_change });
      if (
        skeleton[condition][cohort] !== undefined &&
        skeleton[condition][cohort]["data"] !== undefined
      ) {
        skeleton[condition][cohort]["data"].push({
          x: timepoint,
          y: mean_fold_change,
        });
      } else {
        skeleton[condition][cohort] = {
          id: cohort,
          color: "hsla(0, 0%, 22%, 0.5)",
          data: [{ x: timepoint, y: mean_fold_change }],
        };
      }

      if (averageLine[condition] !== undefined) {
        if (averageLine[condition][timepoint] !== undefined) {
          averageLine[condition][timepoint].push(mean_fold_change);
        } else {
          averageLine[condition][timepoint] = [mean_fold_change];
        }
      } else {
        averageLine[condition] = { [timepoint]: [mean_fold_change] };
      }

      //console.log(averageLine);
      // if (skeleton[condition] === undefined) {
      //   skeleton[condition] = [
      //     { cohort: cohort, data: [{ x: timepoint, y: mean_fold_change }] },
      //   ];
      // } else {
      //   skeleton[condition].push({
      //     cohort: cohort,
      //     data: [{ x: timepoint, y: mean_fold_change }],
      //   });
      // }
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

    let avgLineFinal: { [condition: string]: NivoDataFormat } = {};

    Object.entries(averageLine).reduce((avgLineFinal, [condition, data]) => {
      let averageLineNivoData: NivoDataFormat = {
        id: "Average",
        color: "hsl(0, 100%, 50%)",
        data: [],
      };
      for (const [x, yArr] of Object.entries(data)) {
        let averageY = getAverage(yArr);
        averageLineNivoData["data"].push({ x: parseFloat(x), y: averageY });
      }
      averageLineNivoData["data"].sort((a, b) => a.x - b.x);
      avgLineFinal[condition] = averageLineNivoData;
      return avgLineFinal;
    }, avgLineFinal);

    //avgLineFinal[condition]
    const organizedData: MultiConditionNivoDataFormat = Object.entries(
      skeleton
    ).reduce((finalData, [condition, cohorts]) => {
      finalData[condition] = [
        ...Object.values(cohorts),
        ...[avgLineFinal[condition]],
      ];
      return finalData;
    }, {});

    //organizedData["Average"] = averageLineData;
    console.log(organizedData);
    return organizedData;
  };

  const plotData = organizeData(data.rows, filters);

  return (
    <div>
      <CSVLink data={data.rows}>Download Me!</CSVLink>
      {/* {Object.entries(plotData).map(([condition, data]) => {
        return (
          <React.Fragment>
            <h2>{`${condition}`}</h2>
            <AnalyteLinePlot data={data} />
          </React.Fragment>
        );
      })} */}
      <LineChart width={1000} height={1000} data={organizedRechartData[0]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />

        <Legend />
        <Tooltip />
        {Object.keys(organizedRechartData[0][0]).map((cohort) => {
          console.log(cohort);
          return cohort !== "x" ? (
            <Line
              type="monotone"
              dataKey={cohort}
              stroke="#8884d8"
              connectNulls
            />
          ) : null;
        })}
      </LineChart>
      ;
      {/* {organizedRechartData.map((data) => {
        <LineChart width={1000} height={1000} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Legend />
          <Tooltip />
          {Object.keys(data[0]).map((cohort) => {
            console.log(cohort);
            return cohort !== "x" ? (
              <Line type="monotone" dataKey={cohort} stroke="#8884d8" />
            ) : null;
          })}
        </LineChart>;
      })} */}
    </div>
  );
};

export default DownloadPage;
