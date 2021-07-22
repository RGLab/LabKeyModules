import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import DownloadPage from "./components/DownloadPage";
import AnalyteMetadataBox from "./components/AnalyteMetadataBox";
import AnalyteLinePlot from "./components/data_viz/AnalyteLinePlot";
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

  React.useEffect(() => {
    let isCancelled = false;

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
      getData();
    }
    return () => {
      isCancelled = true;
    };
  }, [typeSelected, nameSelected, filtersSelected]);

  return (
    <main id="ae-main">
      <AnalyteSelectorMain
        typeSelectedCallback={setTypeSelected}
        nameSelectedCallback={setNameSelected}
        filtersSelectedCallback={setFiltersSelected}
      />
      {downloadPageData === null ? <HomePage /> : <DownloadPage />}
    </main>
  );
};

const App: React.FC = () => {
  return <AnalyteExplorer />;
};

export default App;
