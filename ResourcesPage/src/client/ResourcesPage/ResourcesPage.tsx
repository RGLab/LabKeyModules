/*  ----------------
       Imports
------------------ */

// Libraries
import * as React from "react";
import * as LABKEY from "@labkey/api";

import "regenerator-runtime/runtime";

// Components
import { ImmuneSpaceR } from "./ImmuneSpaceR";
import { Tools } from "./Tools";
import { Reports } from "./Reports";
import StudyStatistics from "./StudyStatistics";
import TabBar from "./components/TabBar";
import { CSSTransition } from "react-transition-group";

// Helpers
import {
  TransformedMaData,
  PmDataRange,
  TransformedPmData,
  transformLogData,
  transformCiteData,
  transformSdyMetaData,
} from "./StudyStatsTransformationFunctions";
import { fetchApiData } from "./FetchApiData";

// Stylings
import "./ResourcesPage.scss";

// Typings
import { BarPlotDatum } from "./PlotComponents/mostCitedBarPlot";
import {
  ScatterPlotDatum,
  ScatterPlotDataRange,
} from "./PlotComponents/similarStudyScatterPlot";

// Constants
import {
  TAB_REPORTS,
  TAB_MOSTACCESSED,
  TAB_MOSTCITED,
  TAB_SIMILARSTUDIES,
  TAB_TOOLS,
  TAB_IMMUNESPACER,
  TAB_STUDYSTATS,
  tabInfo,
} from "./constants";

/*  ----------------
      Main
------------------ */

