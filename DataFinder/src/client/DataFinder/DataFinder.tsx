import "./DataFinder.scss";
import React from 'react';
import { CubeData, Filter, SelectedFilters, GroupInfo, TotalCounts } from '../typings/CubeData';
import * as CubeHelpers from './helpers/CubeHelpers';
import * as ParticipantGroupHelpers from './helpers/ParticipantGroup';
import { toggleFilter, setAndOr } from './helpers/SelectedFilters';
import { DataFinderFilters } from './components/FilterSelector'
import  { Tabs } from "./components/Tabs";
import { Banner, GroupSummary, ManageGroupsDropdown } from "./components/Banner";
import { CubeMdx } from "../typings/Cube";
import { HighlightedButton, RowOfButtons } from "./components/reusable/Buttons";
import { OuterDropdownButton } from './components/reusable/Dropdowns'
import { SelectedParticipants, SelectedStudies } from "./components/TabContent";
import { Loader } from "./components/reusable/Loader";

interface DataFinderControllerProps {
    mdx:  CubeMdx,
    studyInfo: SelectRowsResponse
}


const DataFinderController = React.memo<DataFinderControllerProps>(({mdx, studyInfo}) => {
    if (!mdx || !studyInfo) return <Loader id="loader-1" />
    // Constants -------------------------------------
    const cd = new CubeData({})
    const loadedStudiesArray = CubeHelpers.createLoadedStudies(studyInfo)

    // State ---------------------------------------------
    // ----- Data (updated by API calls) -----
    const [groupSummary, setGroupSummary] = React.useState<GroupSummary>(new GroupSummary())
    // Set on page load only
    const [filterCategories, setFilterCategories] = React.useState(null)
    const [studyDict, setStudyDict] = React.useState(null); // this should only be loaded once
    // Updated on "apply": 
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)
    
    const [availableGroups, setAvailableGroups] = React.useState<GroupInfo[]>([])
    // Updated every time a filter is changed: 
    // ----- State set by user ------
    // Groups
    // Filters 
    const [selectedFilters, setSelectedFilters] = React.useState<SelectedFilters>(new SelectedFilters())
    
    // Effects  -------------------------------------

    // Setup (only run on first render) ----- 
    React.useEffect(() => {

        let groupId = LABKEY.ActionURL.getParameter("groupId")
        const loadSessionGroup = () => {
            ParticipantGroupHelpers.getSessionParticipantGroup().then((data) => {
                if (data.filters) {
                    const sf = new SelectedFilters(JSON.parse(data.filters));
                    let newGroupSummary; 
                    const description = JSON.parse(data.description)
                    if (description) {
                        newGroupSummary = description.summary
                    } else newGroupSummary = {
                        id: data.rowId,
                        label: data.label,
                        isSaved: true
                    }
                    setSelectedFilters(sf)
                    setGroupSummary(prevGroupSummary => {
                        const gs: any = prevGroupSummary.merge(newGroupSummary)
                        return gs
                    })
                    applyFilters(sf)
                } else {
                    applyFilters(selectedFilters).then(({ pids, studyParticipantCounts, totalCounts }) => {
                        ParticipantGroupHelpers.updateSessionGroup(
                            pids, selectedFilters, groupSummary, totalCounts, studyDict, studyParticipantCounts
                            )
                })
                }
            })
        }

        if (groupId === undefined) {
            updateAvailableGroups()
            loadSessionGroup()
        } else {
            groupId = parseInt(groupId)
            updateAvailableGroups().then((groups) => {
                let groupInfo: GroupInfo = null;
                groups.forEach(group => {
                    if (group.id === groupId) groupInfo = group
                })

                if (groupInfo) {
                    loadParticipantGroup(groupInfo)
                } else {
                    ParticipantGroupHelpers.getGroupInfoById(groupId).then((data) => {
                        if (data) {
                            Ext4.Msg.show({
                                title: 'Load Participant Group',
                                msg: 'You are loading filters from a participant group ' + 
                                    ' owned by a different user. Note that the selection' + 
                                    ' may be different from the original participant group' +
                                    ' if you have different permissions. You may save these' +
                                    ' filters as a new participant group to return to later.',
                                icon: Ext4.Msg.INFO,
                                buttons: Ext4.Msg.OKCANCEL,
                                buttonText:  { ok: 'Continue', cancel: 'Cancel' },
                                fn: function (buttonId) {
                                    if (buttonId === 'ok') {
                                        const sf = JSON.parse(data.filters)
                                        const filterInfo = ParticipantGroupHelpers.getParticipantGroupFilters(sf)
                                        const gs = new GroupSummary({isSaved: false})
                                        setSelectedFilters(filterInfo.sf)
                                        setGroupSummary(gs)
                                        applyFilters(filterInfo.sf).then(({ pids, studyParticipantCounts, totalCounts }) => {
                                                ParticipantGroupHelpers.updateSessionGroup(
                                                    pids, filterInfo.sf, gs, totalCounts, studyDict, studyParticipantCounts
                                                    )
                                        })
                                    } else {
                                        loadSessionGroup()
                                    }
                                }
                            })
                            
                        } else {
                            alert("Participant Group with id=" + groupId + " not found.")
                            loadSessionGroup()
                        }
                        
                    })
                }
            })
            

        }

        

        CubeHelpers.getPlotData(mdx, new SelectedFilters(), "[Subject].[Subject]", loadedStudiesArray, false)
            .then((res) => {
                const categories = CubeHelpers.createFilterCategories(res)
                setFilterCategories(categories)
        })
        CubeHelpers.getStudyCounts(mdx, new SelectedFilters()).then((res) => {
            const sd = CubeHelpers.createStudyDict([studyInfo, res])
            setStudyDict(sd)
        })
        
    }, [])

    // Pull out state
    const plotData = cubeData.plotData
    const totalCounts = cubeData.totalCounts
    const studyParticipantCounts = cubeData.studyParticipantCounts

    // Helper functions ---------------------------------------------

    // ----- Memos -----
    const ManageDropdownMemo = React.memo(ManageGroupsDropdown)
    const SelectedParticipantsMemo = React.memo(SelectedParticipants)
    const SelectedStudiesMemo = React.memo(SelectedStudies)
    // const DataFinderTabsMemo = React.memo(DataFinderTabs, (prevProps, nextProps) => true)

    // ----- Components -----

    // Callbacks -----------------------------------------------------
    const loadParticipantGroup = React.useCallback((groupInfo: GroupInfo) => {
        const filterInfo = ParticipantGroupHelpers.getParticipantGroupFilters(groupInfo.filters)
        const gs = groupSummary.with({
            label: groupInfo.label,
            id: groupInfo.id,
            isSaved: filterInfo.isSaved
        }) 
        setSelectedFilters(filterInfo.sf)
        applyFilters(filterInfo.sf).then(({pids, studyParticipantCounts, totalCounts}) => {
                ParticipantGroupHelpers.updateSessionGroup(pids, filterInfo.sf, gs, totalCounts, studyDict, studyParticipantCounts)    
        })
        setGroupSummary(gs)
    }, [])

    // ------ Filter-related -------

    const filterClick = React.useCallback((dim: string, filter: Filter) => {
        return (() => {
            const sf = toggleFilter(dim, filter.level, filter.member, selectedFilters)
            const gs = groupSummary.recordSet("isSaved", false)
            setSelectedFilters(sf)
            applyFilters(sf).then(({pids, studyParticipantCounts, totalCounts}) => {
                ParticipantGroupHelpers.updateSessionGroup(pids, sf, gs, totalCounts, studyDict, studyParticipantCounts)
            })
            setGroupSummary(gs)
        })
    }, [selectedFilters, groupSummary])

    const toggleAndOr = React.useCallback((dim: string, level: string, which: string) => {
            const sf = setAndOr(dim, level, which, selectedFilters)

            const gs = groupSummary.recordSet("isSaved", false)
            setSelectedFilters(sf)
            applyFilters(sf).then(({pids, studyParticipantCounts, totalCounts}) => {
                ParticipantGroupHelpers.updateSessionGroup(pids, sf, gs, totalCounts, studyDict, studyParticipantCounts)
            })
            setGroupSummary(gs)
    }, [selectedFilters, groupSummary])

    

    const applyFilters = (filters = selectedFilters) => {
        return(
            Promise.all([
                CubeHelpers.getPlotData(mdx, filters, "[Subject].[Subject]", loadedStudiesArray),
                CubeHelpers.getPlotData(mdx, filters, "[Study].[Name]", loadedStudiesArray), 
                CubeHelpers.getTotalCounts(mdx, filters, "[Subject].[Subject]", loadedStudiesArray),
                CubeHelpers.getTotalCounts(mdx, filters, "[Study].[Name]", loadedStudiesArray), 
                CubeHelpers.getStudyParticipantCounts(mdx, filters, loadedStudiesArray)])
                .then(([pd_subject, pd_study, tc_subject, tc_study, spc]) => {
                    const pd = CubeHelpers.createPlotData(pd_subject, pd_study)
                    const {studyParticipantCounts, pids} = CubeHelpers.createSelectedParticipants(spc)
                    const counts = new TotalCounts(CubeHelpers.createTotalCounts([tc_study, tc_subject]))
                    setCubeData(new CubeData({
                        plotData: pd,
                        studyParticipantCounts: studyParticipantCounts,
                        totalCounts: counts
                    }))
                    return({pids, studyParticipantCounts, totalCounts: counts})
                })
        )
    }

    const updateAvailableGroups = React.useCallback(() => ParticipantGroupHelpers.getAvailableGroups().then((data) => {
        const groups = ParticipantGroupHelpers.createAvailableGroups(data)
        setAvailableGroups(groups)
        return groups;
    }), [])

    const clearFilters = React.useCallback(() => {
        const newFilters = new SelectedFilters()
        const newGroupSummary = new GroupSummary()
        setSelectedFilters(newFilters);
        setGroupSummary(newGroupSummary)
        applyFilters(newFilters).then(({ pids, studyParticipantCounts, totalCounts }) => {
            ParticipantGroupHelpers.updateSessionGroup(
                pids, newFilters, newGroupSummary, totalCounts, studyDict, studyParticipantCounts,
                )
        })
    }, [])

    const clearUnsavedFilters = React.useCallback(() => {
        if (groupSummary.id > 0) {
            let groupInfo = null;
            availableGroups.forEach((group) => {
                if (group.id === groupSummary.id) {groupInfo = group}
            }) 
            if (groupInfo) {
                loadParticipantGroup(groupInfo)
            } else {
                clearFilters()
            }
        } else {
            clearFilters()
        }
    }, [groupSummary, availableGroups])

    // ------ Other ------
    
    const ManageGroupsDropdownMenu = React.useCallback(() => {
        return <ManageDropdownMemo 
            groupSummary={groupSummary} 
            setGroupSummary={setGroupSummary} 
            loadParticipantGroup={loadParticipantGroup}
            availableGroups={availableGroups}
            updateAvailableGroups={updateAvailableGroups} />
    }, [groupSummary, availableGroups])
    // -------------------------------- RETURN --------------------------------

    return (
        <>
            <Banner
                filters={selectedFilters}
                counts={totalCounts}
                groupSummary={groupSummary}
                manageGroupsDropdown={
                        ManageGroupsDropdownMenu()
                }
                id={"data-finder-app-banner"}
                 />
                

            <RowOfButtons id="data-finder-filters">
                <OuterDropdownButton title="Filters"> 
                    <div className="dropdown-menu" style={{cursor: "auto"}}>
                        {filterCategories &&
                            <DataFinderFilters
                                mdx={mdx}
                                loadedStudiesArray={loadedStudiesArray}
                                selectedFilters={selectedFilters}
                                filterCategories={filterCategories}
                                filterClick={filterClick}
                                toggleAndOr={toggleAndOr}
                                assayPlotData={plotData.get("Data")}/>}
                    </div>
                </OuterDropdownButton>
                <div>
                    <HighlightedButton label="Clear Unsaved Changes" action={clearUnsavedFilters}/>
                    <HighlightedButton label="Clear All" action={clearFilters}/>
                </div>
                
            </RowOfButtons>

            <div id="data-finder-viz">
            <Tabs>
                <SelectedParticipants filterCategories={filterCategories} plotData={plotData} key="Selected Participants"/>
                <SelectedStudies studyDict={studyDict} studyParticipantCounts={studyParticipantCounts} key="Selected Studies"/>
            </Tabs>
                {/* <DataFinderTabs
                    plotData={plotData}
                    filterCategories={filterCategories}
                    studyParticipantCounts={studyParticipantCounts}
                    studyDict={studyDict}
                    filterClick={filterClick}
                     /> */}
            </div>

            {/* Tooltip */}
            <div id="heatmap-label" />
            <div className="arrow-down" />

        </>
    )

})

export const DataFinder = React.memo(() => {
    const filterBanner = document.getElementById('filter-banner')
    filterBanner.style.display = 'none'

    const [cubeReady, setCubeReady] = React.useState(false)
    const [studyInfo, setStudyInfo] = React.useState(null)
    const dfcube = LABKEY.query.olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'DataFinder',
        name: 'DataFinderCube'
    })

    React.useEffect(() => {
        Promise.all([
            new Promise((resolve, reject) => dfcube.onReady((mdx) => resolve(true))),
            CubeHelpers.getStudyInfo()
        ]).then(([cubeReady, studyInfoRes]) => {
            setCubeReady(true)
            setStudyInfo(studyInfoRes)
        })
    }, [])

        return <DataFinderController mdx={dfcube.mdx} studyInfo={studyInfo} />
})
