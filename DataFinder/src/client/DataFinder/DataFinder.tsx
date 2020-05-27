import "./DataFinder.scss";
import React from 'react';
// import {olap} from '../olap/olap'
import { CubeData, Filter, SelectedFilters, TotalCounts, GroupInfo } from '../typings/CubeData';
import * as CubeHelpers from './helpers/CubeHelpers';
import * as ParticipantGroupHelpers from './helpers/ParticipantGroup_new';
import * as TabContent from './components/TabContent';
import { toggleFilter, setAndOr } from './helpers/SelectedFilters';
import { StudyParticipantCount } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { List } from 'immutable';
import { ActionButton, LoadDropdown, SaveDropdown, ClearDropdown } from './components/ActionButton'
import { ContentDropdown, AndOrDropdown, FilterDropdownContent } from './components/FilterDropdown'
import { Flag } from './components/FilterIndicator'
import { Barplot } from './components/Barplot'
import { HeatmapSelector, HeatmapSelectorDropdown } from './components/HeatmapSelector';
import Tabs, { TabProps, DataFinderTabs } from "./components/Tabs";
import * as d3 from 'd3'
import { Banner, GroupSummary, ManageGroupsDropdown } from "./components/Banner";
import { AssayTimepointViewerContainer } from "./components/AssayTimepointViewer";
import localStorage from './helpers/localStorage'
import { CubeMdx } from "../typings/Cube";
import { ParticipantGroup } from "../typings/ParticipantGroup";
import whyDidYouRender from "@welldone-software/why-did-you-render";

interface DataFinderControllerProps {
    mdx:  CubeMdx,
    studyInfo: SelectRowsResponse
}

whyDidYouRender(React, {
    onlyLogs: true,
    titleColor: "green",
    diffNameColor: "darkturquoise"
});

