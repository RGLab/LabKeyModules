import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import DownloadPage from "./components/DownloadPage";
import { Spinner } from "react-bootstrap";
import "./components/AnalyteSelectorMain.scss";
import "./AnalyteExplorer.scss";
import "./test.css";

import { Query, Filter } from "@labkey/api";
import HomePage from "./components/HomePage";

const AnalyteExplorer: React.FC = () => {
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");
  const [filtersSelected, setFiltersSelected] = React.useState<string[]>([]);
  const [downloadPageData, setDownloadPageData] = React.useState(null);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [isDataEmpty, setIsDataEmpty] = React.useState(false);

  React.useEffect(() => {
    let isCancelled = false;

    const processData = (data: any) => {
      if (data !== undefined && data.rows !== undefined) {
        if (data.rows.length < 1) {
          setIsDataEmpty(true);
        }
        setDownloadPageData(data);
        setIsDataLoaded(true);
      }
    };

    const getData = () => {
      Query.selectRows({
        schemaName: "lists",
        queryName: "gene_expression",
        filterArray: [
          Filter.create("analyte_type", typeSelected),
          Filter.create("analyte_id", nameSelected.toUpperCase()),
          Filter.create(
            "condition",
            filtersSelected,
            Filter.Types.CONTAINS_ONE_OF
          ),
        ],
        success: (data) => {
          console.log(data);
          setDownloadPageData(data);
          setIsDataLoaded(true);
        },
        failure: (err) => console.log(err),
      });
    };

    if (
      !isCancelled &&
      typeSelected !== "" &&
      nameSelected !== "" &&
      filtersSelected.length > 0
    ) {
      console.log("fetching data...");
      setDownloadPageData(null);
      getData();
    }
    return () => {
      isCancelled = true;
    };
  }, [typeSelected, nameSelected, filtersSelected]);

  console.log(nameSelected);
  console.log(filtersSelected);
  console.log(downloadPageData);

  return (
    <main id="ae-main">
      <AnalyteSelectorMain
        typeSelectedCallback={setTypeSelected}
        nameSelectedCallback={setNameSelected}
        filtersSelectedCallback={setFiltersSelected}
        setIsDataLoaded={setIsDataLoaded}
      />
      {typeSelected === "" ||
      nameSelected === "" ||
      filtersSelected.length < 1 ? (
        <HomePage />
      ) : filtersSelected.length > 0 && isDataLoaded ? (
        <DownloadPage data={downloadPageData} filters={filtersSelected} />
      ) : (
        <Spinner animation="border" variant="primary" />
      )}
    </main>
  );
};

const App: React.FC = () => {
  return <AnalyteExplorer />;
};

export default App;
