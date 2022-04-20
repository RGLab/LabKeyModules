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

interface TOCItem {
  name: string;
  link: string;
}

interface TOCProps {
  title: string;
  content: TOCItem[];
}
const TableOfContents: React.FC<TOCProps> = ({ title, content }: TOCProps) => {
  return (
    <div className="toc">
      <span className="toc__title">{title}</span>
      <div className="toc__content">
        {content.map((item, i) => {
          return (
            <a key={`${item.name}-${i}`} href={item.link} className="toc__link">
              {item.name}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export interface PlotMenuSpecs {
  id: string;
  name: string;
  options: { id: string; value: string; label: string }[];
}

interface PlotMenuComponentProps extends PlotMenuSpecs {
  onClickCallback: (item: string) => void;
}

const PlotMenu: React.FC<PlotMenuComponentProps> = ({
  name,
  options,
  onClickCallback,
}: PlotMenuComponentProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const dropdownRef = React.useRef(null);
  const dropdownButtonRef = React.useRef(null);

  // this works, write documentation on this later - Alex
  React.useEffect(() => {
    // the dropdown menu closes when you click outside the dropdown menu OR on the dropdown menu itself
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        dropdownButtonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, dropdownButtonRef]);

  // WIP
  return (
    <div className="plot-dropdown-menu">
      <div
        className="plot-dropdown-menu__button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        ref={dropdownButtonRef}>
        <span className="dropdown-name">{name}</span>
        <img
          className="dropdown-icon"
          src="/ResourcesPage/icons/arrow_drop_down.svg"
          alt="dropdown"
        />
      </div>

      <div
        className="plot-dropdown-menu__dropdown"
        ref={dropdownRef}
        hidden={!isOpen}>
        <ul>
          {options.map((option) => {
            return (
              <li
                key={option.value}
                onClick={() => {
                  setIsOpen(!isOpen);
                  onClickCallback(option.value);
                }}>
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

interface CreatePlotPackage {
  id: string;
  menuIds: string[];
  footerText: string[];
  plots: JSX.Element[];
}

// Refactor to new file
interface AnchorHeadingProps {
  text: string;
  anchorID: string;
}
const AnchorHeading: React.FC<AnchorHeadingProps> = ({
  text,
  anchorID,
}: AnchorHeadingProps) => {
  return (
    <div className="plot-area__title">
      <h1 id={anchorID}>{text}</h1>
      <a href={`#${anchorID}`} className="anchor-link">
        <img
          src="/ResourcesPage/icons/web-hyperlink.svg"
          alt={text}
          className="link-icon"
        />
      </a>
    </div>
  );
};

interface PlotAreaProps {
  title: string;
  subtitle: string;
  anchorID: string;
  menus: PlotMenuSpecs[];
  plotPackages: CreatePlotPackage[];
}

// plotPackages are alphabetically ordered by Id (does it have to be? i don't think it has to)
const PlotArea: React.FC<PlotAreaProps> = ({
  title,
  subtitle,
  anchorID,
  menus,
  plotPackages,
}: PlotAreaProps) => {
  const [currentPlotId, setCurrentPlotId] = React.useState<string>("");

  const currentPlotIndex = React.useMemo(() => {
    // by default display the first plot in the list
    if (plotPackages != undefined) {
      if (currentPlotId === "" && plotPackages.length > 0) {
        return 0;
      }

      for (let i = 0; i < plotPackages.length; i++) {
        if (plotPackages[i].id === currentPlotId) {
          return i;
        }
      }
    }

    return -1;
  }, [currentPlotId, plotPackages]);

  /**
   * Returns the corresponding menus for the currently visible StudyStatisticsPlot
   * Returns empty array of menu specs array is empty or currentMenuIds array is empty / undefined
   *
   * @param menus - List of menu spec objects that contain metadata for individual dropdown menus
   * @param currentMenuIds - List of menu IDs that correspond to the some (or all) of the dropdown menus in 'menus'
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
   * message if plotPackage is corrupted. Return loading widget if data is empty.
   * Return error messages if plotPackage is invalid
   *
   * @param plotPackage
   * @returns JSX.Element
   */
  const renderPlots = (plotPackage: CreatePlotPackage) => {
    if (plotPackage == undefined || plotPackage.plots == undefined) {
      return <div>Error: Unable to retrieve plot.</div>;
    }

    if (plotPackage.plots.length > 0) {
      const plots: JSX.Element[] = plotPackage.plots.map((plot) => plot);
      return <React.Fragment>{plots}</React.Fragment>;
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
  console.log("render");

  // If no correct plotPackage is found, render all available menus to allow users to select
  // plot to display
  // Handles cases where plotPackages is undefined or empty
  if (currentPlotIndex < 0) {
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

  return (
    <div className="plot-area">
      <AnchorHeading text={title} anchorID={anchorID} />
      <p className="plot-area__subtitle">{subtitle}</p>
      <div className="plot-area__menu-container">
        {renderMenus(
          menus,
          plotPackages[currentPlotIndex].menuIds,
          setCurrentPlotId
        )}
      </div>
      <div className="plot-area__plot-container">
        {renderPlots(plotPackages[currentPlotIndex])}
      </div>
      <div className="plot-area__footer">
        {renderFooter(plotPackages[currentPlotIndex].footerText)}
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
  const MaDataPackages: CreatePlotPackage[] = React.useMemo(() => {
    const byStudyPackages: CreatePlotPackage[] =
      SELECT_ORDER_MENU_PROPS.options.map((option) => {
        const plotProps = createBarPlotProps(
          maData.byStudy,
          option.id,
          labkeyBaseUrl
        );

        let plotJSX = [<AESpinner key={option.value} />];
        if (plotProps.data.length > 0) {
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
        return {
          id: option.value,
          menuIds: [SELECT_PLOT_TYPE_MENU_PROPS.id, SELECT_ORDER_MENU_PROPS.id],
          footerText: MA_FOOTER_TEXT_STUDY,
          plots: plotJSX,
        };
      });

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

    const byMonthPackages: CreatePlotPackage[] = [
      {
        id: SELECT_PLOT_TYPE_MENU_PROPS.options[1].value,
        menuIds: [SELECT_PLOT_TYPE_MENU_PROPS.id],
        footerText: MA_FOOTER_TEXT_MONTH,
        plots: plotJSX,
      },
    ];
    return [...byStudyPackages, ...byMonthPackages];
  }, [maData, labkeyBaseUrl]);

  const McDataPackages: CreatePlotPackage[] = React.useMemo(() => {
    const byPubIdPackages: CreatePlotPackage[] =
      MC_SELECT_ORDER_MENU_PROPS.options.map((option) => {
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
        return {
          id: option.value,
          menuIds: [MC_SELECT_ORDER_MENU_PROPS.id],
          footerText: MC_FOOTER_TEXT,
          plots: plotJSX,
        };
      });
    return byPubIdPackages;
  }, [mcData, pmDataRange]);

  const SsDataPackages: CreatePlotPackage[] = React.useMemo(() => {
    const ssPlotPropsList = createSsPlotPropsList(
      ssData,
      ssDataRange,
      labkeyBaseUrl
    );

    const ssDataPackages: CreatePlotPackage[] =
      SS_SELECT_PLOT_SET_MENU_PROPS.options.map((option) => {
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

        return {
          id: option.value,
          menuIds: [SS_SELECT_PLOT_SET_MENU_PROPS.id],
          footerText: SS_FOOTER_TEXT,
          plots: plotJSX,
        };
      });

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
          plotPackages={MaDataPackages}
        />
      </section>
      <section id="most-cited-plot">
        <PlotArea
          title="Most Cited Publications Related to Studies to ImmuneSpace"
          anchorID="most-cited"
          subtitle=""
          menus={[MC_SELECT_ORDER_MENU_PROPS]}
          plotPackages={McDataPackages}
        />
      </section>
      <section id="similar-studies-plot">
        <PlotArea
          title="Similar Studies based on Assay Data or Study Design"
          anchorID="similar-studies"
          subtitle="The plots below show the results of a UMAP dimension reduction analysis of studies based on their meta-data, including assay data available, study design characteristics, and condition studied. Binary factor distance is measured using the Jaccard method, while continuous variables use Euclidean distance."
          menus={[SS_SELECT_PLOT_SET_MENU_PROPS]}
          plotPackages={SsDataPackages}
        />
      </section>
    </main>
  );
};

export default StudyStatistics;