const DataFinderController = React.memo<DataFinderControllerProps>(({mdx, studyInfo}) => {
    // Constants -------------------------------------
    const cd = new CubeData({})
    const loadedStudiesArray = CubeHelpers.createLoadedStudies(studyInfo)

    // State ---------------------------------------------
    // ----- Data (updated by API calls) -----
    const [groupSummary, setGroupSummaryState] = React.useState<GroupSummary>({label: "", id: 0, isSaved: true})
    const setGroupSummary = (gs) => {console.log("setting groupSummary"); setGroupSummaryState(gs)}
    // Set on page load only
    const [filterCategories, setFilterCategories] = React.useState(null)
    const [studyDict, setStudyDict] = React.useState(null); // this should only be loaded once
    // Updated on "apply": 
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)
    const [studyParticipantCounts, setStudyParticipantCounts] = React.useState<List<StudyParticipantCount>>(List())
    const [totalAppliedCounts, setTotalAppliedCountsState] = React.useState<TotalCounts>({ study: 0, participant: 0 })
    const setTotalAppliedCounts = (newCounts: TotalCounts) => {
        setTotalAppliedCountsState((prevCounts: TotalCounts) => {
            if (newCounts.participant == prevCounts.participant && newCounts.study == prevCounts.study) return(prevCounts)
            console.log("Setting total counts")
            return(newCounts)
        })
    }
    // Updated every time a filter is changed: 
    // ----- State set by user ------
    // Groups
    // Filters 
    const [selectedFilters, setSelectedFiltersState] = React.useState<SelectedFilters>(new SelectedFilters())
    const setSelectedFilters = (sf) => {console.log("setSelectedFilters"); setSelectedFiltersState(sf)}

    // Effects  -------------------------------------

    // Setup (only run on first render) ----- 
    React.useEffect(() => {

        ParticipantGroupHelpers.getSessionParticipantGroup().then((data) => {
            if (data.filters) {
                const sf = new SelectedFilters(JSON.parse(data.filters));
                const newGroupSummary = JSON.parse(data.description) || {
                    id: data.rowId,
                    label: data.label,
                    isSaved: true
                }
                setSelectedFilters(sf)
                setGroupSummary(newGroupSummary)
                applyFilters(sf)
            } else {
                applyFilters(selectedFilters)
            }
            
        })

        CubeHelpers.getCubeData(mdx, new SelectedFilters(), "[Subject].[Subject]", loadedStudiesArray, false)
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


    // Helper functions ---------------------------------------------

    // ----- Memos -----
    const BannerMemo = React.memo(Banner)
    const ManageDropdownMemo = React.memo(ManageGroupsDropdown)
    const DataFinderTabsMemo = React.memo(DataFinderTabs, (prevProps, nextProps) => true)

    // ----- Components -----
    const BarplotHelper = (dim, level, presentationDim = null) => {
        const pDim = presentationDim || dim
        return (
            <Barplot
                data={cubeData.getIn([dim, level])}
                name={level}
                height={200}
                width={250}
                categories={filterCategories[level]}
                countMetric={pDim == "Study" ? "studyCount" : "participantCount"}
                barColor={pDim == "Study" ? "#af88e3" : "#95cced"} />
        )
    }

    const FilterDropdownHelper = (dim, level, includeIndicators = false, includeAndOr = false) => {
        const levelArray = level.split(".")
        let label = levelArray[0];
        if (levelArray[0] === "ExposureMaterial") label = "Exposure Material"
        if (levelArray[0] === "ExposureProcess") label = "Exposure Process"
        if (levelArray[0] === "ResearchFocus") label = "Research Focus"
        if (levelArray[0] === "SampleType") label = "Sample Type"

        return(
            <>
                {includeAndOr &&
                    <AndOrDropdown status={selectedFilters.getIn([dim, ...levelArray, "operator"])}
                        onClick={clickAndOr(dim, level)} />
                }
                
                <ContentDropdown
                    id={levelArray[0]}
                    label={label}
                    customMenuClass="df-dropdown filter-dropdown"
                    content={
                        <FilterDropdownContent
                            dimension={dim}
                            level={level}
                            members={filterCategories[levelArray[0]]}
                            filterClick={filterClick}
                            selected={selectedFilters.getIn([dim, ...levelArray, "members"])}
                        />}>
                    {includeIndicators &&
                        selectedFilters.getIn([dim, ...levelArray]) &&
                        <div className="filter-indicator-list">
                            {selectedFilters.getIn([dim, ...levelArray, "members"]).map((member) => {
                                return (
                                    <Flag dim={dim}
                                        onDelete={filterClick(dim, { level: level, member: member })} >
                                        {member}
                                    </Flag>
                                )
                            })}
                        </div>
                    }
                </ContentDropdown>
            </>
        )
        
    }

    // Callbacks -----------------------------------------------------
    const loadParticipantGroup = React.useCallback((groupInfo: GroupInfo) => {
        const filterInfo = ParticipantGroupHelpers.getParticipantGroupFilters(groupInfo.filters)
        applyFilters(filterInfo.sf)
        setSelectedFilters(filterInfo.sf)
        const gs = {
            label: groupInfo.label,
            id: groupInfo.id,
            isSaved: filterInfo.isSaved
        }
        if (filterInfo.isSaved) {
            updateSessionGroup(filterInfo.sf, groupInfo.id, gs)
        } else {
            updateSessionGroup(filterInfo.sf, 0, gs)
        }        
        setGroupSummary(gs)

    }, [])

    // ------ Filter-related -------

    const filterClick = React.useCallback((dim: string, filter: Filter) => {
        return (() => {
            const sf = toggleFilter(dim, filter.level, filter.member, selectedFilters)
            setSelectedFilters(sf)
            applyFilters(sf)
            updateSessionGroup(sf)
            setGroupSummary((prevGroupSummary) => {
                if (!prevGroupSummary.isSaved) return(prevGroupSummary)
                return(
                    {
                        label: prevGroupSummary.label,
                        id: prevGroupSummary.id,
                        isSaved: false
                    }
                )
            })
        })
    }, [selectedFilters])

    const clickAndOr = (dim: string, level: string) => {
        return ((value: string) => {
            setSelectedFilters(setAndOr(dim, level, value, selectedFilters))
        })
    }

    const updateSessionGroup = (filters: SelectedFilters, groupId = 0, summary = groupSummary) => {
        CubeHelpers.getStudyParticipantCounts(mdx, filters, loadedStudiesArray)
            .then((spcResponse) => {
                const { countsList, pids } = CubeHelpers.createStudyParticipantCounts(spcResponse)
                setStudyParticipantCounts(countsList)
                if (groupId > 0) {
                    ParticipantGroupHelpers.setSessionParticipantGroup(groupId)
                    ParticipantGroupHelpers.updateContainerFilter(countsList, studyDict)
                } else {
                    ParticipantGroupHelpers.setSessionParticipantIds(pids, filters, summary)
                    if (studyDict) {
                        ParticipantGroupHelpers.updateContainerFilter(countsList, studyDict)
                    }
                }
                
            })
    }

    const applyFilters = (filters = selectedFilters) => {
        // set local storage
        localStorage.setItem("dataFinderSelectedFilters", JSON.stringify(filters))
        
        Promise.all([
            CubeHelpers.getCubeData(mdx, filters, "[Subject].[Subject]", loadedStudiesArray),
            CubeHelpers.getCubeData(mdx, filters, "[Study].[Name]", loadedStudiesArray)])
            .then((res) => {
                const cd = CubeHelpers.createCubeData(res)
                setCubeData(cd)
            })
        Promise.all([
            CubeHelpers.getTotalCounts(mdx, selectedFilters, "[Subject].[Subject]", loadedStudiesArray),
            CubeHelpers.getTotalCounts(mdx, selectedFilters, "[Study].[Name]", loadedStudiesArray)
        ]).then((res) => {
            const counts = CubeHelpers.createTotalCounts(res)
            setTotalAppliedCounts(counts)
        })
    }

    const clearFilters = () => {
        const newFilters = new SelectedFilters()
        setSelectedFilters(newFilters);
        applyFilters(newFilters)
        ParticipantGroupHelpers.clearSessionParticipantGroup()
        setGroupSummary({
            id: 0,
            label: "",
            isSaved: true
        })
    }

    // ------ Other ------
    
    const ManageGroupsDropdownMenu = React.useCallback(() => {
        return <ManageDropdownMemo groupSummary={groupSummary} setGroupSummary={setGroupSummary} loadParticipantGroup={loadParticipantGroup} />
    }, [groupSummary])
    // -------------------------------- RETURN --------------------------------
    console.log("render")
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
                counts={totalAppliedCounts}
                groupSummary={groupSummary}
                manageGroupsDropdown={
                        ManageGroupsDropdownMenu()
                }
                 />

            <div className="row" style={{ position: "relative" }}>
                {filterCategories && <>
                    <div className="col-sm-4">
                        {FilterDropdownHelper("Study", "Condition", true)}
                        {FilterDropdownHelper("Study", "ResearchFocus", true)}
                        {FilterDropdownHelper("Study", "ExposureMaterial", true)}
                        {FilterDropdownHelper("Study", "ExposureProcess", true)}
                        {FilterDropdownHelper("Study", "Species", true)}
                        {FilterDropdownHelper("Study", "Study", true)}
                    </div>
                    <div className="col-sm-4">
                        {FilterDropdownHelper("Subject", "Gender", true)}
                        {FilterDropdownHelper("Subject", "Age", true)}
                        {FilterDropdownHelper("Subject", "Race", true)}
                    </div>
                    <div className="col-sm-3">
                        <AndOrDropdown status={selectedFilters.getIn(["Data", "Assay", "Assay", "operator"])}
                        onClick={clickAndOr("Data", "Assay.Assay")} />
                        {FilterDropdownHelper("Data", "Assay.Assay", true, false)}
                        {FilterDropdownHelper("Data", "SampleType.SampleType", true, true)}
                        {filterCategories.SampleTypeAssay && cubeData.Data && 
                        <HeatmapSelectorDropdown 
                        data={cubeData.Data} 
                            filterClick={filterClick} 
                            selectedDataFilters={selectedFilters.Data}
                            timepointCategories={filterCategories.Timepoint}
                            sampleTypeAssayCategories={filterCategories.SampleTypeAssay}
                            clickAndOr={clickAndOr}/>
                        }
                    </div>
                    <div style={{ position: "absolute", top: "0", right: "15px" }}>
                        {/* <ActionButton text={"Apply"} onClick={() => applyFilters()} />
                        <div style={{ position: "absolute", top: "35px", right: "0", textAlign: "right", width: "8em" }}>{totalSelectedCounts.participant} participants from {totalSelectedCounts.study} studies</div> */}
                    </div>
                </>
                }

            </div>

            <div className="datafinder-wrapper">
            
                <DataFinderTabs
                    cubeData={cubeData}
                    filterCategories={filterCategories}
                    studyParticipantCounts={studyParticipantCounts}
                    studyDict={studyDict}
                    filterClick={filterClick}
                     />
            </div>

            {/* Tooltip */}
            <div id="heatmap-label" />
            <div className="arrow-down" />

        </>
    )

})

DataFinderController.whyDidYouRender = true;

export const App = React.memo(() => {
    const filterBanner = document.getElementById('filter-banner')
    filterBanner.style.display = 'none'

    const [cubeReady, setCubeReady] = React.useState(false)
    const [studyInfo, setStudyInfo] = React.useState(null)
    // debugger
    const dfcube = LABKEY.query.olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'DataFinder',
        name: 'DataFinderCube'
    })

    React.useEffect(() => {
        Promise.all([
            new Promise((resolve, reject) => dfcube.onReady((mdx) => resolve(true))),
            CubeHelpers.getStudyInfo(LABKEY)
        ]).then(([cubeReady, studyInfoRes]) => {
            setCubeReady(true)
            setStudyInfo(studyInfoRes)
        })
    }, [])

    if (cubeReady && studyInfo) {
        return <DataFinderController mdx={dfcube.mdx} studyInfo={studyInfo} />
    }
    return (<div>
        <div className="loader" id="loader-1"></div>
    </div>)
})
