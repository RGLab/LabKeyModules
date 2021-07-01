import React from "react";

const GetStarted: React.FC = () => {
  return (
    <div className="ae-get-started">
      <h1>How to get started</h1>
      <ol>
        <li>
          <span>Select the analyte type you would like to visualize</span>
        </li>
        <li>
          <span>
            Use the selection tool to select for disease conditions of interest
          </span>
        </li>
        <li>
          <span>
            Search for the gene of interest by typing in the box provided
          </span>
        </li>
        <li>
          <span>Once selections have been provided, plot to see results</span>
        </li>
      </ol>
      <h1>Plot</h1>
      <p>
        Hover over line plots for additional information about study, cohort,
        timepoint, and fold change
      </p>
      <h1>Download</h1>
      <p>Download metadata from analyte selections</p>
    </div>
  );
};

export default GetStarted;
