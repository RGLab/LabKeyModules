/*  ----------------
       Imports
------------------ */

// Libraries
import * as React from 'react';
import * as LABKEY from '@labkey/api';
import {MenuItem, Nav, Navbar, NavDropdown, NavItem, Tab, TabPane} from 'react-bootstrap';
import 'regenerator-runtime/runtime';

// Components
import {ImmuneSpaceR} from "./ImmuneSpaceR";
import {Tools} from "./Tools";
import {Reports} from "./Reports";

// Helpers
import {transformLogData, transformCiteData, transformSdyMetaData} from "./StudyStatsTransformationFunctions"
import {fetchApiData} from "./FetchApiData"

// Stylings
import './ResourcesPage.scss';

// Typings
import {BarPlotDatum} from "./PlotComponents/mostCitedBarPlot"
import {ScatterPlotDatum, ScatterPlotDataRange} from "./PlotComponents/similarStudyScatterPlot"
import {
    TAB_REPORTS,
    TAB_MOSTACCESSED,
    TAB_MOSTCITED,
    TAB_SIMILARSTUDIES,
    TAB_TOOLS,
    TAB_IMMUNESPACER,
    tabInfo
} from "./constants";
import { MostAccessed } from './MostAccessed';
import { MostCited } from './MostCited';
import { SimilarStudies } from './SimilarStudies'


/*  ----------------
      Main
------------------ */

const ResourcesPage: React.FC = () => {

    const labkeyBaseUrl = LABKEY.ActionURL.getBaseURL()
    const apiBase = labkeyBaseUrl + '_rapi/'

    /*  ----------------
        StudyStats Data
    ------------------ */

    // RAW

    const [pmData, setPmData] = React.useState({}); 
    const [pmHasError, setPmErrors] = React.useState(false);

    const [ssData, setSsData] = React.useState({}) 
    const [ssHasError, setSsErrors] = React.useState(false)

    const [maData, setMaData] = React.useState(); 
    const [maHasError, setMaErrors] = React.useState(false);

    React.useEffect(() => {
        fetchApiData({apiBase, fileSuffix: "pubmed_data", setData: setPmData, setErrors: setPmErrors});
        fetchApiData({apiBase, fileSuffix: "sdy_metadata", setData: setSsData, setErrors: setSsErrors});
        fetchApiData({apiBase, fileSuffix: "log_data", setData: setMaData, setErrors: setMaErrors});
    }, [])
    
    // TRANSFORMED
    

    const [transformedSsData, setTransformedSsData] = React.useState(
        Array<ScatterPlotDatum>()
    )
    const [ssDataRange, setSsDataRange] = React.useState<ScatterPlotDataRange>({
        x: [], y: []
    })

    React.useEffect(() => {
        if(typeof(ssData) !== "undefined"){
            transformSdyMetaData(ssData, setTransformedSsData, setSsDataRange)
        }
    }, [ssData]);

    const [transformedMaData, setTransformedMaData] = React.useState({
        byStudy: Array<Object>(),
        byMonth: Array<Object>()
    });

    React.useEffect(() => {
        if(typeof(maData) !== "undefined"){
            transformLogData(maData, setTransformedMaData)
        }
    }, [maData]);

    const [transformedPmData, setTransformedPmData] = React.useState({
        byPubId: Array<BarPlotDatum>()
    });

    const [pmDataRange, setPmDataRange] = React.useState({
        byPubId: Array<number>()
    });

    React.useEffect(() => {
        if(typeof(pmData) !== "undefined"){
            transformCiteData(pmData, setTransformedPmData, setPmDataRange)
        }
    }, [pmData]);

    /*  ----------------
        NavBar & Content
    ------------------ */
    const getNavbar = React.useCallback(() => {
        const items = tabInfo.map((tab, index) => {

            // Dropdown
            if(tab.subMenu && tab.subMenu.length > 0) {
                const menuItems = tab.subMenu.map((sub) => {
                    return (
                        <MenuItem eventKey={sub.tag} id={sub.tag} key={sub.tag}>{sub.text}</MenuItem>
                    )
                });

                return (<NavDropdown title={tab.text} id={tab.id} key={tab.tag}>{menuItems}</NavDropdown>)
            }

            // Non-dropdown
            return (
                <NavItem eventKey={tab.tag} key={tab.tag}>{tab.text}</NavItem>
            )
        })

        return (
            <Navbar>
                <Nav style={{marginLeft:'0'}}>
                    {items}
                </Nav>
            </Navbar>
        )
    }, []);

    const getTabContent = React.useCallback(() => {
        return (
            <Tab.Content>
                <TabPane eventKey={TAB_REPORTS}>
                    <Reports/>
                </TabPane>
                <TabPane eventKey={TAB_MOSTACCESSED}>
                    <MostAccessed
                        transformedMaData={transformedMaData}
                        labkeyBaseUrl={labkeyBaseUrl}
                    />
                </TabPane>
                <TabPane eventKey={TAB_MOSTCITED} mountOnEnter={true}>
                    <MostCited
                        transformedPmData={transformedPmData}
                        pmDataRange={pmDataRange}
                    />
                </TabPane>
                <TabPane eventKey={TAB_SIMILARSTUDIES}>
                    <SimilarStudies
                        transformedSsData={transformedSsData}
                        ssDataRange={ssDataRange}
                        labkeyBaseUrl={labkeyBaseUrl}
                    />
                </TabPane>
                <TabPane eventKey={TAB_TOOLS}>
                    <Tools/>
                </TabPane>
                <TabPane eventKey={TAB_IMMUNESPACER}>
                    <ImmuneSpaceR/>
                </TabPane>
            </Tab.Content>
        )
    }, [transformedPmData, transformedSsData, transformedMaData]);

    const generateChildId = React.useCallback((eventKey: any, type: any) => {
        return eventKey;
    }, []);

    return(
        <Tab.Container defaultActiveKey={TAB_REPORTS} generateChildId={generateChildId}>
            <div>
                {getNavbar()}
                {getTabContent()}
            </div>
        </Tab.Container>
    )
}

// --------- EXPORT ------------
// There should be a single export: a component called "App"
export const App: React.FC = () => {

    const filterBanner = document.getElementById('filter-banner')
    filterBanner.style.display = 'none'

    // Must return a React Fragment
    return <ResourcesPage/>
}
