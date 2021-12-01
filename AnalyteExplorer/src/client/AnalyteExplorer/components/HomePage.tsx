import React from "react";
import { AboutTheData } from "./AboutTheData";

const HomePage: React.FC = () => {
  return (
    <section className="ae-home-content">
      <div className="ae-home-title">
        <h1>Analyte Explorer</h1>
        <h3>A search tool to visualize study data within ImmuneSpace</h3>
      </div>

      <div className="ae-home-tutorial-instructions">
        <div>
          <img
            src="/AnalyteExplorer/assets/images/tutorial1.png"
            alt="how to use first step"
            className="ae-home__tutorial-icon"
          />
          <span>
            Search our database for analytes related to HIPC study data
          </span>
        </div>
        <div>
          <img
            src="/AnalyteExplorer/assets/images/tutorial2.png"
            alt="how to use second step"
            className="ae-home__tutorial-icon"
          />
          <span>
            Plot the log2 fold change of a gene or gene set over time by cohort
          </span>
        </div>
        <div>
          <img
            src="/AnalyteExplorer/assets/images/tutorial3.png"
            alt="how to use third step"
            className="ae-home__tutorial-icon"
          />
          <span>Download your search results and analyze further</span>
        </div>
      </div>
      <div className="ae-home-data-processing">
        <AboutTheData></AboutTheData>
      </div>
    </section>
  );
};

export default HomePage;
