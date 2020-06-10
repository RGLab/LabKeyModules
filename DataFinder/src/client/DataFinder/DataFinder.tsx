import "./DataFinder.scss";
import React from 'react';
// import {olap} from '../olap/olap'
import { CubeData, Filter, SelectedFilters, GroupInfo, TotalCounts } from '../typings/CubeData';
import * as CubeHelpers from './helpers/CubeHelpers';
import * as ParticipantGroupHelpers from './helpers/ParticipantGroup_new';
import { toggleFilter, setAndOr } from './helpers/SelectedFilters';
import { DataFinderFilters, RowOfButtons } from './components/FilterDropdown'
import  { Tabs } from "./components/Tabs";
import { Banner, GroupSummary, ManageGroupsDropdown } from "./components/Banner";
import { CubeMdx } from "../typings/Cube";
import { HighlightedButton, OuterDropdownButton } from "./components/ActionButton";
import { SelectedParticipants, SelectedStudies } from "./components/TabContent";
import { Loader } from "./components/Loader";

interface DataFinderControllerProps {
    mdx:  CubeMdx,
    studyInfo: SelectRowsResponse
}


const BannerMemo = React.memo(Banner)

const DataFinderController = React.memo<DataFinderControllerProps>(({mdx, studyInfo}) => {
    // Constants -------------------------------------
    const cd = new CubeData({})
    const loadedStudiesArray = CubeHelpers.createLoadedStudies(studyInfo)

    // State ---------------------------------------------
    // ----- Data (updated by API calls) -----
    const [groupSummary, setGroupSummaryState] = React.useState<GroupSummary>(new GroupSummary())
    const setGroupSummary = (gs) => {console.log("setting groupSummary state"); console.log(gs); setGroupSummaryState(gs)}
    // Set on page load only
    const [filterCategories, setFilterCategoriesState] = React.useState(null)
    const setFilterCategories = (fc) => {console.log("setting filter categories state"); setFilterCategoriesState(fc)}
    const [studyDict, setStudyDictState] = React.useState(null); // this should only be loaded once
    const setStudyDict = (sd) => {console.log("setting studyDict state"); setStudyDictState(sd)}
    // Updated on "apply": 
    const [cubeData, setCubeDataState] = React.useState<CubeData>(cd)
    const setCubeData = (cd) => {console.log("setting cubeData state"); setCubeDataState(cd)}
    
    const [availableGroups, setAvailableGroups] = React.useState<GroupInfo[]>([])
    // Updated every time a filter is changed: 
    // ----- State set by user ------
    // Groups
    // Filters 
    const [selectedFilters, setSelectedFiltersState] = React.useState<SelectedFilters>(new SelectedFilters())
    const setSelectedFilters = (sf) => {console.log("setting SelectedFilters state"); setSelectedFiltersState(sf)}

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
                    setGroupSummary(prevGroupSummary => prevGroupSummary.merge(newGroupSummary))
                    applyFilters(sf)
                } else {
                    applyFilters(selectedFilters)
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
                                    ' may be different from the original participnat group' +
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
                                        applyFilters(filterInfo.sf).then(({ pids, countsList, totalCounts }) => {
                                                ParticipantGroupHelpers.updateSessionGroup(
                                                    pids, countsList, filterInfo.sf, gs, totalCounts, studyDict
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
            console.log(" ------- setStudyDict ------- ")
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
        applyFilters(filterInfo.sf).then(({pids, countsList, totalCounts}) => {
            if (filterInfo.isSaved) {
                ParticipantGroupHelpers.updateSessionGroupById(countsList, groupInfo.id, studyDict)
            } else {
                ParticipantGroupHelpers.updateSessionGroup(pids, countsList, filterInfo.sf, gs, totalCounts, studyDict)
            }        
        })
        setGroupSummary(gs)
    }, [])

    // ------ Filter-related -------

    const filterClick = React.useCallback((dim: string, filter: Filter) => {
        return (() => {
            const sf = toggleFilter(dim, filter.level, filter.member, selectedFilters)
            const gs = groupSummary.recordSet("isSaved", false)
            setSelectedFilters(sf)
            applyFilters(sf).then(({pids, countsList, totalCounts}) => {
                ParticipantGroupHelpers.updateSessionGroup(pids, countsList, sf, gs, totalCounts, studyDict)
            })
            setGroupSummary(gs)
        })
    }, [selectedFilters, groupSummary])

    const toggleAndOr = React.useCallback((dim: string, level: string, which: string) => {
            const sf = setAndOr(dim, level, which, selectedFilters)

            const gs = groupSummary.recordSet("isSaved", false)
            setSelectedFilters(sf)
            applyFilters(sf).then(({pids, countsList, totalCounts}) => {
                ParticipantGroupHelpers.updateSessionGroup(pids, countsList, sf, gs, totalCounts, studyDict)
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
                .then(([pd1, pd2, tc1, tc2, spc]) => {
                    const pd = CubeHelpers.createPlotData([pd1, pd2])
                    const {countsList, pids} = CubeHelpers.createStudyParticipantCounts(spc)
                    const counts = new TotalCounts(CubeHelpers.createTotalCounts([tc1, tc2]))
                    setCubeData(new CubeData({
                        plotData: pd,
                        studyParticipantCounts: countsList,
                        totalCounts: counts
                    }))
                    return({pids, countsList, totalCounts: counts})
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
        setSelectedFilters(newFilters);
        applyFilters(newFilters)
        setGroupSummary(new GroupSummary())
        ParticipantGroupHelpers.clearSessionParticipantGroup()
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
            {/* <div className="df-dropdown-options">
                <LoadDropdown groups={availableGroups} loadParticipantGroup={loadParticipantGroup} />
                <ClearDropdown clearAll={clearFilters} reset={() => { loadedGroup ? loadParticipantGroup(loadedGroup) : clearFilters() }} />
                <SaveDropdown
                    saveAs={() => saveButtonClick()}
                    save={() => updateParticipantGroup(loadedGroup)}
                    disableSave={!loadedGroup} />
            </div> */}
            <BannerMemo
                filters={selectedFilters}
                counts={totalCounts}
                groupSummary={groupSummary}
                manageGroupsDropdown={
                        ManageGroupsDropdownMenu()
                }
                 />
                
            

            <RowOfButtons>
                <OuterDropdownButton title="Add Filter"> 
                    <div className="dropdown-menu" style={{cursor: "auto"}}>
                        {filterCategories &&
                            <DataFinderFilters
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

            <div className="datafinder-wrapper">
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

export const App = React.memo(() => {
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

    if (cubeReady && studyInfo) {
        return <DataFinderController mdx={dfcube.mdx} studyInfo={studyInfo} />
    }
    return (<Loader/>)
})
