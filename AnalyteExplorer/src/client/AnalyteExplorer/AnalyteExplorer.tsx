import React from "react";
import "regenerator-runtime/runtime";
import "./components/AnalyteSelectorMain.scss";
import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import "./AnalyteExplorer.scss";
import DownloadPage from "./components/DownloadPage";
import {
  TypedFilterNameSuggestions,
  UntypedFilterNameSuggestions,
} from "./components/AnalyteSelectorMain";

import { Query } from "@labkey/api";
import HomePage from "./components/HomePage";
import AESpinner from "./components/AESpinner";
import { ErrorMessageHome } from "./components/ErrorMessage";

const AnalyteExplorer: React.FC = () => {
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");
  const [filtersSelected, setFiltersSelected] = React.useState<string[]>([]);
  const [typedFilterNameSuggestions, setTypedFilterNameSuggestions] =
    React.useState<TypedFilterNameSuggestions>({});
  const [untypedFilterNameSuggestions, setUntypedFilterNameSuggestions] =
    React.useState<UntypedFilterNameSuggestions[]>([]);
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
  const searchBtnCallback = React.useCallback(
    (analyte_type: string, analyte_name: string, filters: string[]) => {
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
    },
    [typeSelected, nameSelected, filtersSelected]
  );

  // Retrieves data for analyte search feature
  React.useEffect(() => {
    let isCancelled = false; // this cancels state update if component unmounts

    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined && !isCancelled) {
        // store analyte ids by type so that you can search for a specific
        // type of analyte
        let typedNames: TypedFilterNameSuggestions = {};
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
      if (!isCancelled) {
        setErrorMsg(err["exception"]);
      }
    };

    const getData = () => {
      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT analyte_id, analyte_type
                  FROM gene_expression_summaries
                  WHERE gene_expression_summaries.analyte_type != 'gene signature'
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
      if (!isCancelled) {
        setErrorMsg(err["exception"]);
      }
    };

    const getData = () => {
      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT cohorts.condition_studied AS condition
        FROM cohorts
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
  const isSelectorDataLoaded = React.useMemo(() => {
    return (
      untypedFilterNameSuggestions.length > 0 &&
      Object.keys(typedFilterNameSuggestions).length > 0 &&
      conditionData !== null
    );
  }, [untypedFilterNameSuggestions, typedFilterNameSuggestions, conditionData]);

  if (errorMsg !== "") {
    return (
      <main id="ae-main">
        <ErrorMessageHome />
      </main>
    );
  }

  return (
    <main id="ae-main">
      {isSelectorDataLoaded ? (
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
