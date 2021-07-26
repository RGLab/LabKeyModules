import React from "react";
import tutorial1 from "../assets/tutorial1.png";
import tutorial2 from "../assets/tutorial2.png";
import tutorial3 from "../assets/tutorial3.png";

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
            src={tutorial1}
            alt="how to use first step"
            className="ae-home__tutorial-icon"
          />
          <span>
            Search our database for analytes related to HIPC study data
          </span>
        </div>
        <div>
          <img
            src={tutorial2}
            alt="how to use second step"
            className="ae-home__tutorial-icon"
          />
          <span>Plot the log2 transform to visualize expression patterns</span>
        </div>
        <div>
          <img
            src={tutorial3}
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
