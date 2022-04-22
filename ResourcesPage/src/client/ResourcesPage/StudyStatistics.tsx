import * as React from "react";
import { TOCITEMS } from "./constants";
import { createBarPlotProps, createLinePlotProps } from "./MostAccessed/utils";
import { updatePmPlotData } from "./MostCited/utils";
import { createSsPlotPropsList } from "./SimilarStudies/utils";
import {
  SELECT_PLOT_TYPE_MENU_PROPS,
  SELECT_ORDER_MENU_PROPS,
  SS_SELECT_PLOT_SET_MENU_PROPS,
  MC_SELECT_ORDER_MENU_PROPS,
  MA_FOOTER_TEXT_MONTH,
  MA_FOOTER_TEXT_STUDY,
  MC_FOOTER_TEXT,
  SS_FOOTER_TEXT,
} from "./StudyStatistics/constants";

import AESpinner from "../../../../AnalyteExplorer/src/client/AnalyteExplorer/components/AESpinner";
import * as d3 from "d3";
import {
  ScatterPlotDatum,
  ScatterPlotDataRange,
} from "./PlotComponents/similarStudyScatterPlot";

import {
  TransformedMaData,
  TransformedPmData,
  PmDataRange,
} from "./StudyStatsTransformationFunctions";

// Plot creation functions
import { MaBarPlot, MaLinePlot } from "./PlotComponents/mostAccessedPlots";

import { BarPlot } from "./PlotComponents/mostCitedBarPlot";
import { ScatterPlot } from "./PlotComponents/similarStudyScatterPlot";

// Components
import {
  AnchorHeading,
  TableOfContents,
  PlotMenu,
  PlotMenuSpecs,
} from "./StudyStatistics/components";

// A PlotPackage contains all the metadata about a specific plot, used to render a PlotArea
interface PlotPackage {
  id: string;
  menuIds: string[];
  footerText: string[];
  plots: JSX.Element[];
}

interface PlotPackageGroup {
  [key: string]: PlotPackage;
}

interface PlotAreaProps {
  title: string;
  subtitle: string;
  anchorID: string;
  menus: PlotMenuSpecs[];
  defaultPackage: string;
  plotPackages: PlotPackageGroup;
}

const PlotArea: React.FC<PlotAreaProps> = ({
  title,
  subtitle,
  anchorID,
  menus,
  defaultPackage,
  plotPackages,
}: PlotAreaProps) => {
  const [currentPlotId, setCurrentPlotId] = React.useState<string>("");

  React.useEffect(() => {
    setCurrentPlotId(defaultPackage);
  }, []);

  /**
   * How menus work with plots:
   * Each menu has a list of menu options, and each menu optioon has an id that corresponds to a
   * PlotPackage of the same id. Every time a user clicks on a dropdown menu option, the PlotPackage with
   * the same id as the clicked dropdown option is found and its JSX content rendered.
   */
  // const currentPlotIndex = React.useMemo(() => {
  //   // is this technically a state?
  //   // by default display the first plot in the list
  //   if (plotPackages != undefined) {
  //     if (currentPlotId === "" && plotPackages.length > 0) {
  //       return 0;
  //     }

  //     for (let i = 0; i < plotPackages.length; i++) {
  //       if (plotPackages[i].id === currentPlotId) {
  //         return i;
  //       }
  //     }
  //   }

  //   return -1;
  // }, [currentPlotId, plotPackages]);

  /**
   * Returns the corresponding menus for the currently visible StudyStatisticsPlot
   * Returns empty array of menu specs array is empty or currentMenuIds array is empty / undefined
   *
   * @param menus - List of menu spec objects that contain metadata for individual dropdown menus
   * @param currentMenuIds - List of menu IDs that correspond to the some (or all) of the dropdown menus in 'menus'
   * @param onClickCallback - Function that triggers when the user clicks on a dropdown item
   * @returns - List of PlotMenu
   */
  const renderMenus = (
    menus: PlotMenuSpecs[],
    currentMenuIds: string[],
    onClickCallback: (x: string) => void
  ) => {
    return menus.map((menu) => {
      if (currentMenuIds.includes(menu.id)) {
        return (
          <PlotMenu
            key={menu.name}
            id={menu.id}
            name={menu.name}
            options={menu.options}
            onClickCallback={onClickCallback}
          />
        );
      }
    });
  };

  /**
   * Takes in a plotPackage and generates the specified plots. Return error
   * message if plotPackage is corrupted
   * Return error messages if plotPackage is invalid
   *
   * @param plotPackage
   * @returns JSX.Element
   */
  const renderPlots = (plotPackage: PlotPackage) => {
    if (plotPackage == undefined || plotPackage.plots == undefined) {
      return <div>Error: Unable to retrieve plot.</div>;
    }

    if (plotPackage.plots.length > 0) {
      return <React.Fragment>{plotPackage.plots}</React.Fragment>;
    }

    // if for some reason there're no plots
    return <div>Error: No valid plots detected.</div>;
  };

  /**
   * Takes in a list of text and renders a bulleted list
   *
   * @param footerText - List of text, each value corresponds to one bullet point
   * @returns - A bulleted list of text
   */
  const renderFooter = (footerText: string[]) => {
    return (
      <ul>
        {footerText.map((text, index) => {
          return <li key={index}>{text}</li>;
        })}
      </ul>
    );
  };

  // If no correct plotPackage is found, render all available menus to allow users to select
  // plot to display
  // Handles cases where plotPackages is undefined or empty
  if (Object.keys(plotPackages).length < 1) {
    const allMenuIDs = menus.map((menu) => menu.id);
    return (
      <div className="plot-area">
        <AnchorHeading text={title} anchorID={anchorID} />
        <p className="plot-area__subtitle">{subtitle}</p>
        <div className="plot-area__menu-container">
          {renderMenus(menus, allMenuIDs, setCurrentPlotId)}
        </div>
        <div className="plot-area__plot-container">
          <div>Error: Unable to generate plot. Please try again.</div>
        </div>
      </div>
    );
  }

  if (currentPlotId === "") {
    return <div></div>;
  }

  return (
    <div className="plot-area">
      <AnchorHeading text={title} anchorID={anchorID} />
      <p className="plot-area__subtitle">{subtitle}</p>
      <div className="plot-area__menu-container">
        {renderMenus(
          menus,
          plotPackages[currentPlotId].menuIds,
          setCurrentPlotId
        )}
      </div>
      <div className="plot-area__plot-container">
        {renderPlots(plotPackages[currentPlotId])}
      </div>
      <div className="plot-area__footer">
        {renderFooter(plotPackages[currentPlotId].footerText)}
      </div>
    </div>
  );
};

