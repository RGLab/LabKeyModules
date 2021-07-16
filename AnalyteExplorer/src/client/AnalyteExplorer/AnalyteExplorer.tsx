import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import AEDropdown from "./components/AEDropdown";
import SecondarySelectorSimple from "./components/SecondarySelectorSimple";
import GetStarted from "./components/GetStarted";
import { ANALYTE_GENE, ANALYTE_BTM, analyteOptions } from "./helpers/constants";
import AnalyteSelectorMain from "./components/AnalyteSelectorMain";
import AnalyteMetadataBox from "./components/AnalyteMetadataBox";
import AnalyteLinePlot from "./components/data_viz/AnalyteLinePlot";
import "./components/AnalyteSelectorMain.scss";
import "./AnalyteExplorer.scss";
import "./test.css";
import home_tutorial from "./assets/home-tutorial.png";
import tutorial1 from "./assets/tutorial1.png";
import tutorial2 from "./assets/tutorial2.png";
import tutorial3 from "./assets/tutorial3.png";

interface ArrowTextProps {
  text: string;
}

const ArrowText: React.FC<ArrowTextProps> = ({ text }) => {
  return (
    <a
      href="#"
      className="history-block__cta ae-home-arrow-text"
      title="Data Processing Link">
      <span className="history-block__link-text">{`${text}`}</span>
    </a>
  );
};

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
      <AnalyteSelectorMain />
      <section className="ae-home-content">
        <div className="ae-home-title">
          <h1>Analyte Explorer</h1>
          <h3>A search tool to visualize study data within ImmuneSpace</h3>
        </div>
        <img
          src={tutorial1}
          alt="how to use first step"
          className="ae-home__tutorial-icon"
        />
        <img
          src={tutorial2}
          alt="how to use second step"
          className="ae-home__tutorial-icon"
        />
        <img
          src={tutorial3}
          alt="how to use third step"
          className="ae-home__tutorial-icon"
        />
        <img src={home_tutorial} alt="home tutorial" />
        <div className="ae-home-tutorial-instructions">
          <span>
            Search our database for analytes related to HIPC study data
          </span>
          <span>Plot the log2 transform to visualize expression patterns</span>
          <span>Download your search results and analyze further</span>
        </div>
        <div className="ae-home-data-processing">
          <p>
            Analyte Explorer curruently supports gene expression data for genes
            and blood transcription modules (BTMs). For more information about
            our data processing methods for this module visit our data
            processing page.
          </p>

          <ArrowText text="Data Processing" />
        </div>
        {/* <AnalyteMetadataBox /> */}
        <AnalyteLinePlot />
      </section>

      {/* <section className="ae-select-nav-container">
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
      </section> */}
    </main>
  );
};

const App: React.FC = () => {
  return <AnalyteExplorer />;
};

export default App;
