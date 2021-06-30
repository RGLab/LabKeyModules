import React from "react";
import "./AnalyteSelectorMain.scss";

const AnalyteSelectorMain = () => {
  const [selected, setSelected] = React.useState(0); //0 means nothing is selected

  return (
    <div className="analyte-selector-main">
      <div className="analyte-selector-dropdown">
        <div className="analyte-selector">
          <div
            className="analyte-selector-label-wrapper"
            onClick={() => setSelected(1)}>
            <div>
              <label htmlFor="analyte-type" className="analyte-selector-label">
                Analyte Type
              </label>
              <input
                type="text"
                id="analyte-type"
                name="analyte-type"
                placeholder="What would you like to search?"></input>
            </div>
          </div>
        </div>
        <div className="analyte-selector">
          <div
            className="analyte-selector-label-wrapper"
            onClick={() => setSelected(2)}>
            <label htmlFor="analyte" className="analyte-selector-label">
              Analyte
            </label>
            <input
              type="text"
              id="analyte"
              name="analyte"
              placeholder="Analyte name"></input>
          </div>
        </div>
        <div className="analyte-selector">
          <div
            className="analyte-selector-label-wrapper"
            onClick={() => setSelected(3)}>
            <label htmlFor="analyte-filters" className="analyte-selector-label">
              Filters
            </label>
            <input
              type="text"
              id="analyte-filters"
              name="analyte-filters"
              placeholder="0 filters applied"
              readOnly></input>
          </div>
        </div>
      </div>
      <div
        className="analyte-selector-dropdown-menu"
        style={{ marginLeft: `${(selected % 4) * 100}px` }}>
        <div className="analyte-selector-dropdown-content">
          <div className="analyte-selector-dropdown-options">
            <span>Option + {selected}</span>
          </div>
          <div className="analyte-selector-dropdown-options">
            <span>Option</span>
          </div>
          <div className="analyte-selector-dropdown-options">
            <span>Option</span>
          </div>
          <div className="analyte-selector-dropdown-options">
            <span>Option</span>
          </div>
          <div className="analyte-selector-dropdown-options">
            <span>Option</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyteSelectorMain;
