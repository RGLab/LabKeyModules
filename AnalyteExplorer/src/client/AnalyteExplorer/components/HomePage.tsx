import React from "react";
// import tutorial1 from "../../../../resources/assets/images/tutorial1.png";
// import tutorial2 from "../../../../resources/assets/images/tutorial2.png";
// import tutorial3 from "../../../../resources/assets/images/tutorial3.png";

interface ArrowTextProps {
  text: string;
}

// same arrow as entrance page
const ArrowText: React.FC<ArrowTextProps> = ({ text }) => {
  return (
    <a
      href="https://immunespace.org/project/home/begin.view?tab=GeneExpression"
      className="history-block__cta ae-home-arrow-text"
      title="Data Processing Link">
      <span className="history-block__link-text">{`${text}`}</span>
    </a>
  );
};

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
            src="/AnalyteExplorer/assets/images/tutorial2.png"
            alt="how to use first step"
            className="ae-home__tutorial-icon"
          />
          <span>
            Search our database for analytes related to HIPC study data
          </span>
        </div>
        <div>
          <img
            src="/AnalyteExplorer/assets/images/tutorial1.png"
            alt="how to use second step"
            className="ae-home__tutorial-icon"
          />
          <span>Plot the log2 transform to visualize expression patterns</span>
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
        <p>
          Analyte Explorer curruently supports gene expression data for genes
          and blood transcription modules (BTMs). For more information about our
          data processing methods for this module visit our data processing
          page.
        </p>

        <ArrowText text="Data Processing" />
      </div>
    </section>
  );
};

export default HomePage;
