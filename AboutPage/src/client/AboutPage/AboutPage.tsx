import React from 'react';
import 'regenerator-runtime/runtime';

// Styling imports
import './AboutPage.scss';

import {About} from "./About";
import {DataReleases} from "./DataReleases";
import {DataStandards} from "./DataStandards";
import {SoftwareUpdates} from "./SoftwareUpdates";
import {RSessionInfo} from "./RSessionInfo";
import {ScriptLoader} from "./ScriptLoader";
import {MenuItem, Nav, Navbar, NavDropdown, NavItem, Tab, TabPane} from "react-bootstrap";
import {
    TAB_ABOUT,
    TAB_CYTOMETRY,
    TAB_DATARELEASES,
    TAB_DATASTANDARDS,
    TAB_GENEEXPRESSION,
    TAB_IMMUNERESPONSE,
    TAB_RSESSIONINFO,
    TAB_SOFTWAREUPDATES,
    tabInfo
} from "./constants";
import {Cytometry} from "./Cytometry";
import {GeneExpression} from "./GeneExpression";
import {ImmuneResponse} from "./ImmuneResponse";

const fetchData = (handleResults:(any) => void) => {
    let mappedData;

    LABKEY.Query.selectRows({
        schemaName: "lists",
        queryName: "Data Updates",
        columns: ['version', 'date', 'affected_studies', 'description'],
        success: function(data){
            mappedData =
                data.rows.map(function(arr, index){
                    return(
                        <tr key={index} data-item={arr}>
                            <td data-title="Version" style={{textAlign: "center", border: "1px solid black"}}>{arr.version}</td>
                            <td data-title="Date" style={{textAlign: "center", border: "1px solid black"}}>{arr.date.slice(0,10)}</td>
                            <td data-title="Affected Studies" style={{border: "1px solid black"}}>{arr.affected_studies}</td>
                            <td data-title="Description" style={{border: "1px solid black"}}>{arr.description}</td>
                        </tr>
                    )
                })
            handleResults(mappedData);
        }
    })
}

const AboutPage: React.FC = () => {

    const [divToShow, setDivToShow] = React.useState<string>("About");
    const [dataReleasesResults, setDataReleasesResults] = React.useState<string>("Loading Data Releases")
    const [rSessionResults, setRSessionResults] = React.useState<string>("Loading R Session Info ...")
    const [rSessionParsed, setRSessionParsed] = React.useState<DocumentFragment>()
    const [rScriptsLoaded, setRScriptsLoaded] = React.useState(false);

    // Only declare this on the first render
    const cnfReport = React.useMemo(() => ({
        failure: function(){
            setRSessionResults("Unknown Error within R Session Info Report")
        },
        reportId: 'module:RSessionInfo/RSessionInfo.Rmd',
        success: function(result){
            var errors = result.errors;
            var outputParams = result.outputParams;
            if ( errors && errors.length > 0 ){
                setRSessionResults("Error in retrieving R Session Info")
            } else if ( outputParams && outputParams.length > 0 ){
                var p = outputParams[0];
                setRSessionResults(p.value)
            } else{
                setRSessionResults('Strange situation: there are no reported errors, but also no output to show')
            }
        }
    }), []);

    const onRScriptsLoaded = React.useCallback(() => {
        setRScriptsLoaded(true);
    }, []);

    const onRScriptLoadTimeout = React.useCallback((script: string) => {
        console.error("Failed to load R script: " + script)
    }, []);

    React.useEffect(() => {
        fetchData(setDataReleasesResults);
        LABKEY.Report.execute(cnfReport);
    }, [])

    // Want to load scripts from Rmd output once and in order they have been delivered to avoid rendering issues, 
    // e.g. DataTable / jQuery conflict
    React.useEffect(() => {
        const slotHtml = document.createRange().createContextualFragment(rSessionResults)
        let scriptNodes = slotHtml.querySelectorAll("script[src]")

        if (scriptNodes.length > 0) {
            const loader = new ScriptLoader(onRScriptsLoaded, onRScriptLoadTimeout);

            scriptNodes.forEach(function (el) {
                loader.addScript(el.getAttribute('src'));
                el.parentNode.removeChild(el)
            })

            loader.load();
            setRSessionParsed(slotHtml);
        }
    }, [rSessionResults])

    const generateChildId = React.useCallback((eventKey: any, type: any) => {
        return eventKey;
    }, []);

    const getNavbar = React.useCallback(() => {
        const items = tabInfo.map((tab, index) => {

            // Drop down item
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
                <NavItem eventKey={tab.tag} id={tab.id} key={tab.tag}>{tab.text}</NavItem>
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
                <TabPane eventKey={TAB_ABOUT}>
                    <About/>
                </TabPane>
                <TabPane eventKey={TAB_DATASTANDARDS}>
                    <DataStandards/>
                </TabPane>
                <TabPane eventKey={TAB_CYTOMETRY}>
                    <Cytometry/>
                </TabPane>
                <TabPane eventKey={TAB_GENEEXPRESSION}>
                    <GeneExpression/>
                </TabPane>
                <TabPane eventKey={TAB_IMMUNERESPONSE}>
                    <ImmuneResponse/>
                </TabPane>
                <TabPane eventKey={TAB_DATARELEASES}>
                    <DataReleases
                        dataReleasesResults={dataReleasesResults}
                        setDivToShow={setDivToShow}
                    />
                </TabPane>
                <TabPane eventKey={TAB_SOFTWAREUPDATES}>
                    <SoftwareUpdates/>
                </TabPane>
                <TabPane eventKey={TAB_RSESSIONINFO} mountOnEnter={true}>
                    <RSessionInfo
                        rSessionParsed={rSessionParsed}
                        rScriptsLoaded={rScriptsLoaded}
                    />
                </TabPane>
            </Tab.Content>
        )
    }, [dataReleasesResults, setDivToShow, rSessionParsed, rScriptsLoaded]);

    return(
        <Tab.Container defaultActiveKey={TAB_ABOUT} generateChildId={generateChildId}>
            <div>
                {getNavbar()}
                {getTabContent()}
            </div>
        </Tab.Container>
    )
}

export const App: React.FC = () => {

    const filterBanner = document.getElementById('filter-banner')
    filterBanner.style.display = 'none'

    // Must return a React Fragment
    return <AboutPage/>
}
