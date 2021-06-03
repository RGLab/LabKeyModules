import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import AEDropdown from "./components/AEDropdown";
import SecondarySelectorSimple from "./components/SecondarySelectorSimple";
import GetStarted from "./components/GetStarted";
import {
  ANALYTE_GENE,
  ANALYTE_PGS,
  ANALYTE_BTM,
  analyteOptions,
} from "./helpers/constants";
import "./AnalyteExplorer.scss";

const AnalyteExplorer: React.FC = () => {
  const [selectedAnalyte, setSelectedAnalyte] =
    React.useState("Select Analyte");

  const [diseaseCondition, setDiseaseCondition] = React.useState("");
  const [gene, setGene] = React.useState("");
  const [btm, setBtm] = React.useState("");

  const [plotView, setPlotView] = React.useState(false);

  const secondarySelectorCallback = ({ disease, analyteName, analyteType }) => {
    if (analyteType === ANALYTE_GENE) {
      setGene(analyteName);
    } else if (analyteType === ANALYTE_BTM) {
      setBtm(analyteName);
    }
    setDiseaseCondition(disease);
    setPlotView(true);
  };

  const generateSecondarySelector = (analyte: string) => {
    if (analyte === ANALYTE_GENE || analyte === ANALYTE_BTM) {
      return (
        <SecondarySelectorSimple
          analyte={selectedAnalyte}
          callback={secondarySelectorCallback}
        />
      );
    }
    return <div></div>;
  };

  const generatePlot = () => {
    return <h1>Plot</h1>;
  };

  return (
    <main id="ae-main">
      <section className="ae-select-nav-container">
        <div className="ae-analyte-selector-container">
          <div className="ae-analyte-selector-content">
            <h1>Analyte Explorer</h1>
            <p>
              Visualize analytes of interest from the cohort-level study data
              with ImmuneSpace
            </p>
            <AEDropdown
              selected={selectedAnalyte}
              dropdownOptions={analyteOptions}
              callback={setSelectedAnalyte}
            />
          </div>
        </div>
        {generateSecondarySelector(selectedAnalyte)}
      </section>
      <section className="ae-plot-container">
        <div className="ae-plot-content">
          {!plotView ? <GetStarted /> : generatePlot()}
        </div>
      </section>
    </main>
  );
};

const App: React.FC = () => {
  return <AnalyteExplorer />;
};

export default App;
