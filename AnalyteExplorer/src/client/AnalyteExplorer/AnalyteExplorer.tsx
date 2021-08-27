import React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";

import "./components/AnalyteSelectorMain.scss";
import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import "./AnalyteExplorer.scss";
import DownloadPage from "./components/DownloadPage";
import { FilterNameSuggestions } from "./components/AnalyteSelectorMain";

import { Query, Filter } from "@labkey/api";
import HomePage from "./components/HomePage";
import AESpinner from "./components/AESpinner";
import { ErrorMessageHome } from "./components/ErrorMessage";
import LabKeyDebugPage from "./components/LabKeyDebugPage";
import { binaryClosestSearch } from "./helpers/helperFunctions";

const AnalyteExplorer: React.FC = () => {
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");
  const [filtersSelected, setFiltersSelected] = React.useState<string[]>([]);
  const [typedFilterNameSuggestions, setTypedFilterNameSuggestions] =
    React.useState<FilterNameSuggestions>({});
  const [untypedFilterNameSuggestions, setUntypedFilterNameSuggestions] =
    React.useState<{ analyte_id: string; analyte_type: string }[]>([]);
  const [conditionData, setConditionData] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState("");

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
      }
    };

    const processFailure = (err) => {
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
        failure: processFailure,
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
        setConditionData(data);
      }
    };

    const processFailure = (err) => {
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
        failure: processFailure,
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
          {nameSelected === "" &&
          typeSelected === "" &&
          filtersSelected.length < 1 ? (
            <HomePage />
          ) : (
            <DownloadPage
              analyteName={nameSelected}
              analyteType={typeSelected}
              filters={filtersSelected}
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
//    <div style={{ width: "1000px", height: "100vh" }}></div>
