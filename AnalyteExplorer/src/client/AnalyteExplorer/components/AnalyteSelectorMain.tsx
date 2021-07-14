import React, { MouseEvent } from "react";
//import { AiTwotoneSafetyCertificate } from "react-icons/ai";
import styled from "styled-components";
import { diseaseConditions } from "../helpers/constants";
import "./AnalyteSelectorMain.scss";

interface CheckboxButtonProps {
  id: string;
  labelText: string;
  isChecked: boolean;
  onClickCallback: (disease: string) => void;
}

const CheckboxButton: React.FC<CheckboxButtonProps> = ({
  id,
  labelText,
  isChecked,
  onClickCallback,
}) => {
  return (
    <div className="analyte-filter-checkbox-container">
      <input
        className="analyte-filter-checkbox-btn"
        type="checkbox"
        id={id}
        name={id}
        value={id}
        checked={isChecked}
        onChange={() => onClickCallback(id)}></input>
      <label htmlFor={id}>{`${labelText}`}</label>
    </div>
  );
};

interface SelectorInputProps {
  id: string;
  name: string;
  placeholderText: string;
  value: string;
  onChangeCallback: (value: string) => void;
}

const SelectorInput: React.FC<SelectorInputProps> = ({
  id,
  name,
  placeholderText,
  value,
  onChangeCallback,
}) => {
  return (
    <input
      type="text"
      id={id}
      name={name}
      placeholder={placeholderText}
      value={value}
      autoComplete="off"
      onChange={(e) => onChangeCallback(e.currentTarget.value)}></input>
  );
};

