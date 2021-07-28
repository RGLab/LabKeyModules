import React from "react";
import AnalyteLinePlot from "./data_viz/AnalyteLinePlot";
import { CSVLink } from "react-csv";

interface DownloadPageProps {
  data: any;
  filters: string[];
}

interface NivoDataFormat {
  id: string;
  color: string;
  data: [{ x: number; y: number }];
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

const DownloadPage: React.FC<DownloadPageProps> = ({ data, filters }) => {
  const organizeData = (
    data: RowData[],
    filters: string[]
  ): MultiConditionNivoDataFormat => {
    let skeleton: DataSkeleton = filters.reduce((skeleton, filter) => {
      skeleton[filter] = {};
      return skeleton;
    }, {});

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
          color: "hsl(244, 70%, 50%)",
          data: [{ x: timepoint, y: mean_fold_change }],
        };
      }
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

    const organizedData: MultiConditionNivoDataFormat = Object.entries(
      skeleton
    ).reduce((finalData, [condition, cohorts]) => {
      finalData[condition] = [...Object.values(cohorts)];
      return finalData;
    }, {});
    console.log(organizedData);
    return organizedData;
  };

  const plotData = organizeData(data.rows, filters);

  return (
    <div>
      <CSVLink data={data.rows}>Download Me!</CSVLink>
      {Object.entries(plotData).map(([condition, data]) => {
        return (
          <React.Fragment>
            <h2>{`${condition}`}</h2>
            <AnalyteLinePlot data={data} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DownloadPage;
