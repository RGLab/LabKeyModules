import React from 'react';
import { active } from 'd3';

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

export default Tabs