const AnalyteSelectorMain: React.FC = () => {
  const [selected, setSelected] = React.useState(0); //0 means nothing is selected
  const [hovered, setHovered] = React.useState(0);
  const [diseaseCondFilters, setDiseaseCondFilters] = React.useState({});
  const [typeSearched, setTypeSearched] = React.useState(null);
  const [nameSearched, setNameSearched] = React.useState(null);
  const [typeSelected, setTypeSelected] = React.useState(null);
  const [nameSelected, setNameSelected] = React.useState(null);

  const testDropdownOptions = [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
  ];

  const defaultDiseaseCondFilters = {
    "healthy": false,
    "ebola": false,
    "hepatitis": false,
    "dermatomyositis": false,
    "hiv": false,
    "herpes zoster": false,
  };

  const dropdownRef = React.useRef(null);
  const typeSelectorRef = React.useRef(null);
  const nameSelectorRef = React.useRef(null);
  const filterSelectorRef = React.useRef(null);

  const AnalyteSelectorDivider = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 230px;
    height: 40px;
    margin: auto auto;
    border-left: ${hovered === 3 || hovered === 0 ? "1px solid black" : "none"};
    border-right: ${hovered === 1 || hovered === 0
      ? "1px solid black"
      : "none"};
    z-index: -10;
  `;

  React.useEffect(() => {
    setDiseaseCondFilters(defaultDiseaseCondFilters);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (typeSelectorRef.current.contains(event.target)) {
          setSelected(1);
        } else if (nameSelectorRef.current.contains(event.target)) {
          setSelected(2);
        } else if (filterSelectorRef.current.contains(event.target)) {
          setSelected(3);
        } else {
          setSelected(0);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, typeSelectorRef, nameSelectorRef, filterSelectorRef]);

  const typeDropdownOnClick = (type: string) => {
    setTypeSearched(type);
    setTypeSelected(type);
    setSelected(0);
  };

  const nameDropdownOnClick = (name: string) => {
    setNameSearched(name);
    setNameSelected(name);
    setSelected(0);
  };

  const diseaseCondOnClick = (disease: string) => {
    let diseaseCondFiltersNew = { ...diseaseCondFilters };
    diseaseCondFiltersNew[`${disease}`] = !diseaseCondFiltersNew[`${disease}`];
    setDiseaseCondFilters(diseaseCondFiltersNew);
  };

  const resetDiseaseCondFilters = (event) => {
    event.preventDefault();
    setDiseaseCondFilters(defaultDiseaseCondFilters);
  };

  const submitFilters = (event) => {
    event.preventDefault();
    setSelected(0);
  };

  const generateFilterOptions = (diseaseCondFilters: object) => {
    return (
      <div className="analyte-filter-content">
        <form>
          <h2 className="analyte-filter-name">Disease Condition</h2>
          <div className="analyte-filter-options-container">
            <div className="analyte-filter-form-content">
              {Object.entries(diseaseCondFilters).map(
                ([disease, checked]: [string, boolean]) => {
                  return (
                    <CheckboxButton
                      key={disease}
                      id={disease}
                      labelText={disease}
                      isChecked={checked}
                      onClickCallback={diseaseCondOnClick}
                    />
                  );
                }
              )}
            </div>
          </div>
          <div className="analyte-filter-action-container">
            <input
              type="button"
              value="Reset"
              onClick={resetDiseaseCondFilters}></input>
            <input type="submit" value="Apply" onClick={submitFilters}></input>
          </div>
        </form>
      </div>
    );
  };

  const generateDropdown = (
    styles: object,
    options: string[],
    onClickCallback: (value: string) => void
  ) => {
    return (
      <div
        ref={dropdownRef}
        className="analyte-selector-dropdown-menu"
        style={styles}>
        <div className="analyte-selector-dropdown-content">
          {options.map((optionLabel: string) => {
            return (
              <div
                className="analyte-selector-dropdown-options"
                onClick={() => {
                  onClickCallback(optionLabel);
                }}>
                <span>{`${optionLabel}`}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const filtersApplied = Object.values(diseaseCondFilters).reduce(
    (filters: number, isFilterApplied: boolean) => {
      if (isFilterApplied) {
        filters += 1;
      }
      return filters;
    },
    0
  );

  return (
    <div>
      <div className="analyte-selector-main">
        <AnalyteSelectorDivider />
        <div className="analyte-selector-dropdown">
          <div className="analyte-selector">
            <div
              ref={typeSelectorRef}
              className="analyte-selector-label-wrapper"
              onMouseEnter={() => setHovered(1)}
              onMouseLeave={() => setHovered(0)}>
              <label htmlFor="analyte-type" className="analyte-selector-label">
                Analyte Type
              </label>
              <SelectorInput
                id="analyte-type"
                name="analyte-type"
                placeholderText="What are you searching?"
                value={typeSearched}
                onChangeCallback={setTypeSearched}
              />
            </div>
          </div>
          <div className="analyte-selector">
            <div
              ref={nameSelectorRef}
              className="analyte-selector-label-wrapper"
              onMouseEnter={() => setHovered(2)}
              onMouseLeave={() => setHovered(0)}>
              <label htmlFor="analyte" className="analyte-selector-label">
                Analyte
              </label>
              <SelectorInput
                id="analyte"
                name="analyte"
                placeholderText="Analyte name"
                value={nameSearched}
                onChangeCallback={setNameSearched}
              />
              {/* <input
                type="text"
                id="analyte"
                name="analyte"
                placeholder="Analyte name"></input> */}
            </div>
          </div>
          <div className="analyte-selector">
            <div
              ref={filterSelectorRef}
              className="analyte-selector-label-wrapper"
              onMouseEnter={() => setHovered(3)}
              onMouseLeave={() => setHovered(0)}>
              <label
                htmlFor="analyte-filters"
                className="analyte-selector-label">
                Filters
              </label>
              <input
                type="text"
                id="analyte-filters"
                name="analyte-filters"
                placeholder={`${filtersApplied} filters applied`}
                readOnly></input>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const styles = {
          display: `${selected === 0 ? "none" : "block"}`,
          marginLeft: `${selected === 1 ? "0" : "auto"}`,
          marginRight: `${selected === 3 ? "0" : "auto"}`,
        };
        switch (selected) {
          case 0:
            return <div ref={dropdownRef} style={styles}></div>;
          case 1:
            const dropdown = generateDropdown(
              styles,
              testDropdownOptions,
              typeDropdownOnClick
            );
            return dropdown;
          case 2:
            const dropdown2 = generateDropdown(
              styles,
              testDropdownOptions,
              nameDropdownOnClick
            );
            return dropdown2;
          case 3:
            return (
              <div
                ref={dropdownRef}
                className="analyte-selector-dropdown-menu analyte-filter-dropdown"
                style={styles}>
                {generateFilterOptions(diseaseCondFilters)}
              </div>
            );
        }
      })()}

      <br />
    </div>
  );
};

export default AnalyteSelectorMain;