const ResourcesPage: React.FC = () => {
  const labkeyBaseUrl = LABKEY.ActionURL.getBaseURL();
  const apiBase = labkeyBaseUrl + "_proxy/plumber/";

  /*  ----------------
      Linkable Tabs
    ------------------ */
  // const nonDropdownTabNames = [TAB_REPORTS, TAB_TOOLS, TAB_IMMUNESPACER];

  // const dropdownTabNames = [
  //   TAB_MOSTACCESSED,
  //   TAB_MOSTCITED,
  //   TAB_SIMILARSTUDIES,
  // ];

  const tabNames = React.useMemo(() => {
    return [TAB_STUDYSTATS, TAB_TOOLS, TAB_IMMUNESPACER];
  }, [TAB_STUDYSTATS, TAB_TOOLS, TAB_IMMUNESPACER]);

  // finds the value of "tab" parameter in url
  const getCurrentTabParam = (): string => {
    const params = new URL(`${document.location}`).searchParams;
    const tabName = params.get("tab");
    return tabName;
  };

  const [activeTab, setActiveTab] = React.useState(
    getCurrentTabParam() ?? TAB_STUDYSTATS
  );

  /* 
    When a new tab is selected, append the appropriate parameter to the end of the url
    and updates the url. Creates new history entries that allows user to traverse tabs 
    using the foward and back buttons. Does not refresh the page.

    https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  */
  const changeTabParam = (newActiveTab: string) => {
    const url = new URL(`${window.location}`);
    url.searchParams.set("tab", newActiveTab);
    window.history.pushState({ tab: newActiveTab }, "", `${url}`);
    setActiveTab(newActiveTab);
  };

  // handles forward/back button clicks
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  window.onpopstate = (event: PopStateEvent) => {
    if (event.state !== null && tabNames.includes(event.state.tab)) {
      setActiveTab(event.state.tab);
    }
  };

  React.useEffect(() => {
    const defaultActiveTab = getCurrentTabParam() ?? TAB_STUDYSTATS;
    const url = new URL(`${window.location}`);
    url.searchParams.set("tab", defaultActiveTab);
    window.history.replaceState({ tab: defaultActiveTab }, "", `${url}`);
    //changeTabParam(activeTab);
  }, []);

  /*  ----------------
        StudyStats Data
    ------------------ */

  // RAW
  const [pmData, setPmData] = React.useState({});
  const [pmHasError, setPmErrors] = React.useState(false);

  const [ssData, setSsData] = React.useState({});
  const [ssHasError, setSsErrors] = React.useState(false);

  const [maData, setMaData] = React.useState();
  const [maHasError, setMaErrors] = React.useState(false);

  React.useEffect(() => {
    fetchApiData({
      apiBase,
      fileSuffix: "pubmed_data",
      setData: setPmData,
      setErrors: setPmErrors,
    });
    fetchApiData({
      apiBase,
      fileSuffix: "sdy_metadata",
      setData: setSsData,
      setErrors: setSsErrors,
    });
    fetchApiData({
      apiBase,
      fileSuffix: "log_data",
      setData: setMaData,
      setErrors: setMaErrors,
    });
  }, []);

  // TRANSFORMED
  const [transformedSsData, setTransformedSsData] = React.useState<
    ScatterPlotDatum[]
  >([]);
  const [ssDataRange, setSsDataRange] = React.useState<ScatterPlotDataRange>({
    x: [],
    y: [],
  });

  React.useEffect(() => {
    if (typeof ssData !== "undefined") {
      transformSdyMetaData(ssData, setTransformedSsData, setSsDataRange);
    }
  }, [ssData]);

  const [transformedMaData, setTransformedMaData] =
    React.useState<TransformedMaData>({
      byStudy: [],
      byMonth: [],
    });

  React.useEffect(() => {
    if (typeof maData !== "undefined") {
      transformLogData(maData, setTransformedMaData);
    }
  }, [maData]);

  const [transformedPmData, setTransformedPmData] =
    React.useState<TransformedPmData>({
      byPubId: [],
    });

  const [pmDataRange, setPmDataRange] = React.useState<PmDataRange>({
    byPubId: [],
  });

  React.useEffect(() => {
    if (typeof pmData !== "undefined") {
      transformCiteData(pmData, setTransformedPmData, setPmDataRange);
    }
  }, [pmData]);

  /*  ----------------
        NavBar & Content
    ------------------ */

  const getTabContent = React.useCallback(() => {
    return (
      <React.Fragment>
        <CSSTransition
          in={activeTab === TAB_STUDYSTATS}
          timeout={300}
          classNames="immunespace-tabpanel">
          <div
            id={`${tabInfo[0].id}-panel`}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`${tabInfo[0].id}-tab`}
            hidden={activeTab !== TAB_STUDYSTATS}>
            <StudyStatistics
              maData={transformedMaData}
              mcData={transformedPmData}
              ssData={transformedSsData}
              ssDataRange={ssDataRange}
              pmDataRange={pmDataRange}
              labkeyBaseUrl={labkeyBaseUrl}
            />
          </div>
        </CSSTransition>

        <CSSTransition
          in={activeTab === TAB_TOOLS}
          timeout={300}
          classNames="immunespace-tabpanel">
          <div
            id={`${tabInfo[1].id}-panel`}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`${tabInfo[1].id}-tab`}
            hidden={activeTab !== TAB_TOOLS}>
            <Tools />
          </div>
        </CSSTransition>

        <CSSTransition
          in={activeTab === TAB_IMMUNESPACER}
          timeout={300}
          classNames="immunespace-tabpanel">
          <div
            id={`${tabInfo[2].id}-panel`}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`${tabInfo[2].id}-tab`}
            hidden={activeTab !== TAB_IMMUNESPACER}>
            <ImmuneSpaceR />
          </div>
        </CSSTransition>
      </React.Fragment>
    );
  }, [
    transformedPmData,
    transformedSsData,
    transformedMaData,
    tabInfo,
    activeTab,
  ]);

  return (
    <div className="immunespace-tabContainer">
      <TabBar
        tabInfo={tabInfo}
        onSelect={changeTabParam}
        defaultTab={activeTab}
      />
      {getTabContent()}
    </div>
  );
};

// --------- EXPORT ------------
// There should be a single export: a component called "App"
export const App: React.FC = () => {
  const filterBanner = document.getElementById("filter-banner");
  if (filterBanner) {
    filterBanner.style.display = "none";
  }

  // Must return a React Fragment
  return <ResourcesPage />;
};
