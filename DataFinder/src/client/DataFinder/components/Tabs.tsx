import React from 'react';
import { PlotData, FilterCategories, Filter, SelectedFilters, SelectedFilter} from '../../typings/CubeData';
import { StudyParticipantCount, StudyDict } from '../../typings/StudyCard';
import { List } from 'immutable'
import { StudyCard } from './StudyCard'
import * as TabContent from './TabContent'

export interface TabProps {
    tabs: {
        [index: string]: {
            content: JSX.Element;
            id: string;
            tag: string;
            text: string;
            tabClass?: string;
        }
    },
    defaultActive: string,
    tabFunction?: (tabName: string) => void;
}

interface DataFinderTabsProps {
    plotData: PlotData;
    filterCategories: FilterCategories;
    studyParticipantCounts: List<StudyParticipantCount>;
    studyDict: StudyDict;
    filterClick: (dim: string, filter: Filter) => void;
}

const Tabs: React.FC<TabProps> = ({ tabs, defaultActive, tabFunction }) => {
    const [activeTab, setActiveTab] = React.useState<string>(defaultActive)
    return (
        <>
            <div className="tabbable">
                <ul className="nav nav-tabs">
                    {Object.keys(tabs).map((tabName) =>
                        <li className={
                            (tabs[tabName].tabClass ? tabs[tabName].tabClass : "") +
                            (tabName == activeTab ? " active" : "")}

                            onClick={() => { setActiveTab(tabName); if(tabFunction) tabFunction(tabName) }}>
                            <a href={"#tab-" + tabs[tabName].tag}
                                data-toggle="tab"
                                data-value={tabs[tabName].id}>{tabs[tabName].text}</a>
                        </li>)}
                </ul>
            </div>
            <div className="tab-content">
                {Object.keys(tabs).map((tabName) =>
                    <div className={"tab-pane " + (tabName == activeTab ? " active" : "")}
                        id={"tab-" + tabs[tabName].tag}>
                        {tabs[tabName].content}
                    </div>
                )}
            </div>
        </>
    )
}

export const DataFinderTabs: React.FC<DataFinderTabsProps> = (
    {
        plotData, 
        filterCategories, 
        studyParticipantCounts, 
        studyDict, 
        filterClick
    }) => {
    const StudyCardMemo = React.memo(StudyCard)
    const DataTabMemo = React.memo(TabContent.Data)
    const ParticipantTabMemo = React.memo(TabContent.Participant)
    const StudyTabMemo = React.memo(TabContent.Study)
    const tabs = {
        //  ------ DATA -------
        data: {
            content: <TabContent.Data 
                data={plotData.Data} 
                filterCategories={filterCategories}/>,
            id: "data",
            tag: "find-data",
            text: "Available Assay Data",
            tabClass: "pull-right"
        },
        // -------- PARTICIPANT -------
        participant: {
            content: <TabContent.Participant showBarplots={filterCategories != null} data={plotData.Subject} filterCategories={filterCategories} />,
            id: "participant",
            tag: "find-participant",
            text: "Participant Characteristics",
            tabClass: "pull-right"
        },
        // ------- STUDY -------
        study: {
            content: <TabContent.Study 
                data={plotData.Study} 
                filterCategories={filterCategories} 
                studyDict={studyDict} 
                studyParticipantCounts={studyParticipantCounts} 
                StudyCard={StudyCard} 
                filterClick={filterClick} />,
            id: "study",
            tag: "find-study",
            text: "Study Design",
            tabClass: "pull-right",
        },
    }
    return(
        <Tabs tabs={tabs} defaultActive={"study"} />
    )
}




export default Tabs