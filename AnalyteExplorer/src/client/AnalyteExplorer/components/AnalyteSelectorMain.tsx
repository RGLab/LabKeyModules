import React, { MouseEvent } from "react";
import {
  ANALYTE_ALL,
  ANALYTE_TYPE_DISPLAYNAMES,
  FILTER_DROPDOWN_ROW_COUNT,
} from "../helpers/constants";
import { capitalizeFirstChar } from "@labkey/components";
import {
  convertDisplayToColumn,
  convertColumnToDisplay,
  binaryClosestSearch,
} from "../helpers/helperFunctions";
import { Query } from "@labkey/api";
import "./AnalyteSelectorMain.scss";
import { BsSearch } from "react-icons/bs";

interface SearchButtonProps {
  onClickCallback: (event: React.MouseEvent) => void;
  disabled?: boolean;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClickCallback }) => {
  return (
    <button className="analyte-selector-search-btn" onClick={onClickCallback}>
      <BsSearch className="ae-search-icon" />
    </button>
  );
};

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

export interface FilterNameSuggestions {
  [analyte_type: string]: { analyte_id: string; analyte_type: string }[];
}

interface AnalyteSelectorMainProps {
  searchBtnCallback: (
    analyte_type: string,
    analyte_name: string,
    filters: string[]
  ) => void;
  typedFilterNameSuggestions: FilterNameSuggestions;
  untypedFilterNameSuggestions: { analyte_id: string; analyte_type: string }[];
  conditionData: any;
}

