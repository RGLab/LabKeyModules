import React from "react";
import "regenerator-runtime/runtime";

// Styling imports
import "./AboutPage.scss";

import { About } from "./About";
import { DataReleases } from "./DataReleases";
import { DataStandards } from "./DataStandards";
import { SoftwareUpdates } from "./SoftwareUpdates";
import { RSessionInfo } from "./RSessionInfo";
import { ScriptLoader } from "./ScriptLoader";
import {
  MenuItem,
  Nav,
  Navbar,
  NavDropdown,
  NavItem,
  Tab,
  TabPane,
  TabContainer,
} from "react-bootstrap";
import {
  TAB_ABOUT,
  TAB_CYTOMETRY,
  TAB_DATARELEASES,
  TAB_DATASTANDARDS,
  TAB_GENEEXPRESSION,
  TAB_IMMUNERESPONSE,
  TAB_RSESSIONINFO,
  TAB_SOFTWAREUPDATES,
  tabInfo,
} from "./constants";
import { Cytometry } from "./Cytometry";
import { GeneExpression } from "./GeneExpression";
import { ImmuneResponse } from "./ImmuneResponse";

import { active } from "d3-transition";

const fetchData = (handleResults: (any) => void) => {
  let mappedData;

  LABKEY.Query.selectRows({
    schemaName: "lists",
    queryName: "Data Updates",
    columns: ["version", "date", "affected_studies", "description"],
    success: function (data) {
      mappedData = data.rows.map(function (arr, index) {
        return (
          <tr key={index} data-item={arr}>
            <td
              data-title="Version"
              style={{ textAlign: "center", border: "1px solid black" }}
            >
              {arr.version}
            </td>
            <td
              data-title="Date"
              style={{ textAlign: "center", border: "1px solid black" }}
            >
              {arr.date.slice(0, 10)}
            </td>
            <td
              data-title="Affected Studies"
              style={{ border: "1px solid black" }}
            >
              {arr.affected_studies}
            </td>
            <td data-title="Description" style={{ border: "1px solid black" }}>
              {arr.description}
            </td>
          </tr>
        );
      });
      handleResults(mappedData);
    },
  });
};

