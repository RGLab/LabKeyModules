import React, { ReactChild, ReactElement } from 'react';
import { PlotData, FilterCategories, Filter, SelectedFilters, SelectedFilter} from '../../typings/CubeData';
import { StudyParticipantCount, StudyDict } from '../../typings/StudyCard';
import { List } from 'immutable'

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

export const Tabs: React.FC = ({ children }) => {
    const [activeTab, setActiveTab] = React.useState<number>(0)
    const mungeText = (text) => text.toLowerCase().replace(/\s/, "-")
    return (
        <>
            <div className="tabbable">
                <ul className="nav nav-tabs">
                    {React.Children.map(children || null, (child: ReactElement, i) => {
                        // debugger
                        return (
                            <li className={(activeTab == i ? "active": "") + " df-tab-title"}
                                onClick={() => {setActiveTab(i)}}>
                                    <a data-toggle="tab" data-value={child.key}>
                                            {child.key}
                                    </a>
                            </li>
                        )
                    })}
{/* 
                    {Object.keys(tabs).map((tabName) =>
                        <li className={
                            (tabs[tabName].tabClass ? tabs[tabName].tabClass : "") +
                            (tabName == activeTab ? " active" : "")}

                            onClick={() => { setActiveTab(tabName); }}>
                            <a href={"#tab-" + tabs[tabName].tag}
                                data-toggle="tab"
                                data-value={tabs[tabName].id}>{tabs[tabName].text}</a>
                        </li>)} */}
                </ul>
            </div>
            <div className="tab-content">
                {React.Children.map(children || null, (child: ReactElement, i) => {
                    return (
                        <div className={"tab-pane " + (i == activeTab ? " active" : "")}
                            id={"df-tab-" + mungeText(child.key)}>
                            <child.type {...child.props} key={child.key} />
                        </div>
                    )
                })}
                {/* {Object.keys(tabs).map((tabName) =>
                    <div className={"tab-pane " + (tabName == activeTab ? " active" : "")}
                        id={"tab-" + tabs[tabName].tag}>
                        {tabs[tabName].content}
                    </div>
                )} */}
            </div>
        </>
    )
}




export default Tabs