const AnalyteSelectorMain: React.FC<AnalyteSelectorMainProps> = ({
  searchBtnCallback,
  typedFilterNameSuggestions,
  untypedFilterNameSuggestions,
  conditionData,
}) => {
  const [selected, setSelected] = React.useState(0); //0 means nothing is selected
  const [hovered, setHovered] = React.useState(0);
  const [nameSearched, setNameSearched] = React.useState("");
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");

  const [filteredTypeSuggestions, setFilteredTypeSuggestions] = React.useState(
    ANALYTE_TYPE_DISPLAYNAMES
  );
  const [filterNameSuggestions, setFilterNameSuggestions] = React.useState<{
    [analyte_name: string]: string;
  }>({});

  const [conditionFilters, setConditionFilters] = React.useState<{
    [condition: string]: boolean;
  }>({});

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

  const searchBtnOnClick = () => {
    if (nameSelected !== "") {
      let type = "";
      let filters: string[] = [];
      if (typeSelected !== "" && typeSelected !== ANALYTE_ALL) {
        type = convertDisplayToColumn(typeSelected);
      }

      for (const [condition, checked] of Object.entries(conditionFilters)) {
        if (checked) {
          filters.push(condition);
        }
      }

      filters.sort();

      if (filters.length > 0) {
        //callback to download page
        searchBtnCallback(type, nameSelected, filters);
      }
    }
  };

  // const typeInputOnChange = (event: React.FormEvent<HTMLInputElement>) => {
  //   const suggestions = ANALYTE_TYPE_DISPLAYNAMES;
  //   const userInput = event.currentTarget.value;
  //   if (userInput !== "") {
  //     const filteredSuggestions = suggestions.filter(
  //       (suggestion) =>
  //         suggestion.toLowerCase().indexOf(userInput.toLowerCase()) === 0
  //     );

  //     setFilteredTypeSuggestions(filteredSuggestions);
  //   } else {
  //     setFilteredTypeSuggestions(ANALYTE_TYPE_DISPLAYNAMES);
  //   }
  //   setTypeSearched(userInput);
  // };

  const nameInputOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const userInput = event.currentTarget.value;
    const userInputCaps = userInput.toUpperCase();
    let filteredNames: { [analyte_name: string]: string } = {};

    if (userInput !== "") {
      if (typeSelected === ANALYTE_ALL || typeSelected === "") {
        console.time("search");
        let index = binaryClosestSearch(
          userInputCaps,
          untypedFilterNameSuggestions,
          0,
          untypedFilterNameSuggestions.length - 1
        );
        console.timeEnd("search");
        const suggestions = untypedFilterNameSuggestions.slice(
          index,
          index + FILTER_DROPDOWN_ROW_COUNT
        );
        for (const analyte of suggestions) {
          if (analyte["analyte_id"].includes(userInputCaps)) {
            filteredNames[analyte["analyte_id"]] = analyte["analyte_type"];
          }
        }
      } else {
        const columnTypeName = convertDisplayToColumn(typeSelected);
        let index = binaryClosestSearch(
          userInputCaps,
          typedFilterNameSuggestions[columnTypeName],
          0,
          typedFilterNameSuggestions[columnTypeName].length - 1
        );
        const suggestions = typedFilterNameSuggestions[columnTypeName].slice(
          index,
          index + FILTER_DROPDOWN_ROW_COUNT
        );
        for (const analyte of suggestions) {
          if (analyte["analyte_id"].includes(userInputCaps)) {
            filteredNames[analyte["analyte_id"]] = analyte["analyte_type"];
          }
        }
      }
    }

    setFilterNameSuggestions(filteredNames);
    setNameSearched(userInput);
  };

  // confirm the analyte type selection
  const typeDropdownOnClick = (type: string) => {
    setTypeSelected(type);

    // clear analyte and filters
    if (nameSearched !== "") {
      setNameSearched("");
    }
    setNameSelected("");
    setFilterNameSuggestions({});
    setSelected(0);
  };

  // if type isn't set when selecting analyte, set type for user
  const setTypeFromName = (name: string) => {
    if (typeSelected === "") {
      const type = convertColumnToDisplay(filterNameSuggestions[name]);
      setTypeSelected(type);
    }
  };

  // uncheck all disease condition checkboxes
  const resetDiseaseCondFilters = () => {
    const defaultConds = { ...conditionFilters };
    Object.keys(defaultConds).forEach((key) => (defaultConds[key] = false));
    setConditionFilters(defaultConds);
  };

  const submitFilters = (event) => {
    event.preventDefault();
    setSelected(0);
  };

  // confirm the analyte name selection
  const nameDropdownOnClick = (name: string) => {
    setNameSearched(name);
    setNameSelected(name);
    setTypeFromName(name);
    setSelected(0);
  };

  // check and uncheck disease condition checkboxes
  const diseaseCondOnClick = (disease: string) => {
    let newConditionFilters = { ...conditionFilters };
    newConditionFilters[disease] = !newConditionFilters[disease];
    setConditionFilters(newConditionFilters);
  };

  React.useEffect(() => {
    // let isCancelled = false;

    // const parseDiseaseCondData = (data: any) => {
    //   if (
    //     !isCancelled &&
    //     data !== undefined &&
    //     data !== null &&
    //     data.rows !== undefined
    //   ) {
    //     const conditions = {};
    //     data.rows.forEach((condition: { condition: string }) => {
    //       const disease = condition["condition"].replaceAll("_", " ");
    //       conditions[disease] = false;
    //     });

    //     setConditionFilters(conditions);
    //   }
    // };

    // const getDiseaseConds = () => {
    //   Query.executeSql({
    //     containerPath: "/AnalyteExplorer",
    //     schemaName: "lists",
    //     sql: `SELECT DISTINCT gene_expression.condition AS condition
    //     FROM gene_expression
    //     `,
    //     success: parseDiseaseCondData,
    //   });
    // };

    // if (!isCancelled) {
    //   console.log("fetching disease cond");
    //   getDiseaseConds();
    // }

    // return () => {
    //   isCancelled = true;
    // };
    const conditions = {};
    conditionData.rows.forEach((condition: { condition: string }) => {
      const disease = condition["condition"].replaceAll("_", " ");
      conditions[disease] = false;
    });

    setConditionFilters(conditions);
  }, []);

  const generateFilterOptions = (
    diseaseCondFilters: {
      [condition: string]: boolean;
    },
    onClickCallback: (value: string) => void
  ) => {
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
              {nameSearched === ""
                ? "PLEASE SEARCH AN ANALYTE"
                : "NO RESULTS FOUND"}
            </span>
          ) : (
            <ul>
              {options.map((optionLabel: string) => {
                return (
                  <li
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
      </div>
    );
  };

  // memoize this?
  const filtersApplied = Object.values(conditionFilters).reduce(
    (filters: number, checked) => {
      if (checked) {
        filters += 1;
      }
      return filters;
    },
    0
  );

  return (
    <div style={{ zIndex: 20 }}>
      <div className="analyte-selector-main">
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
              <input
                id="analyte-type"
                name="analyte-type"
                placeholder="What are you searching?"
                value={capitalizeFirstChar(typeSelected)}
                readOnly
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
          <div
            className="analyte-selector-divider"
            style={analyteDividerStyles}></div>
        </div>
        <SearchButton onClickCallback={searchBtnOnClick} />
        {(() => {
          let styles = {
            display: `${selected === 0 ? "none" : "block"}`, //will need to fix
            //marginLeft: `${selected === 1 ? "0" : "auto"}`,
            //marginRight: `${selected === 3 ? "0" : "auto"}`,
            //left: `${selected === 1 ? "0"}`
          };
          if (selected === 2) {
            styles["left"] = "20%"; //will need to fix how menu generates
          }
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
                Object.keys(filterNameSuggestions),
                nameDropdownOnClick
              );
              return dropdown2;
            case 3:
              return (
                <div
                  ref={dropdownRef}
                  className="analyte-selector-dropdown-menu analyte-filter-dropdown"
                  style={styles}>
                  {generateFilterOptions(conditionFilters, diseaseCondOnClick)}
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
};

export default AnalyteSelectorMain;
