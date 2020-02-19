import "./DataFinder.scss";
import React, { memo } from 'react';
// import {olap} from '../olap/olap'
import { CubeData, Filter, SelectedFilters, TotalCounts, GroupInfo, BannerInfo } from '../typings/CubeData';
import * as CubeHelpers from './helpers/CubeHelpers';
import * as ParticipantGroupHelpers from './helpers/ParticipantGroup';
import { toggleFilter, setAndOr } from './helpers/SelectedFilters';
import { StudyParticipantCount } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { List } from 'immutable';
import { ActionButton, LoadDropdown, SaveDropdown, ClearDropdown } from './components/ActionButton'
import { FilterDropdown, ContentDropdown, AndOrDropdown } from './components/FilterDropdown'
import { Flag } from './components/FilterIndicator'
import { Barplot } from './components/Barplot'
import { HeatmapSelector, SampleTypeCheckbox } from './components/HeatmapSelector';
import Tabs from "./components/Tabs";
import * as d3 from 'd3'
import { Banner } from "./components/Banner";
import { AssayTimepointViewerContainer } from "./components/AssayTimepointViewer";

interface DataFinderControllerProps {
    mdx: any
}

const DataFinderController: React.FC<DataFinderControllerProps> = (props: DataFinderControllerProps) => {
    // Constants -------------------------------------
    const mdx = props.mdx;
    const cd = new CubeData({})
    const sf = new SelectedFilters(JSON.parse(localStorage.getItem("dataFinderSelectedFilters")));
    const studySubject = {
        nounSingular: 'Participant',
        nounPlural: 'Participants',
        tableName: 'Participant',
        columnName: 'ParticipantId'
    }

    // State ---------------------------------------------
    // ----- Data (updated by API calls) -----
    // Set on page load only
    const [filterCategories, setFilterCategories] = React.useState(null)
    const [studyDict, setStudyDict] = React.useState(null); // this should only be loaded once
    // Updated when a group is saved: 
    const [availableGroups, setAvailableGroups] = React.useState<GroupInfo[]>([])
    // Updated on "apply": 
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)
    const [studyParticipantCounts, setStudyParticipantCounts] = React.useState<List<StudyParticipantCount>>(List())
    const [totalAppliedCounts, setTotalAppliedCounts] = React.useState<TotalCounts>({ study: 0, participant: 0 })
    const [filteredPids, setFilteredPids] = React.useState<string[]>(null)
    // Updated every time a filter is changed: 
    const [totalSelectedCounts, setTotalSelectedCounts] = React.useState<TotalCounts>({ study: 0, participant: 0 })

    // ----- State set by user ------
    // Groups
    const [loadedGroup, setLoadedGroup] = React.useState<GroupInfo>()
    const [unsavedFilters, setUnsavedFilters] = React.useState<boolean>(false)
    // Filters 
    const [appliedFilters, setAppliedFilters] = React.useState<SelectedFilters>(sf)
    const [selectedFilters, setSelectedFiltersState] = React.useState<SelectedFilters>(appliedFilters)
    const setSelectedFilters = (filters: SelectedFilters) => {
        setSelectedFiltersState(filters)
        Promise.all([
            CubeHelpers.getTotalCounts(mdx, filters, "[Subject].[Subject]"),
            CubeHelpers.getTotalCounts(mdx, filters, "[Study].[Name]")
        ]).then((res) => {
            const counts = CubeHelpers.createTotalCounts(res)
            setTotalSelectedCounts(counts)
        })
    }
    // Other view settings set by user
    const [showSampleType, setShowSampleType] = React.useState<boolean>(false)

    // ----- Other -----
    // Webparts
    const [participantDataWebpart, setParticipantDataWebpart] = React.useState()
    const [dataViewsWebpart, setDataViewsWebpart] = React.useState()
    // Banner
    const [bannerInfo, setBannerInfoState] = React.useState<BannerInfo>(new BannerInfo(JSON.parse(localStorage.getItem("dataFinderBannerInfo"))))
    const setBannerInfo = (bi: BannerInfo) => {
        // wrapper which sets state and local storage
        setBannerInfoState(bi)
        localStorage.setItem("dataFinderBannerInfo", JSON.stringify(bi))
    }
    if (bannerInfo == null) {
        setBannerInfo(new BannerInfo({ counts: totalSelectedCounts }))
    }


    // Effects  -------------------------------------

    // Setup (only run on first render) ----- 
    React.useEffect(() => {
        // load data
        CubeHelpers.getFilterCategories().then((categoriesResponse) => {
            const categories = CubeHelpers.createFilterCategories(categoriesResponse)
            setFilterCategories(categories)
        })
        Promise.all([CubeHelpers.getStudyInfo(), CubeHelpers.getStudyCounts(mdx, new SelectedFilters())]).then((res) => {
            const sd = CubeHelpers.createStudyDict(res)
            setStudyDict(sd)
        })
        ParticipantGroupHelpers.getAvailableGroups().then((data) => {
            const groups = ParticipantGroupHelpers.createAvailableGroups(data)
            groups.sort((a, b) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1)
            setAvailableGroups(groups)
            groups.forEach((group) => {
                if (group.label == bannerInfo.groupName) {
                    setLoadedGroup(group)
                }
            })
        })

        const pd_wp = new LABKEY.QueryWebPart({
            renderTo: "participant-data",
            autoScroll: true,
            schemaName: 'study',
            queryName: "demographics",
            frame: 'none',
            border: false,
            showRecordSelectors: false,
            showUpdateColumn: false,
            buttonBar: {
                position: 'top',
                includeStandardButtons: true
            },
            success: function (wpDataRegion) {
                // issue 26329: don't use header locking for a QWP in an Ext dialog window
                wpDataRegion.disableHeaderLock();
            },
            scope: this
        })
        setParticipantDataWebpart(pd_wp)

        const dv_wp = new LABKEY.WebPart({
            partName: "Data Views",
            renderTo: "data-views",
            frame: "none"
        })
        setDataViewsWebpart(dv_wp)
        applyFilters(selectedFilters, bannerInfo.unsavedFilters)

    }, [])


    // Helper functions ---------------------------------------------

    const renderWepart = (tabName: string) => {
        console.log("renderWebpart(" + tabName + ")")
        if (tabName == "participant") { participantDataWebpart.render(); return }
        if (tabName == "data") { dataViewsWebpart.render(); return }
        return
    }

    // ----- Memos -----
    const BannerMemo = memo(Banner)
    const FilterDropdownMemo = memo(FilterDropdown)
    const StudyCardMemo = memo(StudyCard)

    // ----- Components -----
    const BarplotHelper = (dim, level, presentationDim = null) => {
        const pDim = presentationDim || dim
        return (
            <Barplot
                data={cubeData.getIn([dim, level]).toJS()}
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
        
        return (
            <>
            <FilterDropdownMemo
                key={level}
                dimension={dim}
                level={level}
                members={filterCategories[levelArray[0]]}
                filterClick={filterClick}
                selected={selectedFilters.getIn([dim, ...levelArray, "members"])}
            >
            
                {includeAndOr && 
                 <AndOrDropdown status={selectedFilters.getIn([dim, ...levelArray, "operator"])} 
                                onClick={clickAndOr(dim, level)} />}
                {includeIndicators && 
                 selectedFilters.getIn([dim, ...levelArray]) && 
                 selectedFilters.getIn([dim, ...levelArray, "members"]).map((member) => {
                    return (
                        <div style={{ width: "10em" }}>
                            <Flag dim={dim} 
                                  onDelete={filterClick(dim, { level: level, member: member })} >
                                {member}
                            </Flag>
                        </div>
                    )
                })}
            </FilterDropdownMemo>
            </>
        )
    }

    // Callbacks -----------------------------------------------------
    // ------ Filter-related -------

    const filterClick = (dim: string, filter: Filter) => {
        return (() => {
            const sf = toggleFilter(dim, filter.level, filter.member, selectedFilters)
            setSelectedFilters(sf)
        })
    }

    const clickAndOr = (dim: string, level: string) => {
        return ((value: string) => {
            setSelectedFilters(setAndOr(dim, level, value, selectedFilters))
        })
    }

    const applyFilters = (filters = selectedFilters, customUnsavedFilters = true, groupName = null) => {
        console.log("----- apply filters -----")
        // set applied filters
        setAppliedFilters(filters)
        // set local storage
        localStorage.setItem("dataFinderSelectedFilters", JSON.stringify(filters))
        CubeHelpers.getStudyParticipantCounts(mdx, filters)
            .then((spcResponse) => {
                const { countsList, pids } = CubeHelpers.createStudyParticipantCounts(spcResponse)
                setStudyParticipantCounts(countsList)
                setFilteredPids(pids)
                ParticipantGroupHelpers.saveParticipantIdGroupInSession(pids).then(() => {
                    if (participantDataWebpart) participantDataWebpart.render()
                })
                if (studyDict) {
                    ParticipantGroupHelpers.updateContainerFilter(countsList, studyDict)
                }
            })
        Promise.all([
            CubeHelpers.getCubeData(mdx, filters, "[Subject].[Subject]"),
            CubeHelpers.getCubeData(mdx, filters, "[Study].[Name]")])
            .then((res) => {
                const cd = CubeHelpers.createCubeData(res)
                setCubeData(cd)
            })

        let unsavedFiltersValue = customUnsavedFilters
        if (customUnsavedFilters == null) {
            unsavedFiltersValue = loadedGroup && !unsavedFilters
        }
        setUnsavedFilters(unsavedFiltersValue)
        Promise.all([
            CubeHelpers.getTotalCounts(mdx, selectedFilters, "[Subject].[Subject]"),
            CubeHelpers.getTotalCounts(mdx, selectedFilters, "[Study].[Name]")
        ]).then((res) => {
            const counts = CubeHelpers.createTotalCounts(res)
            setTotalAppliedCounts(counts)
            setTotalSelectedCounts(counts)
            setBannerInfo(bannerInfo.with({ unsavedFilters: unsavedFiltersValue, counts: counts, groupName: groupName || bannerInfo.groupName }))
        })
    }

    const clearFilters = () => {
        d3.select("#barplot-Age")
        // debugger;
        setSelectedFilters(new SelectedFilters());
        setLoadedGroup(null)
        applyFilters(new SelectedFilters(), false, "Unsaved Participant Group")
    }

    // ----- participant group-related callbacks -----
    const saveButtonClick = (groupLabel = "", gotoSendAfterSave = false) => {
        const saveWindow = ParticipantGroupHelpers.openSaveWindow(studySubject, filteredPids, appliedFilters, groupLabel, gotoSendAfterSave)
        saveWindow.on("aftersave", (saveData) => {
            if (gotoSendAfterSave) ParticipantGroupHelpers.goToSend(saveData.group.rowId)
            setBannerInfo(bannerInfo.with({
                groupName: saveData.group.label,
                counts: totalAppliedCounts,
                unsavedFilters: false
            }))
            ParticipantGroupHelpers.getAvailableGroups().then((data) => {
                const groups = ParticipantGroupHelpers.createAvailableGroups(data)
                setAvailableGroups(groups)
                groups.forEach((group) => {
                    if (group.label == saveData.group.label) {
                        setLoadedGroup(group)
                    }
                })
            })
        })

    }

    const updateParticipantGroup = (groupInfo: GroupInfo, goToSendAfterSave = false) => {
        ParticipantGroupHelpers.updateParticipantGroup(filteredPids, appliedFilters, loadedGroup)
            .then((success) => {
                ParticipantGroupHelpers.getAvailableGroups().then((data) => {
                    const groups = ParticipantGroupHelpers.createAvailableGroups(data)
                    setAvailableGroups(groups)
                })
                if (goToSendAfterSave) {
                    ParticipantGroupHelpers.goToSend(groupInfo.id)
                }
            })
        setUnsavedFilters(false)
        setBannerInfo(bannerInfo.with({ unsavedFilters: false }))
    }

    const loadParticipantGroup = (groupInfo: GroupInfo) => {
        const pgFilters = ParticipantGroupHelpers.getParticipantGroupFilters(groupInfo)
        localStorage.setItem("dataFinderSelectedFilters", JSON.stringify(pgFilters))
        setSelectedFilters(pgFilters)
        setLoadedGroup(groupInfo)
        applyFilters(pgFilters, false, groupInfo.label)
    }

    const sendParticipantGroup = () => {
        const allowSave = loadedGroup != null
        if (unsavedFilters || loadedGroup == null) {
            Ext4.Msg.show({
                title: 'Save Group Before Sending',
                msg: 'You must save a group before you can send a copy.',
                icon: Ext4.Msg.INFO,
                buttons: allowSave ? Ext4.Msg.YESNOCANCEL : Ext4.Msg.OKCANCEL,
                buttonText: allowSave ? { yes: 'Save', no: 'Save As' } : { ok: 'Save' },
                fn: function (buttonId) {
                    if (buttonId === 'yes')
                        updateParticipantGroup(loadedGroup, true)
                    else if (buttonId === 'no' || buttonId === 'ok')
                        saveButtonClick("", true);
                }
            });
        } else {
            ParticipantGroupHelpers.goToSend(loadedGroup.id)
        }
    }


    // ------ Other ------
    const toggleSampleType = () => {
        setShowSampleType(!showSampleType)
    }

    // Tab Content ------------------------------------------------
    // TODO:  Abstract some of this into additional components
    const tabs = {
        //  ------ DATA -------
        data: {
            content: <>
                <div className="row">
                    <div>

                        {filterCategories &&
                            <>
                                <div className="row">
                                    <div className="col-sm-8">
                                        <h4 style={{ textAlign: "center" }}>Assays Available by Study Day</h4>
                                        <AssayTimepointViewerContainer
                                            name={"heatmap1"}
                                            data={cubeData.Data.toJS()}
                                            showSampleType={showSampleType}
                                            selected={selectedFilters.Data}
                                            timepointCategories={filterCategories.Timepoint}
                                            sampleTypeAssayCategories={filterCategories.SampleTypeAssay} />
                                    </div>
                                    <div className="col-sm-4">
                                        <Barplot
                                            data={cubeData.getIn(["Data", "SampleType", "SampleType"]).toJS()}
                                            name={"SampleType"}
                                            height={200}
                                            width={250}
                                            categories={filterCategories["SampleType"]}
                                            countMetric={"participantCount"}
                                            barColor={"#74C476"} />
                                    </div>
                                </div>
                            </>}


                    </div>
                </div>
                <hr />
                <div>
                    <h2>Data From Selected Participants</h2>
                </div>
                <div id="data-views" />
            </>,
            id: "data",
            tag: "find-data",
            text: "Available Assay Data",
            tabClass: "pull-right"
        },
        // -------- PARTICIPANT -------
        participant: {
            content: <>
                <div className="row">
                    {filterCategories && <>
                        <div className="col-sm-4">
                            {BarplotHelper("Subject", "Gender")}
                        </div>
                        <div className="col-sm-4">
                            {BarplotHelper("Subject", "Age")}
                        </div>
                        <div className="col-sm-4">
                            {BarplotHelper("Subject", "Race")}
                        </div>
                    </>}


                </div>
                <hr></hr>
                <h2 style={{ padding: "15px" }}>Selected Participants</h2>
                <div className="row">
                    <div id="participant-data" className="df-embedded-webpart"></div>
                </div>

            </>,
            id: "participant",
            tag: "find-participant",
            text: "Participant Characteristics",
            tabClass: "pull-right"
        },
        // ------- STUDY -------
        study: {
            content: <>
                <div className="row">
                    {filterCategories && <>
                        <div className="col-sm-3">
                            {BarplotHelper("Study", "Condition", "Study")}
                        </div>
                        <div className="col-sm-3">
                            {BarplotHelper("Study", "ExposureProcess", "Study")}
                        </div>
                        <div className="col-sm-3">
                            {BarplotHelper("Study", "ResearchFocus", "Study")}
                        </div>
                        <div className="col-sm-3">
                            {BarplotHelper("Study", "ExposureMaterial", "Study")}
                        </div>
                    </>}

                </div>
                <hr></hr>
                <div>
                    <h2>Selected Studies</h2>
                </div>
                {studyDict && studyParticipantCounts.map((sdy) => {
                    if (sdy.participantCount > 0 && studyDict[sdy.studyName]) {
                        return (
                            <StudyCardMemo key={sdy.studyName}
                                study={studyDict[sdy.studyName]}
                                participantCount={sdy.participantCount} />
                        )
                    }
                })}
            </>,
            id: "study",
            tag: "find-study",
            text: "Study Design",
            tabClass: "pull-right",
        },
    }

    // -------------------------------- RETURN --------------------------------
    return (
        <div>
            {/* <div className="df-dropdown-options">
                <LoadDropdown groups={availableGroups} loadParticipantGroup={loadParticipantGroup} />
                <ClearDropdown clearAll={clearFilters} reset={() => { loadedGroup ? loadParticipantGroup(loadedGroup) : clearFilters() }} />
                <SaveDropdown
                    saveAs={() => saveButtonClick()}
                    save={() => updateParticipantGroup(loadedGroup)}
                    disableSave={!loadedGroup} />
            </div> */}
            <BannerMemo
                filters={appliedFilters}
                groupName={loadedGroup ? loadedGroup.label : "Unsaved Participant Group"}
                counts={totalAppliedCounts}
                unsavedFilters={bannerInfo.unsavedFilters}
                links={
                    <>
                        <a className="labkey-text-link" href="/study/Studies/manageParticipantCategories.view?">Manage Groups</a>
                        <a className="labkey-text-link" href="#" onClick={() => sendParticipantGroup()}>Send</a>
                        <a className="labkey-text-link" href="/immport/Studies/exportStudyDatasets.view?">Export Study Datasets</a>
                        <a className="labkey-text-link" href="/rstudio/start.view?">RStudio</a>

                    </>
                }
                dropdowns={
                    <>
                        <LoadDropdown groups={availableGroups} loadParticipantGroup={loadParticipantGroup} />
                        <ClearDropdown clearAll={clearFilters} reset={() => { loadedGroup ? loadParticipantGroup(loadedGroup) : clearFilters() }} />
                        <SaveDropdown
                            saveAs={() => saveButtonClick()}
                            save={() => updateParticipantGroup(loadedGroup)}
                            disableSave={!loadedGroup} />
                    </>
                } />

            <div className="row" style={{ position: "relative" }}>
                {filterCategories && <>
                    <div className="col-sm-4">
                        {FilterDropdownHelper("Study", "Condition", true)}
                        {FilterDropdownHelper("Study", "ResearchFocus", true)}
                        {FilterDropdownHelper("Study", "ExposureMaterial", true)}
                        {FilterDropdownHelper("Study", "ExposureProcess", true)}
                        {FilterDropdownHelper("Study", "Species", true)}
                    </div>
                    <div className="col-sm-4">
                        {FilterDropdownHelper("Subject", "Gender", true)}
                        {FilterDropdownHelper("Subject", "Age", true)}
                        {FilterDropdownHelper("Subject", "Race", true)}
                    </div>
                    <div className="col-sm-3">
                        <ContentDropdown id={"heatmap-selector"} label={"Assay*Timepoint"} content={filterCategories &&
                            <>
                                <SampleTypeCheckbox
                                    toggleShowSampleType={toggleSampleType}
                                    showSampleType={showSampleType} />
                                <HeatmapSelector
                                    name={"heatmap2"}
                                    data={cubeData.Data.toJS()}
                                    filterClick={filterClick}
                                    showSampleType={showSampleType}
                                    selected={selectedFilters.Data}
                                    timepointCategories={filterCategories.Timepoint}
                                    sampleTypeAssayCategories={filterCategories.SampleTypeAssay} />
                            </>}>
                            <>
                                <AndOrDropdown status={selectedFilters.getIn(["Data", "Assay", "Timepoint", "operator"])} onClick={clickAndOr("Data", "Assay.Timepoint")} />
                                {selectedFilters.Data.getIn(["Assay", "Timepoint"]) && selectedFilters.Data.getIn(["Assay", "Timepoint", "members"]).map((member) => {
                                    return (
                                        <>
                                            < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.Timepoint", member: member })} >
                                                {member.split(".").join(" at ") + " days"}
                                            </Flag>
                                        </>
                                    )
                                })}
                                {selectedFilters.Data.getIn(["Assay", "SampleType"]) && selectedFilters.Data.getIn(["Assay", "SampleType", "members"]).map((member) => {
                                    const memberSplit = member.split(".")
                                    return (
                                        <>
                                            < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.SampleType", member: member })} >
                                                {`${memberSplit[0]} (${memberSplit[2]}) at ${memberSplit[1]} days`}
                                            </Flag>
                                        </>
                                    )
                                })}
                            </>
                        </ContentDropdown>
                        {FilterDropdownHelper("Data", "Timepoint", true, true)}
                        {FilterDropdownHelper("Data", "SampleType.SampleType", true, true)}
                        {FilterDropdownHelper("Data", "Assay.Assay", true, true)}

                    </div>
                    <div style={{ position: "absolute", top: "0", right: "15px" }}>
                        <ActionButton text={"Apply"} onClick={() => applyFilters()} />
                        <div style={{ position: "absolute", top: "35px", right: "0", textAlign: "right", width: "8em" }}>{totalSelectedCounts.participant} participants from {totalSelectedCounts.study} studies</div>
                    </div>
                </>
                }

            </div>

            <div className="datafinder-wrapper">
                <Tabs tabs={tabs} defaultActive="study" tabFunction={renderWepart} />
            </div>

            {/* Tooltip */}
            <div id="heatmap-label" />
            <div className="arrow-down" />

        </div>
    )

}

export const App: React.FC = () => {

    const [cubeReady, setCubeReady] = React.useState(false)
    // debugger
    const dfcube = LABKEY.query.olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'DataFinder',
        name: 'DataFinderCube'
    })
    React.useEffect(() => {
        dfcube.onReady((mdx) => {
            setCubeReady(true)
        })
    }, [])

    if (cubeReady) {
        return <DataFinderController mdx={dfcube.mdx} />
    }
    return <div></div>
}