interface StudyStatisticsProps {
  maData: TransformedMaData;
  mcData: TransformedPmData;
  ssData: ScatterPlotDatum[];
  pmDataRange: PmDataRange;
  ssDataRange: ScatterPlotDataRange;
  labkeyBaseUrl: string;
}

const StudyStatistics: React.FC<StudyStatisticsProps> = ({
  maData,
  mcData,
  ssData,
  pmDataRange,
  ssDataRange,
  labkeyBaseUrl,
}: StudyStatisticsProps) => {
  /**
   * Data is converted into PlotPackage format. Each PlotPackage contains one set of plot(s), an id,
   * a list of menus, and a list of footer display text
   *
   * */
  const MaDataPackages: PlotPackageGroup = React.useMemo(() => {
    // Each dropdown menu option has a corresponding plot
    const result: PlotPackageGroup = {};
    SELECT_ORDER_MENU_PROPS.options.reduce(
      (result: PlotPackageGroup, option) => {
        // Turn raw data into required d3 format
        const plotProps = createBarPlotProps(
          maData.byStudy,
          option.id,
          labkeyBaseUrl
        );

        // Initialize plot components, if there's no data yet, put in loading spinner as
        // placeholder
        // plotJSX is an array as the PlotArea component can render more than 1 plot at once
        let plotJSX = [<AESpinner key={option.value} />];
        if (plotProps.data.length > 0) {
          console.log(plotProps.height);

          plotJSX = [
            <MaBarPlot
              key={option.value}
              data={plotProps.data}
              labels={plotProps.labels}
              titles={plotProps.titles}
              name={plotProps.name}
              width={plotProps.width}
              height={plotProps.height}
              linkBaseText={plotProps.linkBaseText}
            />,
          ];
        }
        result[option.value] = {
          id: option.value, // Each plot has an id corresponding to the dropdown menu option that displays it
          menuIds: [SELECT_PLOT_TYPE_MENU_PROPS.id, SELECT_ORDER_MENU_PROPS.id], // The dropdown menus available for interactions when the plot is displayed
          footerText: MA_FOOTER_TEXT_STUDY,
          plots: plotJSX,
        };
        return result;
      },
      result
    );

    const linePlotProps = createLinePlotProps(maData.byMonth);
    let plotJSX = [
      <AESpinner key={SELECT_PLOT_TYPE_MENU_PROPS.options[1].value} />,
    ];
    if (linePlotProps.data.length > 0) {
      plotJSX = [
        <MaLinePlot
          key={SELECT_PLOT_TYPE_MENU_PROPS.options[1].value}
          data={linePlotProps.data}
          labels={linePlotProps.labels}
          titles={linePlotProps.titles}
          name={linePlotProps.name}
          width={linePlotProps.width}
          height={linePlotProps.height}
          linkBaseText={linePlotProps.linkBaseText}
        />,
      ];
    }

    result[SELECT_PLOT_TYPE_MENU_PROPS.options[1].value] = {
      id: SELECT_PLOT_TYPE_MENU_PROPS.options[1].value,
      menuIds: [SELECT_PLOT_TYPE_MENU_PROPS.id],
      footerText: MA_FOOTER_TEXT_MONTH,
      plots: plotJSX,
    };

    return result;
  }, [maData, labkeyBaseUrl]);

  const McDataPackages: PlotPackageGroup = React.useMemo(() => {
    const byPubIdPackages: PlotPackageGroup = {};
    MC_SELECT_ORDER_MENU_PROPS.options.reduce((packages, option) => {
      const plotProp = updatePmPlotData(mcData, pmDataRange, option.id);
      let plotJSX = [<AESpinner key={option.value} />];
      if (plotProp.data.length > 0) {
        plotJSX = [
          <BarPlot
            key={option.value}
            data={plotProp.data}
            titles={plotProp.titles}
            name={plotProp.name}
            height={plotProp.height}
            width={plotProp.width}
            dataRange={plotProp.dataRange}
            linkBaseText={plotProp.linkBaseText}
          />,
        ];
      }
      packages[option.value] = {
        id: option.value,
        menuIds: [MC_SELECT_ORDER_MENU_PROPS.id],
        footerText: MC_FOOTER_TEXT,
        plots: plotJSX,
      };
      return packages;
    }, byPubIdPackages);

    return byPubIdPackages;
  }, [mcData, pmDataRange]);

  const SsDataPackages: PlotPackageGroup = React.useMemo(() => {
    const ssPlotPropsList = createSsPlotPropsList(
      ssData,
      ssDataRange,
      labkeyBaseUrl
    );

    const ssDataPackages: PlotPackageGroup = {};

    SS_SELECT_PLOT_SET_MENU_PROPS.options.reduce((packages, option) => {
      const plotProp = ssPlotPropsList[option.id];
      let plotJSX = [<AESpinner key={option.value} />];
      if (plotProp.length > 0 && plotProp[0].data.length > 0) {
        plotJSX = plotProp.map((prop, index) => {
          return (
            <ScatterPlot
              key={`${prop.name}${index}`}
              data={prop.data}
              name={prop.name}
              width={prop.width}
              height={prop.height}
              dataRange={prop.dataRange}
              linkBaseText={prop.linkBaseText}
              colorIndex={prop.colorIndex}
              categoricalVar={prop.categoricalVar}
              dataType={prop.dataType}
            />
          );
        });
      }

      packages[option.value] = {
        id: option.value,
        menuIds: [SS_SELECT_PLOT_SET_MENU_PROPS.id],
        footerText: SS_FOOTER_TEXT,
        plots: plotJSX,
      };

      return packages;
    }, ssDataPackages);

    return ssDataPackages;
  }, [ssData, ssDataRange, labkeyBaseUrl]);

  return (
    <main className="page-content">
      <section id="table-of-contents">
        <TableOfContents
          title="This page contains some interesting data about ImmuneSpace and its contents"
          content={TOCITEMS}
        />
      </section>
      <section id="most-accessed-plot">
        <PlotArea
          title="ImmuneSpace Usage Over Time or By Study"
          anchorID="most-accessed"
          subtitle="The plots below allow you to view ImmuneSpace usage since the launch of the platform in 2016"
          menus={[SELECT_PLOT_TYPE_MENU_PROPS, SELECT_ORDER_MENU_PROPS]}
          defaultPackage="study-UI"
          plotPackages={MaDataPackages}
        />
      </section>
      <section id="most-cited-plot">
        <PlotArea
          title="Most Cited Publications Related to Studies to ImmuneSpace"
          anchorID="most-cited"
          subtitle=""
          menus={[MC_SELECT_ORDER_MENU_PROPS]}
          defaultPackage={MC_SELECT_ORDER_MENU_PROPS.options[0].value}
          plotPackages={McDataPackages}
        />
      </section>
      <section id="similar-studies-plot">
        <PlotArea
          title="Similar Studies based on Assay Data or Study Design"
          anchorID="similar-studies"
          subtitle="The plots below show the results of a UMAP dimension reduction analysis of studies based on their meta-data, including assay data available, study design characteristics, and condition studied. Binary factor distance is measured using the Jaccard method, while continuous variables use Euclidean distance."
          menus={[SS_SELECT_PLOT_SET_MENU_PROPS]}
          defaultPackage={SS_SELECT_PLOT_SET_MENU_PROPS.options[0].value}
          plotPackages={SsDataPackages}
        />
      </section>
    </main>
  );
};

export default StudyStatistics;
