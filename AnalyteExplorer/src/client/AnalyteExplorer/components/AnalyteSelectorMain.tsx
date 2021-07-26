import React, { MouseEvent } from "react";
import { ANALYTE_TYPE_DISPLAYNAMES, ANALYTE_TYPES } from "../helpers/constants";
import { capitalizeFirstChar } from "@labkey/components";
import { Query } from "@labkey/api";
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
  onChangeCallback: (e: React.FormEvent<HTMLInputElement>) => void;
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
      onChange={onChangeCallback}></input>
  );
};

interface AnalyteSelectorMainProps {
  typeSelectedCallback: (type: string) => void;
  nameSelectedCallback: (name: string) => void;
  filtersSelectedCallback: (filters: string[]) => void;
}

const AnalyteSelectorMain: React.FC<AnalyteSelectorMainProps> = ({
  typeSelectedCallback,
  nameSelectedCallback,
  filtersSelectedCallback,
}) => {
  const [selected, setSelected] = React.useState(0); //0 means nothing is selected
  const [hovered, setHovered] = React.useState(0);
  const [typeSearched, setTypeSearched] = React.useState("");
  const [nameSearched, setNameSearched] = React.useState("");
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");

  const [filteredTypeSuggestions, setFilteredTypeSuggestions] = React.useState(
    ANALYTE_TYPE_DISPLAYNAMES
  );
  const [filteredNameSuggestions, setFilteredNameSuggestions] = React.useState<
    string[]
  >([]);

  const [diseaseCondFilters, setDiseaseCondFilters] = React.useState<
    { condition: string; checked: boolean }[]
  >([]);

  //const [diseaseCondiFilterz, setDiseaseCondFilterz] = React.useState(new Map()<string, string>)

  const [rawNameSuggestions, setRawNameSuggestions] = React.useState({});

  const dropdownRef = React.useRef(null);
  const typeSelectorRef = React.useRef(null);
  const nameSelectorRef = React.useRef(null);
  const filterSelectorRef = React.useRef(null);

  const analyteDividerStyles = {
    borderLeft: `${
      hovered === 3 || hovered === 0 ? "1px solid black" : "none"
    }`,
    borderRight: `${
      hovered === 1 || hovered === 0 ? "1px solid black" : "none"
    }`,
  };

  const elevateSelections = () => {
    if (nameSelected !== "") {
      let checkedFilters: string[] = [];
      for (const { condition, checked } of diseaseCondFilters) {
        if (checked) {
          checkedFilters.push(condition.trim().replaceAll(" ", "_"));
        }
      }
      if (checkedFilters.length > 0) {
        typeSelectedCallback(typeSelected);
        nameSelectedCallback(nameSelected);
        filtersSelectedCallback(checkedFilters);
      }
    }
  };

  // closes dropdown box when the user clicks outside of the dropdown box
  // opens new dropdown if user clicks on filter
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
          //elevateSelections();
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, typeSelectorRef, nameSelectorRef, filterSelectorRef]);

  const typeInputOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const suggestions = ANALYTE_TYPE_DISPLAYNAMES;
    const userInput = event.currentTarget.value;
    if (userInput !== "") {
      const filteredSuggestions = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().indexOf(userInput.toLowerCase()) === 0
      );

      setFilteredTypeSuggestions(filteredSuggestions);
    } else {
      setFilteredTypeSuggestions(ANALYTE_TYPE_DISPLAYNAMES);
    }
    setTypeSearched(userInput);
  };

  const nameInputOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const userInput = event.currentTarget.value;
    setNameSearched(userInput);
  };

  // confirm the analyte type selection
  const typeDropdownOnClick = (type: string) => {
    setTypeSearched(type);
    setTypeSelected(type);
    setSelected(0);
    for (const { type: analyteType, displayName } of ANALYTE_TYPES) {
      // this might look rly bad but ANALYTE_TYPES has a length of 2 so it's ok
      if (type === displayName) {
        typeSelectedCallback(analyteType);
      }
    }
  };

  const setTypeFromName = (name: string) => {
    if (typeSelected === "" && rawNameSuggestions["rows"] !== undefined) {
      for (const { analyte_id, analyte_type } of rawNameSuggestions["rows"]) {
        if (name === analyte_id) {
          for (const { type, displayName } of ANALYTE_TYPES) {
            // this might look rly bad but ANALYTE_TYPES has a length of 2 so it's ok
            if (analyte_type === type) {
              setTypeSelected(displayName);
              setTypeSearched(displayName);
              typeSelectedCallback(type);
            }
          }
        }
      }
    }
  };

  // confirm the analyte name selection
  const nameDropdownOnClick = (name: string) => {
    setNameSearched(name);
    setNameSelected(name);
    setTypeFromName(name);
    setSelected(0);
    nameSelectedCallback(name);
    //elevateSelections();
  };

  // check and uncheck disease condition checkboxes
  const diseaseCondOnClick = (disease: string) => {
    let diseaseCondFiltersNew = [...diseaseCondFilters];
    for (const diseaseCond of diseaseCondFiltersNew) {
      if (diseaseCond.condition === disease) {
        diseaseCond.checked = !diseaseCond.checked;
      }
    }
    setDiseaseCondFilters(diseaseCondFiltersNew);
  };

  // uncheck all disease condition checkboxes
  const resetDiseaseCondFilters = (event) => {
    event.preventDefault();
    const defaultCondFilters = [...diseaseCondFilters];
    for (const diseaseCond of defaultCondFilters) {
      diseaseCond.checked = false;
    }
    setDiseaseCondFilters(defaultCondFilters);
  };

  const submitFilters = (event) => {
    event.preventDefault();
    let checkedFilters: string[] = [];
    for (const { condition, checked } of diseaseCondFilters) {
      if (checked) {
        checkedFilters.push(condition.trim().replaceAll(" ", "_"));
      }
    }
    if (checkedFilters.length > 0) {
      filtersSelectedCallback(checkedFilters);
    }
    setSelected(0);
  };

  const getSuggestedAnalyteNames = (
    data: { analyte_id: string; analyte_type: string }[]
  ): string[] => {
    const analyteNames = data.map((analyte) => {
      return analyte["analyte_id"];
    });
    return analyteNames;
  };

  React.useEffect(() => {
    let isCancelled = false;
    const getDiseaseConditionQuery = (analyte: string): string => {
      if (analyte === "") {
        return `SELECT DISTINCT gene_expression.condition AS condition
                FROM gene_expression
                `;
      }
      return `SELECT DISTINCT gene_expression.condition AS condition
              FROM gene_expression
              WHERE gene_expression.analyte_id = '${analyte}'`;
    };

    const parseDiseaseCondData = (data: any) => {
      if (
        !isCancelled &&
        data !== undefined &&
        data !== null &&
        data.rows !== undefined
      ) {
        const diseaseConds = data.rows.map(
          (condition: { condition: string }) => {
            const disease = condition["condition"].replaceAll("_", " ");
            return { condition: disease, checked: false };
          }
        );

        setDiseaseCondFilters(diseaseConds);
      }
    };

    const getDiseaseConds = () => {
      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: getDiseaseConditionQuery(nameSelected),
        success: parseDiseaseCondData,
      });
    };
    getDiseaseConds();
    return () => {
      isCancelled = true;
    };
  }, [nameSelected]);

  React.useEffect(() => {
    let isCancelled = false;
    const parseNameSuggestionData = (data: any) => {
      if (
        !isCancelled &&
        data !== undefined &&
        data !== null &&
        data.rows !== undefined &&
        data.rows !== null
      ) {
        setFilteredNameSuggestions(getSuggestedAnalyteNames(data.rows));
        setRawNameSuggestions(data);
      }
    };

    const callLabkey = () => {
      let filterType = "";
      for (const { type, displayName } of ANALYTE_TYPES) {
        if (displayName === typeSelected) {
          filterType = type;
        }
      }
      const checkedFilters = diseaseCondFilters.map(
        ({ condition, checked }) => {
          if (checked) {
            return condition.trim().replaceAll(" ", "_");
          }
        }
      );
      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT gene_expression.analyte_id AS analyte_id, gene_expression.analyte_type AS analyte_type
              FROM gene_expression
              WHERE gene_expression.analyte_id LIKE '${nameSearched.toUpperCase()}%'
              ${
                filterType === ""
                  ? ""
                  : `AND gene_expression.analyte_type = '${filterType}'`
              }
              LIMIT 5`,
        success: parseNameSuggestionData,
      });
    };
    callLabkey();
    return () => {
      isCancelled = true;
    };
  }, [typeSelected, nameSearched]);

  const generateFilterOptions = (
    diseaseCondFilters: { condition: string; checked: boolean }[]
  ) => {
    return (
      <div className="analyte-filter-content">
        <form>
          <h2 className="analyte-filter-name">Disease Condition</h2>
          <div className="analyte-filter-options-container">
            <div className="analyte-filter-form-content">
              {diseaseCondFilters.map(
                ({
                  condition,
                  checked,
                }: {
                  condition: string;
                  checked: boolean;
                }) => {
                  return (
                    <CheckboxButton
                      key={condition}
                      id={condition}
                      labelText={condition}
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
          {options.length < 1 ? (
            <span className="analyte-selector-no-results-text">
              NO RESULTS FOUND
            </span>
          ) : (
            options.map((optionLabel: string) => {
              return (
                <div
                  className="analyte-selector-dropdown-options"
                  onClick={() => {
                    onClickCallback(optionLabel);
                  }}>
                  <span>{`${optionLabel}`}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const filtersApplied = diseaseCondFilters.reduce(
    (filters: number, diseaseCond: { condition: string; checked: boolean }) => {
      if (diseaseCond.checked) {
        filters += 1;
      }
      return filters;
    },
    0
  );

  //analyte-selector-dropdown
  return (
    <div>
      <div className="analyte-selector-main">
        {/* <AnalyteSelectorDivider /> */}
        <div
          className="analyte-selector-divider"
          style={analyteDividerStyles}></div>
        <div className="analyte-selector-dropdown">
          <div
            className={`analyte-selector ${selected === 1 ? "selected" : ""}`}>
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
                value={capitalizeFirstChar(typeSearched)}
                onChangeCallback={typeInputOnChange}
              />
            </div>
          </div>
          <div
            className={`analyte-selector ${selected === 2 ? "selected" : ""}`}>
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
                onChangeCallback={nameInputOnChange}
              />
              {/* <input
                type="text"
                id="analyte"
                name="analyte"
                placeholder="Analyte name"></input> */}
            </div>
          </div>
          <div
            className={`analyte-selector ${selected === 3 ? "selected" : ""}`}>
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
              filteredTypeSuggestions,
              typeDropdownOnClick
            );
            return dropdown;
          case 2:
            const dropdown2 = generateDropdown(
              styles,
              filteredNameSuggestions,
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
