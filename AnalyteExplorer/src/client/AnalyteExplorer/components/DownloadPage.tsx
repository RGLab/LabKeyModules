import React from "react";
import AnalyteMetadataBox from "./AnalyteMetadataBox";
import { CSVLink } from "react-csv";
import { Spinner } from "react-bootstrap";
import { Query, Filter } from "@labkey/api";
import AESpinner from "./AESpinner";

import LinePlot, { LinePlotProps } from "./data_viz/LinePlot";
import { ErrorMessageDownload } from "./ErrorMessage";
import "./DownloadPage.scss";

interface DownloadPageProps {
  analyteName: string;
  analyteType: string;
  filters: string[];
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
  analyteName,
  analyteType,
  filters,
}) => {
  const [rawData, setRawData] = React.useState(null);
  const [chartData, setChartData] = React.useState(null);
  const [chartMetadata, setChartMetadata] = React.useState(null);
  const [errorMsg, setErrMsg] = React.useState("");

  // analyte Type is guaranteed to be typed

  React.useEffect(() => {
    let isCancelled = false;

    const organizeD3Data = (
      condition: string,
      data: RowData[]
    ): LinePlotProps => {
      let dataMap = new Map<
        string,
        { x: number; y: number; study: string }[]
      >();
      let avgMap = new Map<number, number[]>();
      let maxTimePoint = 0;
      let maxFoldChange = 0;
      let minFoldChange = 0;
      for (const {
        cohort,
        timepoint,
        mean_fold_change,
        study_accession,
      } of data) {
        if (timepoint > maxTimePoint) {
          maxTimePoint = timepoint;
        }

        if (mean_fold_change > maxFoldChange) {
          maxFoldChange = mean_fold_change;
        }

        if (mean_fold_change < minFoldChange) {
          minFoldChange = mean_fold_change;
        }

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

      // console.log(
      //   `tp: ${maxTimePoint} maxfc: ${maxFoldChange} minfc: ${minFoldChange}`
      // );
      // if maxtimepoint < 50, make it 50, if min and max fold change are within [-1, 1], make range [-1, 1]

      let avgLineData: { x: number; y: number; study: string }[] = [];

      for (const [timepoint, yS] of avgMap) {
        if (yS.length > 1) {
          avgLineData.push({ x: timepoint, y: getAverage(yS), study: "Trend" });
        }
      }

      dataMap.set("Average", avgLineData);

      return {
        name: condition,
        data: dataMap,
        xLabel: "timepoint (days)",
        yLabel: "mean fold change",
        width: 1500,
        height: 843,
      };
    };

    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined) {
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

        const d3DataByFilters = Object.entries(dataByFilter).map(
          ([filter, data]) => {
            return organizeD3Data(filter, data);
          }
        );
        setRawData(data);
        setChartData(d3DataByFilters);
      }
    };

    const processMetaData = (data: any) => {
      if (data !== undefined && data.rows !== undefined) {
        setChartMetadata(data);
        // setAnalyteMetadata(data);
        // if (downloadPageData !== null) {
        //   setIsDataLoaded(true);
        // }
      }
    };

    const processFailure = (err) => {
      console.log(err);
      setErrMsg(err["exception"]);
      //setDownloadErrorMsg(err["exception"]);
    };

    const getData = () => {
      if (analyteType === "blood transcription module") {
        Query.executeSql({
          containerPath: "/AnalyteExplorer",
          schemaName: "lists",
          sql: `SELECT DISTINCT id, name, genes
                    FROM blood_transcription_modules
                    WHERE blood_transcription_modules.id = '${analyteName}'
                    `,
          success: processMetaData,
          failure: processFailure,
        });
      } else if (analyteType === "gene") {
        // get gene metadata somehwere
      }

      Query.selectRows({
        schemaName: "lists",
        queryName: "gene_expression",
        filterArray: [
          Filter.create("analyte_id", analyteName.toUpperCase()),
          Filter.create("condition", filters, Filter.Types.CONTAINS_ONE_OF),
        ],
        success: processData,
        failure: processFailure,
      });
    };

    if (
      !isCancelled &&
      analyteName !== "" &&
      analyteType !== "" &&
      filters.length > 0
    ) {
      console.log("fetching data...");
      setRawData(null);
      setChartData(null);
      setChartMetadata(null);
      if (errorMsg !== "") {
        setErrMsg("");
      }
      getData();
      console.log("meep");
    }
    return () => {
      isCancelled = true;
    };
  }, [analyteName, analyteType, filters]);

  const isDataLoaded =
    rawData !== null && chartData !== null && chartMetadata !== null;

  console.log("load download page");

  return (
    <div className="ae-download-content">
      {isDataLoaded ? (
        <React.Fragment>
          <CSVLink data={rawData.rows}>Download Me!</CSVLink>
          <div className="ae-metabox-container">
            <AnalyteMetadataBox />
          </div>
          {chartData.map((d3Data) => {
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
        </React.Fragment>
      ) : (
        <AESpinner />
      )}
    </div>
  );
};

export default DownloadPage;
