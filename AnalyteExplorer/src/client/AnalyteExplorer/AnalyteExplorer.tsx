import React from "react";
import "./components/AnalyteSelectorMain.scss";
import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import "./AnalyteExplorer.scss";
import DownloadPage from "./components/DownloadPage";
import { FilterNameSuggestions } from "./components/AnalyteSelectorMain";

import { Query } from "@labkey/api";
import HomePage from "./components/HomePage";
import AESpinner from "./components/AESpinner";
import { ErrorMessageHome } from "./components/ErrorMessage";

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

  /**
   *
   * Actions performed for clicking the search button
   *
   * @param analyte_type
   * @param analyte_name
   * @param filters -> sorted string[]
   */
  const searchBtnCallback = (
    analyte_type: string,
    analyte_name: string,
    filters: string[]
  ) => {
    // only update state if the new selections are different than old ones,
    // prevents spam
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

  // Retrieves data for analyte search feature
  React.useEffect(() => {
    let isCancelled = false; // this cancels state update if component unmounts

    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined && !isCancelled) {
        // store analyte ids by type so that you can search for a specific
        // type of analyte
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

    const getData = () => {
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
      getData();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // Retrieves names of the disease conditions
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

    const getData = () => {
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
      getData();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // check if data that is needed for the filter menu to work has been loaded
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
  );
};

const App: React.FC = () => {
  return <AnalyteExplorer />;
};

export default App;
