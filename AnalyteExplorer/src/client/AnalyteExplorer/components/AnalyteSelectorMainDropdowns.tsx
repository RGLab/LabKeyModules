import React from "react";

interface SelectorDropdownProps {
  searchTerm: string;
  options: string[];
  onClickCallback: (value: string) => void;
}
export const SelectorDropdown: React.FC<SelectorDropdownProps> = ({
  searchTerm,
  options,
  onClickCallback,
}) => {
  return (
    <div className="analyte-selector-dropdown-content">
      {options.length < 1 ? (
        <span className="analyte-selector-no-results-text">
          {searchTerm === ""
            ? "PLEASE SEARCH AN ANALYTE"
            : "NO MATCHING ANALYTE FOUND"}
        </span>
      ) : (
        <ul>
          {options.map((optionLabel: string) => {
            return (
              <li
                key={optionLabel}
                className="analyte-selector-dropdown-options"
                onClick={() => {
                  onClickCallback(optionLabel);
                }}>
                <span>{`${optionLabel}`}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

interface CheckboxButtonProps {
  id: string;
  labelText: string;
  isChecked: boolean;
  onClickCallback: (disease: string) => void;
}

export const CheckboxButton: React.FC<CheckboxButtonProps> = ({
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
        checked={isChecked}
        onChange={() => onClickCallback(id)}></input>
      <label htmlFor={id}>{`${labelText}`}</label>
    </div>
  );
};

interface FilterDropdownProps {
  diseaseCondFilters: {
    [condition: string]: boolean;
  };
  onClickCallback: (value: string) => void;
  resetCallback: () => void;
  submitCallback: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  diseaseCondFilters,
  onClickCallback,
  resetCallback,
  submitCallback,
}) => {
  return (
    <div className="analyte-filter-content">
      <form>
        <h2 className="analyte-filter-name">Disease Condition</h2>
        <div className="analyte-filter-options-container">
          <div className="analyte-filter-form-content">
            {Object.entries(diseaseCondFilters).map(
              ([condition, checked]: [string, boolean]) => {
                return (
                  <CheckboxButton
                    key={condition}
                    id={condition}
                    labelText={condition}
                    isChecked={checked}
                    onClickCallback={onClickCallback}
                  />
                );
              }
            )}
          </div>
        </div>
        <div className="analyte-filter-action-container">
          <input type="button" value="Reset" onClick={resetCallback}></input>
          <input type="submit" value="Apply" onClick={submitCallback}></input>
        </div>
      </form>
    </div>
  );
};