const AboutPage: React.FC = () => {
  const [divToShow, setDivToShow] = React.useState<string>("About");
  const [dataReleasesResults, setDataReleasesResults] = React.useState<string>(
    "Loading Data Releases"
  );
  const [rSessionResults, setRSessionResults] = React.useState<string>(
    "Loading R Session Info ..."
  );
  const [rSessionParsed, setRSessionParsed] =
    React.useState<DocumentFragment>();
  const [rScriptsLoaded, setRScriptsLoaded] = React.useState(false);

  /*  ----------------
       Linkable Tabs
    ------------------ */
  // finds the value of "tab" parameter in url
  const getCurrentTabParam = (): string => {
    const params = new URL(`${document.location}`).searchParams;
    const tabName = params.get("tab");
    return tabName;
  };

  const defaultAciveTab = getCurrentTabParam() ?? "About";
  const [activeTab, setActiveTab] = React.useState(
    getCurrentTabParam() ?? "About"
  );

  // The indicator is the moving bar underneath the nav bar
  const [indicatorMargin, setIndicatorMargin] = React.useState("0");
  const [indicatorWidth, setIndicatorWidth] = React.useState("68px");

  // Resizes and moves the indicator under the correct tab
  const updateIndicator = (tabName: string) => {
    // find the actual clickable tab element on the page
    const tabQuery =
      tabName === "data-processing"
        ? "div#about-page ul.nav.navbar-nav li.dropdown a"
        : `div#about-page ul.nav.navbar-nav li a#${tabName}`;

    // calculate the spacing between the left side of screen and left side of navbar
    const navBarLeftSideSpace = document
      .querySelector(".nav.navbar-nav")
      .getBoundingClientRect().left;

    setIndicatorWidth(
      `${(document.querySelector(tabQuery) as HTMLElement).offsetWidth}px`
    );

    // calculate the spacing between the left side of the screen and
    // left side of selected tab element
    const tabLeftSideSpace = document
      .querySelector(tabQuery)
      .getBoundingClientRect().left;

    setIndicatorMargin(`${tabLeftSideSpace - navBarLeftSideSpace}px`);
  };

  const nonNavTabNames = [
    TAB_ABOUT,
    TAB_DATASTANDARDS,
    TAB_DATARELEASES,
    TAB_SOFTWAREUPDATES,
    TAB_RSESSIONINFO,
  ];

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

    // Only move the indicator if clicking on a non dropdown
    if (nonNavTabNames.includes(newActiveTab)) {
      updateIndicator(newActiveTab);
    }
  };

  // handles forward/back button clicks
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  window.onpopstate = (event: PopStateEvent) => {
    const currentTab = event.state.tab;
    setActiveTab(currentTab ?? "About");

    // Only move the indicator if clicking on a non dropdown
    if (nonNavTabNames.includes(currentTab)) {
      updateIndicator(currentTab);
    } else {
      updateIndicator("data-processing");
    }
  };

  // Only declare this on the first render
  const cnfReport = React.useMemo(
    () => ({
      failure: function () {
        setRSessionResults("Unknown Error within R Session Info Report");
      },
      reportId: "module:RSessionInfo/RSessionInfo.Rmd",
      success: function (result) {
        var errors = result.errors;
        var outputParams = result.outputParams;
        if (errors && errors.length > 0) {
          setRSessionResults("Error in retrieving R Session Info");
        } else if (outputParams && outputParams.length > 0) {
          var p = outputParams[0];
          setRSessionResults(p.value);
        } else {
          setRSessionResults(
            "Strange situation: there are no reported errors, but also no output to show"
          );
        }
      },
    }),
    []
  );

  const onRScriptsLoaded = React.useCallback(() => {
    setRScriptsLoaded(true);
  }, []);

  const onRScriptLoadTimeout = React.useCallback((script: string) => {
    console.error("Failed to load R script: " + script);
  }, []);

  React.useEffect(() => {
    fetchData(setDataReleasesResults);
    LABKEY.Report.execute(cnfReport);

    // append the ?tab parameter to the url on page load
    changeTabParam(defaultAciveTab);
  }, []);

  // Want to load scripts from Rmd output once and in order they have been delivered to avoid rendering issues,
  // e.g. DataTable / jQuery conflict
  React.useEffect(() => {
    const slotHtml = document
      .createRange()
      .createContextualFragment(rSessionResults);
    let scriptNodes = slotHtml.querySelectorAll("script[src]");

    if (scriptNodes.length > 0) {
      const loader = new ScriptLoader(onRScriptsLoaded, onRScriptLoadTimeout);

      scriptNodes.forEach(function (el) {
        loader.addScript(el.getAttribute("src"));
        el.parentNode.removeChild(el);
      });

      loader.load();
      setRSessionParsed(slotHtml);
    }
  }, [rSessionResults]);

  const generateChildId = React.useCallback((eventKey: any, type: any) => {
    return eventKey;
  }, []);

  const getNavbar = React.useCallback(() => {
    const items = tabInfo.map((tab, index) => {
      // Drop down item
      if (tab.subMenu && tab.subMenu.length > 0) {
        const menuItems = tab.subMenu.map((sub) => {
          return (
            <MenuItem eventKey={sub.tag} id={sub.tag} key={sub.tag}>
              {sub.text}
            </MenuItem>
          );
        });
        return (
          <NavDropdown
            title={tab.text}
            id={tab.id}
            key={tab.tag}
            onClick={(e) => updateIndicator(`${tab.id}`)} // Moves the indicator when clicking on the dropdown button, but not when clicking on the dropdown options
          >
            {menuItems}
          </NavDropdown>
        );
      }

      // Non-dropdown

      return (
        <NavItem eventKey={tab.tag} id={tab.id} key={tab.tag}>
          {tab.text}
        </NavItem>
      );
    });

    return (
      <Navbar>
        <Nav style={{ marginLeft: "0" }}>{items}</Nav>
        <div className="nav-menu-indicator-container">
          <span
            className="nav-menu-indicator"
            style={{ marginLeft: indicatorMargin, width: indicatorWidth }}
          ></span>
        </div>
      </Navbar>
    );
  }, [indicatorMargin, indicatorWidth]);

  const getTabContent = React.useCallback(() => {
    return (
      <Tab.Content>
        <TabPane eventKey={TAB_ABOUT}>
          <About />
        </TabPane>
        <TabPane eventKey={TAB_DATASTANDARDS}>
          <DataStandards />
        </TabPane>
        <TabPane eventKey={TAB_CYTOMETRY}>
          <Cytometry />
        </TabPane>
        <TabPane eventKey={TAB_GENEEXPRESSION}>
          <GeneExpression />
        </TabPane>
        <TabPane eventKey={TAB_IMMUNERESPONSE}>
          <ImmuneResponse />
        </TabPane>
        <TabPane eventKey={TAB_DATARELEASES}>
          <DataReleases
            dataReleasesResults={dataReleasesResults}
            setDivToShow={setDivToShow}
          />
        </TabPane>
        <TabPane eventKey={TAB_SOFTWAREUPDATES}>
          <SoftwareUpdates />
        </TabPane>
        <TabPane eventKey={TAB_RSESSIONINFO} mountOnEnter={true}>
          <RSessionInfo
            rSessionParsed={rSessionParsed}
            rScriptsLoaded={rScriptsLoaded}
          />
        </TabPane>
      </Tab.Content>
    );
  }, [dataReleasesResults, setDivToShow, rSessionParsed, rScriptsLoaded]);

  return (
    <TabContainer
      activeKey={activeTab}
      generateChildId={generateChildId}
      onSelect={(tab) => changeTabParam(`${tab}`)}
    >
      <div>
        {getNavbar()}
        {getTabContent()}
      </div>
    </TabContainer>
  );
};

export const App: React.FC = () => {
  const filterBanner = document.getElementById("filter-banner");
  if (filterBanner) {
    filterBanner.style.display = "none";
  }

  // Must return a React Fragment
  return <AboutPage />;
};
