import React from "react";
import {
  ANALYTE_TYPE_DISPLAYNAMES,
  STATE_OF_SELECTOR,
} from "../helpers/constants";
import {
  capitalizeFirstLetter,
  convertColumnToDisplay,
  getFilteredNames,
  searchBtnOnClickHelper,
} from "../helpers/helperFunctions";
import "./AnalyteSelectorMain.scss";
import { BsSearch } from "react-icons/bs";
import {
  SelectorDropdown,
  FilterDropdown,
} from "./AnalyteSelectorMainDropdowns";

interface SearchButtonProps {
  onClickCallback: (event: React.MouseEvent) => void;
  disabled?: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  onClickCallback,
}) => {
  return (
    <button
      className="analyte-selector-search-btn"
      onClick={onClickCallback}
      name="search-button">
      <BsSearch className="ae-search-icon" />
    </button>
  );
};

export interface UntypedFilterNameSuggestions {
  analyte_id: string;
  analyte_type: string;
}

export interface TypedFilterNameSuggestions {
  [analyte_type: string]: UntypedFilterNameSuggestions[];
}

interface AnalyteSelectorMainProps {
  searchBtnCallback: (
    analyte_type: string,
    analyte_name: string,
    filters: string[]
  ) => void;
  typedFilterNameSuggestions: TypedFilterNameSuggestions;
  untypedFilterNameSuggestions: UntypedFilterNameSuggestions[];
  conditionData: any;
}

