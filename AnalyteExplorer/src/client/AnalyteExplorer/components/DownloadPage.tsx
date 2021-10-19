import React from "react";
import { CSVLink } from "react-csv";
import { Query, Filter } from "@labkey/api";
import AESpinner from "./AESpinner";
import CohortMetaDataGrid from "./CohortMetadataGrid";
import LinePlot, { LinePlotProps } from "./data_viz/LinePlot";
import { ErrorMessageConditionNotFound } from "./ErrorMessage"; // will need to implement this
import AnalyteMetadataBox, {
  AnalyteMetadataBoxProps,
} from "./AnalyteMetadataBox";
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
const organizeD3Data = (condition: string, data: RowData[]): LinePlotProps => {
  let dataMap = new Map<string, { x: number; y: number; study: string }[]>();

  let avgMap = new Map<number, number[]>(); // for average trend line
  let maxTimePoint = 0;
  let maxFoldChange = 0;
  let minFoldChange = 0;
  for (const { cohort, timepoint, mean_fold_change, study_accession } of data) {
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
    width: LINEPLOT_WIDTH,
    height: LINEPLOT_HEIGHT,
  };
};

const getGeneID = async (gene: string): Promise<string> => {
  try {
    const query = `https://mygene.info/v3/query?q=symbol:${gene}&size=1`;
    let apiGeneID = "";

    const response = await fetch(query);
    const responseJSON = await response.json();

    if (responseJSON !== undefined && responseJSON["hits"] !== undefined) {
      if (responseJSON["hits"].length > 0) {
        apiGeneID = responseJSON["hits"][0]["_id"];
      }
    }
    return apiGeneID;
  } catch (err) {
    console.error(err);
    return "";
  }
};

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

  // analyte Type is guaranteed to be typed, not ""

  React.useEffect(() => {
    let isCancelled = false;
    const filtersWithUnderscore = filters.map((filter) =>
      filter.replaceAll(" ", "_")
    );

    // converts raw data from immunespace to format usable by d3
    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined && !isCancelled) {
        const dataByFilter = processDataByFilter(data);

        const returnedConditions = Object.keys(dataByFilter);
        const conditionsNoData = filtersWithUnderscore.filter(
          (condition) => !returnedConditions.includes(condition)
        );

        const d3DataByFilters = Object.entries(dataByFilter).map(
          ([filter, data]) => {
            return organizeD3Data(filter, data);
          }
        );
        setRawData(data);
        setChartData(d3DataByFilters);
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

    const callGeneAPI = async (gene: string) => {
      const apiGeneID = await getGeneID(gene);

      if (apiGeneID !== "") {
        const geneMetaData = await getGeneMetaData(apiGeneID);

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
      if (type === "blood transcription module") {
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
      } else if (type === "gene") {
        callGeneAPI(analyte);
      }
    };

    // grabs data for a specific analyte under specific set of disease conditions
    const getData = (analyteName: string, filters: string[]) => {
      Query.selectRows({
        containerPath: "/AnalyteExplorer",
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

      // wipe cached data before querying new data
      rawData !== null ? setRawData(null) : null;
      chartData !== null ? setChartData(null) : null;
      chartMetadata !== null ? setChartMetadata(null) : null;
      errorMsg !== "" ? setErrMsg("") : null;

      getData(analyteName, filtersWithUnderscore);
      getMetaData(analyteType, analyteName);
      console.log("meep");
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
          <CohortMetaDataGrid />
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
