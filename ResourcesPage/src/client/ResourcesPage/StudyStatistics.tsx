import * as React from "react";
import { TOCITEMS } from "./constants";
import { createBarPlotProps, createLinePlotProps } from "./MostAccessed/utils";
import { updatePmPlotData } from "./MostCited/utils";
import { createSsPlotPropsList } from "./SimilarStudies/utils";
import {
  drawMaBarPlot,
  drawMaLinePlot,
} from "./PlotComponents/d3/mostAccessedPlots.d3";
import { drawBarPlot } from "./PlotComponents/d3/mostCitedBarPlot.d3";
import { drawScatterPlot } from "./PlotComponents/d3/similarStudyScatterPlot.d3";
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
import { ScatterPlotDataRange } from "./PlotComponents/similarStudyScatterPlot";

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
        {content.map((item) => {
          return (
            <a key={item.name} href={item.link} className="toc__link">
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
      {isOpen ? (
        <div className="plot-dropdown-menu__dropdown" ref={dropdownRef}>
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
      ) : (
        <div className="plot-dropdown-menu__dropdown"></div> // we do not give this the dropdownRef because we do not want dropdownRef to change between open & close
      )}
    </div>
  );
};
interface CreatePlotPackage {
  id: string;
  menuIds: string[];
  footerText: string[];
  plotProps: any;
  createFunc: (props: any, id?: string) => void;
  singlePlot: boolean;
}

interface StudyStatisticsPlotProps {
  //plotPackage?: CreatePlotPackage;
  id: string;
  plotProps: any;
  createFunc: (props: any, id?: string) => void;
}

const StudyStatisticsPlot: React.FC<StudyStatisticsPlotProps> = ({
  id,
  plotProps,
  createFunc,
}: StudyStatisticsPlotProps) => {
  React.useEffect(() => {
    d3.select("#" + id)
      .selectAll("*")
      .remove();
    if (plotProps.data.length > 0) {
      createFunc(plotProps, id);
    }
  }, [id, plotProps, createFunc]);

  return (
    <div id={plotProps.name}>
      <svg id={id}></svg>
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

// plotPackages are alphabetically ordered by Id
const PlotArea: React.FC<PlotAreaProps> = ({
  title,
  subtitle,
  anchorID,
  menus,
  plotPackages,
}: PlotAreaProps) => {
  const [currentPlotId, setCurrentPlotId] = React.useState<string>("");

  const plotMenuOnClickCallback = (selected: string) => {
    setCurrentPlotId(selected);
  };

  const currentPlotIndex = React.useMemo(() => {
    if (currentPlotId === "") {
      return 0;
    }

    for (let i = 0; i < plotPackages.length; i++) {
      if (plotPackages[i].id === currentPlotId) {
        return i;
      }
    }
  }, [currentPlotId, plotPackages]);

  const renderPlot = (plotPackage: CreatePlotPackage) => {
    if (plotPackage == undefined || plotPackage.plotProps == undefined) {
      // work on error message
      return <div>Error</div>;
    } else if (plotPackage.plotProps.length > 0) {
      // work on something better?
      if (plotPackage.plotProps[0].data.length === 0) {
        return <AESpinner />;
      }
      const plots: JSX.Element[] = plotPackage.plotProps.map((props: any) => {
        return (
          <StudyStatisticsPlot
            key={`${plotPackage.id}-${props.name}`}
            id={`${plotPackage.id}-${props.name}`}
            plotProps={props}
            createFunc={plotPackage.createFunc}
          />
        );
      });
      return <React.Fragment>{plots}</React.Fragment>;
    }
  };

  return (
    <div className="plot-area">
      <div className="plot-area__title">
        <h1 id={anchorID}>{title}</h1>
        <a href={`#${anchorID}`} className="anchor-link">
          <img
            src="/ResourcesPage/icons/web-hyperlink.svg"
            alt="web hyperlink"
            className="link-icon"
          />
        </a>
      </div>
      <p className="plot-area__subtitle">{subtitle}</p>
      <div className="plot-area__menu-container">
        {menus.map((menu) => {
          const currentMenus = plotPackages[currentPlotIndex].menuIds;
          if (currentMenus.includes(menu.id)) {
            return (
              <PlotMenu
                key={menu.name}
                id={menu.id}
                name={menu.name}
                options={menu.options}
                onClickCallback={plotMenuOnClickCallback}
              />
            );
          }
        })}
      </div>
      <div className="plot-area__plot-container">
        {renderPlot(plotPackages[currentPlotIndex])}
      </div>
      <div className="plot-area__footer">
        <ul>
          {plotPackages[currentPlotIndex].footerText.map((text, index) => {
            return <li key={index}>{text}</li>;
          })}
        </ul>
      </div>
    </div>
  );
};

interface StudyStatisticsProps {
  maData: any;
  mcData: any;
  ssData: any;
  pmDataRange: {
    byPubId: number[];
  };
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
        return {
          id: option.value,
          menuIds: [SELECT_PLOT_TYPE_MENU_PROPS.id, SELECT_ORDER_MENU_PROPS.id],
          footerText: MA_FOOTER_TEXT_STUDY,
          plotProps: [
            createBarPlotProps(maData.byStudy, option.id, labkeyBaseUrl),
          ],
          createFunc: drawMaBarPlot,
          singlePlot: true,
        };
      });

    const byMonthPackages: CreatePlotPackage[] = [
      {
        id: SELECT_PLOT_TYPE_MENU_PROPS.options[1].value,
        menuIds: [SELECT_PLOT_TYPE_MENU_PROPS.id],
        footerText: MA_FOOTER_TEXT_MONTH,
        plotProps: [createLinePlotProps(maData.byMonth)],
        createFunc: drawMaLinePlot,
        singlePlot: true,
      },
    ];

    return [...byStudyPackages, ...byMonthPackages];
  }, [maData, labkeyBaseUrl]);

  const McDataPackages: CreatePlotPackage[] = React.useMemo(() => {
    const byPubIdPackages: CreatePlotPackage[] =
      MC_SELECT_ORDER_MENU_PROPS.options.map((option) => {
        return {
          id: option.value,
          menuIds: [MC_SELECT_ORDER_MENU_PROPS.id],
          footerText: MC_FOOTER_TEXT,
          plotProps: [updatePmPlotData(mcData, pmDataRange, option.id)],
          createFunc: drawBarPlot,
          singlePlot: true,
        };
      });

    return [...byPubIdPackages];
  }, [mcData, pmDataRange]);

  const SsDataPackages: CreatePlotPackage[] = React.useMemo(() => {
    const ssPlotPropsList = createSsPlotPropsList(
      ssData,
      ssDataRange,
      labkeyBaseUrl
    );

    const ssDataPackages: CreatePlotPackage[] =
      SS_SELECT_PLOT_SET_MENU_PROPS.options.map((option) => {
        return {
          id: option.value,
          menuIds: [SS_SELECT_PLOT_SET_MENU_PROPS.id],
          footerText: SS_FOOTER_TEXT,
          plotProps: ssPlotPropsList[option.id],
          createFunc: drawScatterPlot,
          singlePlot: false,
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
      <section key={"ma-study"}>
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
          subtitle="Something"
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