const AnalyteSelectorMain: React.FC<AnalyteSelectorMainProps> = ({
  searchBtnCallback,
  typedFilterNameSuggestions,
  untypedFilterNameSuggestions,
  conditionData,
}) => {
  const [selected, setSelected] = React.useState(STATE_OF_SELECTOR.CLOSED); //0 means nothing is selected
  const [hovered, setHovered] = React.useState(0);
  const [nameSearched, setNameSearched] = React.useState("");
  const [typeSelected, setTypeSelected] = React.useState("");
  const [nameSelected, setNameSelected] = React.useState("");

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

  const analyteDividerStyles = React.useMemo(() => {
    return {
      borderLeft: `${
        (selected === STATE_OF_SELECTOR.FILTERS_OPEN ||
          selected === STATE_OF_SELECTOR.CLOSED) &&
        (hovered === 3 || hovered === 0)
          ? "1px solid black"
          : "none"
      }`,
      borderRight: `${
        (selected === STATE_OF_SELECTOR.TYPE_OPEN ||
          selected === STATE_OF_SELECTOR.CLOSED) &&
        (hovered === 1 || hovered === 0)
          ? "1px solid black"
          : "none"
      }`,
    };
  }, [hovered, selected]);

  // closes dropdown box when the user clicks outside of the dropdown box
  // opens new dropdown if user clicks on selector
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (typeSelectorRef.current.contains(event.target)) {
          setSelected(STATE_OF_SELECTOR.TYPE_OPEN);
        } else if (nameSelectorRef.current.contains(event.target)) {
          setSelected(STATE_OF_SELECTOR.NAME_OPEN);
        } else if (filterSelectorRef.current.contains(event.target)) {
          setSelected(STATE_OF_SELECTOR.FILTERS_OPEN);
        } else {
          setSelected(STATE_OF_SELECTOR.CLOSED);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, typeSelectorRef, nameSelectorRef, filterSelectorRef]);

  const searchBtnOnClick = React.useCallback(() => {
    // do nothing if no analyte selected
    if (nameSelected !== "") {
      const callbackData = searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedFilterNameSuggestions
      );

      if (callbackData.filters.length > 0) {
        //callback to download page
        searchBtnCallback(
          callbackData.type,
          callbackData.name,
          callbackData.filters
        );
      }
    }
  }, [typeSelected, nameSelected, conditionFilters]);

  // Updates the list of five suggestions in the analyte selector upon change in
  // user input
  const nameInputOnChange = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const userInput = event.currentTarget.value;
      const userInputCaps = userInput.toUpperCase();
      let filteredNames: { [analyte_name: string]: string } = {};
      if (userInputCaps != "") {
        filteredNames = getFilteredNames(
          userInputCaps,
          typeSelected,
          typedFilterNameSuggestions,
          untypedFilterNameSuggestions
        );
      }
      setFilterNameSuggestions(filteredNames);
      setNameSearched(userInput);
    },
    [typeSelected, untypedFilterNameSuggestions, typedFilterNameSuggestions]
  );

  // confirm the analyte type selection
  const typeDropdownOnClick = React.useCallback(
    (type: string) => {
      setTypeSelected(type);

      // clear analyte and filters
      if (nameSearched !== "") {
        setNameSearched("");
      }
      setNameSelected("");
      setFilterNameSuggestions({});
      setSelected(STATE_OF_SELECTOR.CLOSED);
    },
    [nameSearched]
  );

  // if type isn't set when selecting analyte, set type for user
  const setTypeFromName = (name: string) => {
    if (typeSelected === "") {
      const type = convertColumnToDisplay(filterNameSuggestions[name]);
      setTypeSelected(type);
    }
  };

  // uncheck all disease condition checkboxes
  const resetDiseaseCondFilters = React.useCallback(() => {
    const defaultConds = { ...conditionFilters };
    Object.keys(defaultConds).forEach((key) => (defaultConds[key] = false));
    setConditionFilters(defaultConds);
  }, [conditionFilters]);

  const submitFilters = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setSelected(STATE_OF_SELECTOR.CLOSED);
    },
    []
  );

  const selectAllOnClick = React.useCallback(() => {
    const defaultConds = { ...conditionFilters };
    Object.keys(defaultConds).forEach((key) => (defaultConds[key] = true));
    setConditionFilters(defaultConds);
  }, [conditionFilters]);

  // confirm the analyte name selection
  const nameDropdownOnClick = (name: string) => {
    setNameSearched(name);
    setNameSelected(name);
    setTypeFromName(name);
    setSelected(STATE_OF_SELECTOR.CLOSED);
  };

  // check and uncheck disease condition checkboxes
  const diseaseCondOnClick = (disease: string) => {
    let newConditionFilters = { ...conditionFilters };
    newConditionFilters[disease] = !newConditionFilters[disease];
    setConditionFilters(newConditionFilters);
  };

  React.useEffect(() => {
    const conditions = {};
    conditionData.rows.forEach((condition: { condition: string }) => {
      const disease = condition["condition"].replaceAll("_", " ");
      conditions[disease] = false;
    });

    setConditionFilters(conditions);
  }, []);

  const filtersApplied = React.useMemo(() => {
    return Object.values(conditionFilters).reduce(
      (numFiltersApplied: number, checked) => {
        if (checked) {
          numFiltersApplied += 1;
        }
        return numFiltersApplied;
      },
      0
    );
  }, [conditionFilters]);

  const dropdownMenuStyles = React.useMemo(() => {
    let styles = {
      display: `${selected === STATE_OF_SELECTOR.CLOSED ? "none" : "block"}`, // can make all 3 dropdowns use the same component
    };
    if (selected === STATE_OF_SELECTOR.NAME_OPEN) {
      styles["left"] = "20%"; //will need to fix how menu generates
    }
    return styles;
  }, [selected]);

  return (
    <div style={{ zIndex: 20 }}>
      <div className="analyte-selector-main">
        <div className="analyte-selector-dropdown">
          <div
            className={`analyte-selector ${
              selected === STATE_OF_SELECTOR.TYPE_OPEN ? "selected" : ""
            }`}>
            <div
              ref={typeSelectorRef}
              className="analyte-selector-label-wrapper"
              onMouseEnter={() => setHovered(1)}
              onMouseLeave={() => setHovered(0)}>
              <label htmlFor="analyte-type" className="analyte-selector-label">
                <div>Analyte Type</div>
                <input
                  id="analyte-type"
                  name="analyte-type"
                  placeholder="What are you searching?"
                  value={capitalizeFirstLetter(typeSelected)}
                  readOnly
                />
              </label>
            </div>
          </div>
          <div
            className={`analyte-selector ${
              selected === STATE_OF_SELECTOR.NAME_OPEN ? "selected" : ""
            }`}>
            <div
              ref={nameSelectorRef}
              className="analyte-selector-label-wrapper"
              onMouseEnter={() => setHovered(2)}
              onMouseLeave={() => setHovered(0)}>
              <label htmlFor="analyte" className="analyte-selector-label">
                <div>Analyte</div>
                <input
                  id="analyte"
                  name="analyte"
                  placeholder="Analyte name"
                  value={nameSearched}
                  onChange={nameInputOnChange}
                  autoComplete="off"
                />
              </label>
            </div>
          </div>
          <div
            className={`analyte-selector with-search ${
              selected === STATE_OF_SELECTOR.FILTERS_OPEN ? "selected" : ""
            }`}>
            <div
              ref={filterSelectorRef}
              className="analyte-selector-label-wrapper"
              onMouseEnter={() => setHovered(3)}
              onMouseLeave={() => setHovered(0)}>
              <label
                htmlFor="analyte-filters"
                className="analyte-selector-label">
                <div>Conditions</div>
                <input
                  type="text"
                  id="analyte-filters"
                  name="analyte-filters"
                  placeholder={`${filtersApplied} filters applied`}
                  readOnly
                />
              </label>
            </div>
            <SearchButton onClickCallback={searchBtnOnClick} />
          </div>
          <div
            className="analyte-selector-divider"
            style={analyteDividerStyles}></div>
        </div>
        {(() => {
          switch (selected) {
            case STATE_OF_SELECTOR.CLOSED:
              return <div ref={dropdownRef} style={dropdownMenuStyles}></div>;
            case STATE_OF_SELECTOR.TYPE_OPEN:
              return (
                <div
                  ref={dropdownRef}
                  className="analyte-selector-dropdown-menu"
                  style={dropdownMenuStyles}>
                  <SelectorDropdown
                    searchTerm={nameSearched}
                    options={ANALYTE_TYPE_DISPLAYNAMES}
                    onClickCallback={typeDropdownOnClick}
                  />
                </div>
              );
            case STATE_OF_SELECTOR.NAME_OPEN:
              return (
                <div
                  ref={dropdownRef}
                  className="analyte-selector-dropdown-menu"
                  style={dropdownMenuStyles}>
                  <SelectorDropdown
                    searchTerm={nameSearched}
                    options={Object.keys(filterNameSuggestions)}
                    onClickCallback={nameDropdownOnClick}
                  />
                </div>
              );
            case STATE_OF_SELECTOR.FILTERS_OPEN:
              return (
                <div
                  ref={dropdownRef}
                  className="analyte-selector-dropdown-menu analyte-filter-dropdown"
                  style={dropdownMenuStyles}>
                  <FilterDropdown
                    diseaseCondFilters={conditionFilters}
                    onClickCallback={diseaseCondOnClick}
                    resetCallback={resetDiseaseCondFilters}
                    submitCallback={selectAllOnClick}
                  />
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
};

export default AnalyteSelectorMain;
