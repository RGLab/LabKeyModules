import "./DataFinder.scss";
import React, { memo } from 'react';
// import {olap} from '../olap/olap'
import { CubeData, Filter, SelectedFilters, TotalCounts, GroupInfo, BannerInfo } from '../typings/CubeData';
import * as CubeHelpers from './helpers/CubeHelpers';
import * as ParticipantGroupHelpers from './helpers/ParticipantGroup';
import { toggleFilter } from './helpers/SelectedFilters';
import { StudyParticipantCount, StudyInfo } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { Map, List } from 'immutable';
import { ActionButton, LoadDropdown, SaveDropdown, ClearDropdown } from './components/ActionButton'
import { FilterDropdown, ContentDropdown } from './components/FilterDropdown'
import { FilterSummary, Flag, AssayFilterIndicatorList } from './components/FilterIndicator'
import { Barplot } from './components/Barplot'
import { HeatmapSelector, SampleTypeCheckbox } from './components/HeatmapSelector';
import Tabs from "./components/Tabs";
import * as d3 from 'd3'
import { Banner } from "./components/Banner";

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

    // state -----
    // Data (updated by API calls)
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)
    const [studyDict, setStudyDict] = React.useState(null); // this should only be loaded once
    const [studyParticipantCounts, setStudyParticipantCounts] = React.useState<List<StudyParticipantCount>>(List())
    const [availableGroups, setAvailableGroups] = React.useState<GroupInfo[]>([])
    const [filterCategories, setFilterCategories] = React.useState(null)

    // Groups
    const [loadedGroup, setLoadedGroup] = React.useState<GroupInfo>()
    const [totalSelectedCounts, setTotalSelectedCounts] = React.useState<TotalCounts>({ study: 0, participant: 0 })
    const [totalAppliedCounts, setTotalAppliedCounts] = React.useState<TotalCounts>({ study: 0, participant: 0 })
    const [unsavedFilters, setUnsavedFilters] = React.useState<boolean>(false)

    // Filters (updated by user)
    const [appliedFilters, setAppliedFilters] = React.useState<SelectedFilters>(sf)
    const [selectedFilters, setSelectedFilters] = React.useState<SelectedFilters>(appliedFilters)

    // Other view settings set by user
    const [showSampleType, setShowSampleType] = React.useState<boolean>(false)

    // Webparts
    const [participantDataWebpart, setParticipantDataWebpart] = React.useState()
    const [dataViewsWebpart, setDataViewsWebpart] = React.useState()

    // Banner
    const [bannerInfo, setBannerInfoState] = React.useState<BannerInfo>(new BannerInfo(JSON.parse(localStorage.getItem("dataFinderBannerInfo"))))
    const setBannerInfo = (bi: BannerInfo) => {
        // debugger
        setBannerInfoState(bi)
        localStorage.setItem("dataFinderBannerInfo", JSON.stringify(bi))
    }
    if (bannerInfo == null) {
        setBannerInfo(new BannerInfo({ counts: totalSelectedCounts }))
    }


    // Effects  -------------------------------------

    // Setup ----- 
    // Do these things only when the page loads --------
    React.useEffect(() => {
        // load data
        CubeHelpers.getFilterCategories().then((categoriesResponse) => {
            const categories = CubeHelpers.createFilterCategories(categoriesResponse)
            setFilterCategories(categories)
        })
        CubeHelpers.getStudyDict(mdx, appliedFilters).then((sd) => {
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
        CubeHelpers.getTotalCounts(mdx, selectedFilters)
            .then((counts) => {
                setTotalAppliedCounts(counts)
            })
        applyFilters(selectedFilters, bannerInfo.unsavedFilters)

    }, [])

    // Do these things when certain variables are incremented --------
    // Apply filters
    // React.useEffect(() => {

    // }, [applyCounter])


    React.useEffect(() => {
        console.log("----- get total counts -----")
        CubeHelpers.getTotalCounts(mdx, selectedFilters)
            .then((counts) => {
                setTotalSelectedCounts(counts)
            })
    }, [selectedFilters])

    // Helper functions ---------------------------------------------
    // These are functions which will get passed down to those components
    // which can cause updates to the page
    const BannerMemo = memo(Banner)
    const HeatmapSelectorMemo = memo(HeatmapSelector)
    const BarplotMemo = memo(Barplot)

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

    const FilterDropdownHelper = (dim, level, includeIndicators = false) => {
        const levelArray = level.split(".")
        return (<FilterDropdown
            key={level}
            dimension={dim}
            level={level}
            members={filterCategories[levelArray[0]]}
            filterClick={filterClick}
            selected={selectedFilters.getIn([dim, ...levelArray])}>
            <>
                {includeIndicators && selectedFilters.getIn([dim, ...levelArray]) && selectedFilters.getIn([dim, ...levelArray]).map((memberList) => {
                    return (
                        <div style={{ width: "10em" }}>
                            < Flag dim={dim} onDelete={filterClick(dim, { level: level, member: memberList.get(0) })} >
                                {memberList.get(0)}
                            </Flag>
                        </div>
                    )
                })}
            </>
        </FilterDropdown>)
    }

    // ------ filter-related -------

    const filterClick = (dim: string, filter: Filter) => {
        return (() => {
            const sf = toggleFilter(dim, filter.level, filter.member, selectedFilters)
            setSelectedFilters(sf)
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
                const spc = CubeHelpers.createStudyParticipantCounts(spcResponse)
                setStudyParticipantCounts(spc)
                if (studyDict) {
                    ParticipantGroupHelpers.updateContainerFilter(spcResponse, studyDict)
                }
            })
        CubeHelpers.getCubeData(mdx, filters)
            .then((res) => {
                const cd = CubeHelpers.createCubeData(res)
                console.log(cd.toJS())
                setCubeData(cd)
            }
            )
        CubeHelpers.getParticipantIds(mdx, filters).then((pids) =>
            ParticipantGroupHelpers.saveParticipantIdGroupInSession(pids).then(() => {
                if (participantDataWebpart) participantDataWebpart.render()
            }
            ))
        let unsavedFiltersValue = customUnsavedFilters
        if (customUnsavedFilters == null) {
            unsavedFiltersValue = loadedGroup && !unsavedFilters
        }
        setUnsavedFilters(unsavedFiltersValue)
        CubeHelpers.getTotalCounts(mdx, filters)
            .then((counts) => {
                setTotalAppliedCounts(counts)
                setTotalSelectedCounts(counts)
                setBannerInfo(bannerInfo.with({ unsavedFilters: unsavedFiltersValue, counts: counts, groupName: groupName || bannerInfo.groupName }))
            })


        // setApplyCounter(applyCounter + 1)
    }

    const clearFilters = () => {
        d3.select("#barplot-Age")
        // debugger;
        setSelectedFilters(new SelectedFilters());
        setLoadedGroup(null)
        applyFilters(new SelectedFilters(), false, "Unsaved Participant Group")
    }
    // ----------------

    // ----- participant group-related -----
    const saveButtonClick = (groupLabel = "", gotoSendAfterSave = false) => {
        CubeHelpers.getParticipantIds(mdx, selectedFilters).then((pids) => {
            const saveWindow = ParticipantGroupHelpers.openSaveWindow(studySubject, pids, appliedFilters, groupLabel, gotoSendAfterSave)
            saveWindow.on("aftersave", (saveData) => {
                console.log(saveData)
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
        })

    }

    const updateParticipantGroup = (groupInfo: GroupInfo, goToSendAfterSave = false) => {
        CubeHelpers.getParticipantIds(mdx, selectedFilters).then((pids) => {
            ParticipantGroupHelpers.updateParticipantGroup(pids, appliedFilters, loadedGroup)
                .then((success) => {
                    ParticipantGroupHelpers.getAvailableGroups().then((data) => {
                        const groups = ParticipantGroupHelpers.createAvailableGroups(data)
                        setAvailableGroups(groups)
                    })
                    if (goToSendAfterSave) {
                        ParticipantGroupHelpers.goToSend(groupInfo.id)
                    }
                })
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

    const renderWepart = (tabName: string) => {
        console.log("renderWebpart(" + tabName + ")")
        if (tabName == "participant") { participantDataWebpart.render(); return }
        if (tabName == "data") { dataViewsWebpart.render(); return }
        return
    }

    // Define re-used components
    const participantSummary = <div style={{ margin: "30px 0px" }}>{totalSelectedCounts.participant} participants <br /> from {totalSelectedCounts.study} studies</div>

    // ----- define the various tabs -----
    const tabs = {
        // intro: {
        //     content: <h1>Find Groups</h1>,
        //     id: "intro",
        //     tag: "intro",
        //     text: "Groups"
        // },
        data: {
            content: <>
                <div className="row">
                    {/* <div className="col-sm-3">
                        <div style={{ width: "20em", float: "left", margin: "25px" }}>

                            <ActionButton text={"Apply"} onClick={() => applyFilters()} />
                            {selectedFilters.Data.getIn(["Assay", "Assay"]) && selectedFilters.Data.getIn(["Assay", "Assay"]).map((memberList) => {
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.Assay", member: memberList.get(0) })} >
                                            {memberList.get(0) + " at any time point"}
                                        </Flag>
                                        AND
                                    </>
                                )
                            })}
                            {selectedFilters.Data.getIn(["Assay", "Timepoint"]) && selectedFilters.Data.getIn(["Assay", "Timepoint"]).map((memberList) => {
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.Timepoint", member: memberList.get(0) })} >
                                            {memberList.get(0).split(".").join(" at ") + " days"}
                                        </Flag>
                                        AND
                                    </>
                                )
                            })}
                            {selectedFilters.Data.getIn(["Assay", "SampleType"]) && selectedFilters.Data.getIn(["Assay", "SampleType"]).map((memberList) => {
                                const memberSplit = memberList.get(0).split(".")
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.SampleType", member: memberList.get(0) })} >
                                            {`${memberSplit[0]} (${memberSplit[2]}) at ${memberSplit[1]} days`}
                                        </Flag>
                                        AND
                                    </>
                                )
                            })}
                            {selectedFilters.Data.get("Timepoint") && selectedFilters.Data.getIn(["Timepoint"]).map((memberList) => {
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "Timepoint", member: memberList.get(0) })} >
                                            {"Any assay at " + memberList.get(0) + " days"}
                                        </Flag>
                                        AND
                                    </>
                                )
                            })}
                            {selectedFilters.Data.getIn(["SampleType", "Assay"]) && selectedFilters.Data.getIn(["SampleType", "Assay"]).map((memberList) => {
                                const memberSplit = memberList.get(0).split(".")
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "SampleType.Assay", member: memberList.get(0) })} >
                                            {`${memberSplit[1]} (${memberSplit[0]}) at any day`}
                                        </Flag>
                                        AND
                                    </>
                                )
                            })}
                            <br />

                        </div>
                    </div> */}
                    <div>

                        {filterCategories &&
                            <HeatmapSelector
                                name={"heatmap1"}
                                data={cubeData.Data.toJS()}
                                filterClick={(dim: string, filter: Filter) => (() => {})}
                                showSampleType={showSampleType}
                                selected={selectedFilters.Data}
                                timepointCategories={filterCategories.Timepoint}
                                sampleTypeAssayCategories={filterCategories.SampleTypeAssay} />}

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
        study: {
            content: <>
                <div className="row">
                    {/* <div className="col-sm-3">
                        <h2>Study Characteristics</h2>
                        <p>
                            Study characteristics available based on current filters
                        </p>
                    </div> */}
                    {filterCategories && <>
                        <div className="col-sm-3">
                            {BarplotHelper("Study", "Condition", "Study")}
                        </div>
                        <div className="col-sm-3">
                            {BarplotHelper("Subject", "ExposureProcess", "Study")}
                        </div>
                        <div className="col-sm-3">
                            {BarplotHelper("Study", "Category", "Study")}
                        </div>
                        <div className="col-sm-3">
                            {BarplotHelper("Subject", "ExposureMaterial", "Study")}
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
                            <StudyCard key={sdy.studyName}
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


    return (
        <div>
            {/* <pre>
                {JSON.stringify(cubeData.toJS(), undefined, 2)}
                {JSON.stringify(studyDict.toJS(), undefined, 2)}
            </pre> */}
            <LoadDropdown groups={availableGroups} loadParticipantGroup={loadParticipantGroup} />
            <ClearDropdown clearAll={clearFilters} reset={() => { loadedGroup ? loadParticipantGroup(loadedGroup) : clearFilters() }} />
            <SaveDropdown
                saveAs={() => saveButtonClick()}
                save={() => updateParticipantGroup(loadedGroup)}
                disableSave={!loadedGroup} />
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
                } />

            <div className="row" style={{ position: "relative" }}>
                {filterCategories && <>
                    <div className="col-sm-4">
                        {FilterDropdownHelper("Study", "Condition", true)}
                        {FilterDropdownHelper("Study", "Category", true)}
                        {FilterDropdownHelper("Subject", "ExposureMaterial", true)}
                        {FilterDropdownHelper("Subject", "ExposureProcess", true)}
                        {FilterDropdownHelper("Subject", "Species", true)}
                    </div>
                    <div className="col-sm-4">
                        {FilterDropdownHelper("Subject", "Gender", true)}
                        {FilterDropdownHelper("Subject", "Age", true)}
                        {FilterDropdownHelper("Subject", "Race", true)}
                    </div>
                    <div className="col-sm-2">
                        <ContentDropdown id={"heatmap-selector"} label={"Assay-Timepoint Selector"} content={filterCategories &&
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
                            {selectedFilters.Data.getIn(["Assay", "Timepoint"]) && selectedFilters.Data.getIn(["Assay", "Timepoint"]).map((memberList) => {
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.Timepoint", member: memberList.get(0) })} >
                                            {memberList.get(0).split(".").join(" at ") + " days"}
                                        </Flag>
                                    </>
                                )
                            })}
                            {selectedFilters.Data.getIn(["Assay", "SampleType"]) && selectedFilters.Data.getIn(["Assay", "SampleType"]).map((memberList) => {
                                const memberSplit = memberList.get(0).split(".")
                                return (
                                    <>
                                        < Flag dim="Data" onDelete={filterClick("Data", { level: "Assay.SampleType", member: memberList.get(0) })} >
                                            {`${memberSplit[0]} (${memberSplit[2]}) at ${memberSplit[1]} days`}
                                        </Flag>
                                    </>
                                )
                            })}
                            </>
                        </ContentDropdown>
                        {FilterDropdownHelper("Data", "Timepoint", true)}
                        {FilterDropdownHelper("Data", "SampleType.SampleType", true)}
                        {FilterDropdownHelper("Data", "Assay.Assay", true)}

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


            {/* <pre>{JSON.stringify(selectedFilters.toJS(), null, 2)}</pre> */}
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
