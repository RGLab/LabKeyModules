import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import DownloadPage from "./components/DownloadPage";
import { FilterNameSuggestions } from "./components/AnalyteSelectorMain";
import { Spinner } from "react-bootstrap";
import "./components/AnalyteSelectorMain.scss";
import "./AnalyteExplorer.scss";
import "./test.css";

import { Query, Filter } from "@labkey/api";
import HomePage from "./components/HomePage";
import AESpinner from "./components/AESpinner";
import { ErrorMessageHome } from "./components/ErrorMessage";
import LabKeyDebugPage from "./components/LabKeyDebugPage";

const AnalyteExplorer: React.FC = () => {
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");
  const [filtersSelected, setFiltersSelected] = React.useState<string[]>([]);
  const [downloadPageData, setDownloadPageData] = React.useState(null);

  const [isDataLoaded, setIsDataLoaded] = React.useState(true);
  const [isDataEmpty, setIsDataEmpty] = React.useState(false);
  const [typedFilterNameSuggestions, setTypedFilterNameSuggestions] =
    React.useState<FilterNameSuggestions>({});

  const [untypedFilterNameSuggestions, setUntypedFilterNameSuggestions] =
    React.useState<{ analyte_id: string; analyte_type: string }[]>([]);

  const [conditionData, setConditionData] = React.useState(null);

  const [errorMsg, setErrorMsg] = React.useState("");
  const [downloadErrorMsg, setDownloadErrorMsg] = React.useState("");

  // anti-spam implemented here
  const searchBtnCallback = (
    analyte_type: string,
    analyte_name: string,
    filters: string[]
  ) => {
    if (analyte_type !== typeSelected) {
      setTypeSelected(analyte_type);
    }

    if (analyte_name !== nameSelected) {
      setNameSelected(analyte_name);
    }

    // filters are sorted alphabetically
    if (filters.length !== filtersSelected.length) {
      setFiltersSelected(filters);
    } else {
      for (let i = 0; i < filters.length; i++) {
        if (filters[i] !== filtersSelected[i]) {
          setFiltersSelected(filters);
        }
      }
    }
  };

  React.useEffect(() => {
    let isCancelled = false;

    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined) {
        if (data.rows.length < 1 && !isDataEmpty) {
          setIsDataEmpty(true);
        } else if (isDataEmpty) {
          setIsDataEmpty(false);
        }
        setDownloadPageData(data);
        setIsDataLoaded(true);
      }
    };

    const handleFailure = (err) => {
      console.log(err);
      setDownloadErrorMsg(err["exception"]);
    };

    const getData = () => {
      Query.selectRows({
        schemaName: "lists",
        queryName: "gene_expression",
        filterArray: [
          Filter.create("analyte_id", nameSelected.toUpperCase()),
          Filter.create(
            "condition",
            filtersSelected,
            Filter.Types.CONTAINS_ONE_OF
          ),
        ],
        success: processData,
        failure: handleFailure,
      });
    };

    if (!isCancelled && nameSelected !== "" && filtersSelected.length > 0) {
      console.log("fetching data...");
      setDownloadPageData(null);
      setIsDataLoaded(false);
      getData();
      console.log("meep");
    }
    return () => {
      isCancelled = true;
    };
  }, [nameSelected, filtersSelected]);

  React.useEffect(() => {
    let isCancelled = false;

    const processData = (data: any) => {
      console.log(data);
      if (data !== undefined && data.rows !== undefined) {
        let typedNames: FilterNameSuggestions = {};
        for (const analyte of data.rows) {
          if (typedNames[analyte.analyte_type] === undefined) {
            typedNames[analyte.analyte_type] = [analyte];
          } else {
            typedNames[analyte.analyte_type].push(analyte);
          }
        }

        setTypedFilterNameSuggestions(typedNames);
        setUntypedFilterNameSuggestions(data.rows);
        setIsDataLoaded(true);
      }
    };

    const handleFailure = (err) => {
      setErrorMsg(err["exception"]);
    };

    const callLabkey = () => {
      console.log("fetching using executeSql");

      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT analyte_id, analyte_type
                  FROM analytes
                  WHERE analytes.analyte_type != 'gene signature'
                  `,
        success: processData,
        failure: handleFailure,
      });
    };

    if (!isCancelled) {
      callLabkey();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let isCancelled = false;

    const processData = (data: any) => {
      if (
        !isCancelled &&
        data !== undefined &&
        data !== null &&
        data.rows !== undefined
      ) {
        // const conditions = {};
        // data.rows.forEach((condition: { condition: string }) => {
        //   const disease = condition["condition"].replaceAll("_", " ");
        //   conditions[disease] = false;
        // });

        setConditionData(data);
      }
    };

    const handleFailure = (err) => {
      setErrorMsg(err["exception"]);
    };

    const getDiseaseConds = () => {
      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT gene_expression.condition AS condition
        FROM gene_expression
        `,
        success: processData,
        failure: handleFailure,
      });
    };

    if (!isCancelled) {
      console.log("fetching disease cond");
      getDiseaseConds();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  const isSelectorDataLoaded = () => {
    return (
      untypedFilterNameSuggestions.length > 0 &&
      Object.keys(typedFilterNameSuggestions).length > 0 &&
      conditionData !== null
    );
  };

  //console.log(nameSelected);
  // console.log(filtersSelected);

  if (errorMsg !== "") {
    return (
      <main id="ae-main">
        <ErrorMessageHome />
      </main>
    );
  }

  return (
    <main id="ae-main">
      {isSelectorDataLoaded() ? (
        <React.Fragment>
          <AnalyteSelectorMain
            searchBtnCallback={searchBtnCallback}
            typedFilterNameSuggestions={typedFilterNameSuggestions}
            untypedFilterNameSuggestions={untypedFilterNameSuggestions}
            conditionData={conditionData}
          />
          {downloadPageData === null && downloadErrorMsg === "" ? (
            isDataLoaded ? (
              <HomePage />
            ) : (
              <AESpinner />
            )
          ) : (
            <DownloadPage
              data={downloadPageData}
              filters={filtersSelected}
              errorMsg={downloadErrorMsg}
            />
          )}
        </React.Fragment>
      ) : (
        <AESpinner />
      )}
    </main>
    //<LabKeyDebugPage />
  );
};

const App: React.FC = () => {
  return <AnalyteExplorer />;
};

export default App;
