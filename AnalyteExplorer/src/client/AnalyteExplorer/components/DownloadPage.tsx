import React from "react";
import { CSVLink } from "react-csv";
import { Query } from "@labkey/api";
import AESpinner from "./AESpinner";
import CohortMetaDataGrid from "./CohortMetadataGrid";
import LinePlot, { LinePlotProps } from "./data_viz/LinePlot";
import { ErrorMessageConditionNotFound } from "./ErrorMessage"; // will need to implement this
import AnalyteMetadataBox, {
  AnalyteMetadataBoxProps,
} from "./AnalyteMetadataBox";
import { ANALYTE_GENE_COL, ANALYTE_BTM_COL } from "../helpers/constants";
import { getAverage, capitalizeKebabCase } from "../helpers/helperFunctions";
import { LINEPLOT_HEIGHT, LINEPLOT_WIDTH } from "./data_viz/dataVizConstants";
import "./DownloadPage.scss";

interface GeneMetaData {
  alias: string[];
  name: string;
  summary: string;
  type_of_gene: string;
}

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

// for each condition, convert raw data into a format usable for the line plot
export const organizeD3Data = (
  condition: string,
  data: RowData[]
): LinePlotProps => {
  if (condition === undefined || data === undefined) {
    return undefined;
  }
  let dataMap = new Map<string, { x: number; y: number; study: string }[]>();

  let avgMap = new Map<number, number[]>(); // for average trend line
  let maxTimePoint = 0;
  let maxFoldChange = 0;
  let minFoldChange = 0;
  for (const { cohort, timepoint, mean_fold_change, study_accession } of data) {
    if (
      cohort != undefined &&
      timepoint != undefined &&
      mean_fold_change != undefined
    ) {
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
    width: LINEPLOT_WIDTH,
    height: LINEPLOT_HEIGHT,
  };
};

// calls mygene.info api and returns metadata
const getGeneMetaData = async (geneID: string): Promise<GeneMetaData> => {
  try {
    const query = `https://mygene.info/v3/gene/${geneID}?fields=name,alias,type_of_gene,summary`;
    const response = await fetch(query);
    const responseJSON = await response.json(); // is typing this a good idea?

    const result = {
      name: responseJSON["name"],
      summary: responseJSON["summary"],
      type_of_gene: responseJSON["type_of_gene"],
      alias: responseJSON["alias"],
    }; // if responseJSON has any undefined values error with be thrown here and handled

    return result;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const processDataByFilter = (data: any) => {
  let dataByFilter: { [filter: string]: RowData[] } = {};

  if (data !== undefined && data.rows !== undefined) {
    for (const current of data.rows) {
      if (current !== undefined && current["condition"] !== undefined) {
        if (dataByFilter[current["condition"]] === undefined) {
          dataByFilter[current["condition"]] = [current];
        } else {
          dataByFilter[current["condition"]].push(current);
        }
      }
    }
  }
  return dataByFilter;
};

const DownloadPage: React.FC<DownloadPageProps> = ({
  analyteName,
  analyteType,
  filters,
}) => {
  const [rawData, setRawData] = React.useState(null);
  const [chartData, setChartData] = React.useState(null);
  const [chartMetadata, setChartMetadata] =
    React.useState<AnalyteMetadataBoxProps>(null);
  const [errorMsg, setErrMsg] = React.useState("");
  const [conditionsNotFound, setConditionsNotFound] = React.useState<string[]>(
    []
  );
  const [armAccessions, setArmAccessions] = React.useState<string[]>([]);

  // analyte Type is guaranteed to be typed, not ""

  React.useEffect(() => {
    let isCancelled = false;

    // converts raw data from immunespace to format usable by d3
    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined && !isCancelled) {
        const armAccessionSet = new Set<string>();

        for (const row of data.rows) {
          armAccessionSet.add(row["arm_accession"]);
        }

        const dataByFilter = processDataByFilter(data);

        const returnedConditions = Object.keys(dataByFilter);
        const conditionsNoData = filters.filter(
          (condition) => !returnedConditions.includes(condition)
        );

        const d3DataByFilters = Object.entries(dataByFilter).map(
          ([filter, data]) => {
            return organizeD3Data(filter, data);
          }
        );

        setRawData(data);
        setChartData(d3DataByFilters);
        setArmAccessions(Array.from(armAccessionSet));
        if (conditionsNoData.length > 0) {
          setConditionsNotFound(conditionsNoData);
        }
      }
    };

    const processChartMetaData = (
      title: string,
      body: string,
      subtitle: string = ""
    ) => {
      if (!isCancelled) {
        const metaData: AnalyteMetadataBoxProps = {
          title: title,
          subtitle: subtitle,
          body: body,
        };
        setChartMetadata(metaData);
      }
    };

    const processBTMMetaData = (data: any) => {
      if (data !== undefined && data.rows !== undefined) {
        processChartMetaData(
          data.rows[0]["name"],
          `Genes: ${data.rows[0]["genes"]}`
        );
      }
    };

    const processFailure = (err) => {
      if (!isCancelled) {
        console.error(err);
        setErrMsg(err["exception"]);
      }
    };

    const processChartMetaDataError = (analyteName: string, error: string) => {
      processChartMetaData(analyteName, error);
    };

    // calls mygene.info api & retrieves metadata for specific gene
    const processGeneMetaData = async (entrezID: string) => {
      if (entrezID !== "") {
        const geneMetaData = await getGeneMetaData(entrezID);

        if (geneMetaData !== undefined) {
          const metaBoxTitle = `${analyteName}: ${
            capitalizeKebabCase(geneMetaData["name"]) ?? ""
          }`;
          const metaBoxBody = `${
            geneMetaData["summary"] ?? "NO SUMMARY INFORMATION FOUND"
          }`;
          const metaBoxSubTitle = `${
            capitalizeKebabCase(geneMetaData["type_of_gene"]) ?? "Unknown"
          } // Aliases: ${geneMetaData["alias"] ?? ""}`;
          processChartMetaData(metaBoxTitle, metaBoxBody, metaBoxSubTitle);
        } else {
          processChartMetaDataError(analyteName, "UNABLE TO RETRIEVE METADATA");
        }
      } else {
        processChartMetaDataError(analyteName, "NO METADATA FOUND");
      }
    };

    const getMetaData = (type: string, analyte: string) => {
      if (type === ANALYTE_BTM_COL) {
        Query.executeSql({
          containerPath: "/AnalyteExplorer",
          schemaName: "lists",
          sql: `SELECT DISTINCT id, name, genes
                    FROM blood_transcription_modules
                    WHERE blood_transcription_modules.id = '${analyte}'
                    `,
          success: processBTMMetaData,
          failure: processFailure,
        });
      } else if (type === ANALYTE_GENE_COL) {
        const processGeneEntrezID = (data: any) => {
          if (
            data !== undefined &&
            data.rows !== undefined &&
            data.rows.length > 0
          ) {
            processGeneMetaData(data.rows[0]["entrez"]);
          }
          processGeneMetaData("");
        };

        // getting gene entrez_id
        Query.executeSql({
          containerPath: "/AnalyteExplorer",
          schemaName: "lists",
          sql: `SELECT genes.entrez
                    FROM genes
                    WHERE genes.symbol = '${analyte}'
                    `,
          success: processGeneEntrezID,
          failure: processFailure,
        });
      }
    };

    // add quotes around every string in the array
    const createSQLArray = (arr: string[]): string[] => {
      return arr.map((str) => {
        return `'${str}'`;
      });
    };

    // grabs data for a specific analyte under specific set of disease conditions
    const getData = (analyteName: string, filters: string[]) => {
      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT gene_expression_summaries.analyte_id AS analyte_id, gene_expression_summaries.analyte_type AS analyte_type, 
                gene_expression_summaries.study_accession, gene_expression_summaries.timepoint, gene_expression_summaries.mean_fold_change, 
                cohorts.condition_studied AS condition, cohorts.name AS cohort, cohorts.description AS cohort_description, 
                cohorts.research_focus, cohorts.arm_accession
                FROM gene_expression_summaries
                INNER JOIN cohorts ON gene_expression_summaries.arm_accession = cohorts.arm_accession
                WHERE gene_expression_summaries.analyte_id = '${analyteName}'
                AND cohorts.condition_studied IN (${createSQLArray(
                  filters
                ).join(",")})
                `,
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

      // wipe cached data before querying new data
      rawData !== null ? setRawData(null) : null;
      chartData !== null ? setChartData(null) : null;
      chartMetadata !== null ? setChartMetadata(null) : null;
      errorMsg !== "" ? setErrMsg("") : null;

      getData(analyteName, filters);
      getMetaData(analyteType, analyteName);
    }
    return () => {
      isCancelled = true;
    };
  }, [analyteName, analyteType, filters]);

  const isDataLoaded = React.useMemo(() => {
    return rawData !== null && chartData !== null && chartMetadata !== null;
  }, [rawData, chartData, chartMetadata]);

  return (
    <div className="ae-download-content">
      {isDataLoaded ? (
        <React.Fragment>
          <CSVLink data={rawData.rows}>Download Me!</CSVLink>
          {conditionsNotFound.length > 0 ? (
            <ErrorMessageConditionNotFound types={conditionsNotFound} />
          ) : (
            <></>
          )}
          <div className="ae-metabox-container">
            <AnalyteMetadataBox
              title={chartMetadata.title}
              subtitle={chartMetadata.subtitle}
              body={chartMetadata.body}
            />
          </div>
          {chartData.map((d3Data) => {
            if (d3Data !== undefined) {
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
            }
          })}
          <h2>Cohort Information</h2>
          <CohortMetaDataGrid arm_accessions={armAccessions} />
        </React.Fragment>
      ) : (
        <AESpinner />
      )}
    </div>
  );
};

export default DownloadPage;
