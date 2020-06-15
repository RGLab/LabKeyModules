// NOTE: 
// While experimenting with immutable and typings, I found that I couldn't
// return an immutable object in a typed promise. So I return a regular
// js object, then have an additional function which translates it into the 
// proper immutable object. I'm open to other suggestions. -HM

import { CubeMdx } from "../../typings/Cube";
import { Query} from '@labkey/api';
import { SelectedFilters, PlotData, IPlotData, Filter, PlotDatum } from "../../typings/CubeData";
import * as Cube from '../../typings/Cube'
import { HeatmapDatum, FilterCategories } from '../../typings/CubeData'
import { createCubeFilters } from './SelectedFilters'
import * as StudyCardTypes from '../../typings/StudyCard'
import { StudyParticipantCount } from '../../typings/StudyCard'
import * as Immutable from 'immutable'
import { createTinyHeatmapConsts, createTinyHeatmapYaxisScale } from "../components/TinyHeatmap";


// ----- Promises ----- 
// Select Rows --------
// Get filter categories
export const getFilterCategories = () => {
    return new Promise<SelectRowsResponse>((resolve, reject) => {
        Query.selectRows({
            schemaName: 'immport',
            queryName: 'dataFinder_dropdownCategories',
            containerFilter: Query.ContainerFilter.currentAndSubfolders,
            success: (data: SelectRowsResponse) => { resolve(data) },
            failure: () => {
                reject();
            }
        })
    })
}

export const getStudyInfo = () => {
    return new Promise<SelectRowsResponse>((resolve, reject) => {
        Query.selectRows({
            schemaName: 'immport',
            queryName: 'dataFinder_studyCard',
            containerFilter: Query.ContainerFilter.currentAndSubfolders,
            success: (data: SelectRowsResponse) => { resolve(data) }
        })
    })
}

// Cube ---------------
// Study info ---- 
export const getStudyCounts = (mdx: CubeMdx, filters: SelectedFilters) => {
    return new Promise<Cube.CellSet>((resolve, reject) => {
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet) {
                resolve(cs);
            },
            name: 'DataFinderCube',
            onRows: { level: "[Study].[Name]", members: "members" },
            onCols: {
                operator: "UNION",
                arguments: [
                    { level: "[Subject].[(All)]", members: "members" },
                    { level: "[Data.Assay].[Timepoint]", members: "members" }
                ]
            },
            countDistinctLevel: "[Subject].[Subject]",
            showEmpty: false

        })
    })
}

// Update StudyParticipantCounts from Cube response
export const getStudyParticipantCounts = (mdx: CubeMdx, filters: SelectedFilters, loadedStudiesArray: string[]) => {

    return new Promise<Cube.CellSet>((resolve, reject) => {
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet) {
                resolve(cs)
            },
            name: 'DataFinderCube',
            onRows: {
                operator: "UNION",
                arguments: [
                    { level: "[Study].[Name]", members: "members" },
                    { level: "[Subject].[Subject]", members: "members" }
                ]
            },
            countFilter: [{
                level: "[Subject].[Subject]",
                membersQuery: { level: "[Study].[Name]", members: loadedStudiesArray }
            }, ...createCubeFilters(filters)],
            countDistinctLevel: "[Subject].[Subject]",
            showEmpty: false
        })
    })
}

export const getPlotData = (mdx: CubeMdx, filters: SelectedFilters, countLevel: string, loadedStudiesArray: string[], showEmpty = true) => {

    return new Promise<Cube.CellSet>((resolve, reject) => {
        // debugger
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet, mdx, config) {
                resolve(cs)
            },
            name: 'DataFinderCube',
            onRows: {
                operator: "UNION",
                arguments: [
                    { level: "[Subject.Race].[Race]" },
                    { level: "[Subject.Age].[Age]" },
                    { level: "[Subject.Gender].[Gender]" },
                    { level: "[Subject.ExposureMaterial].[ExposureMaterial]" },
                    { level: "[Subject.ExposureProcess].[ExposureProcess]" },
                    { level: "[Subject.Species].[Species]" },
                    { level: "[Study.Condition].[Condition]" },
                    { level: "[Study.ResearchFocus].[ResearchFocus]" },
                    { level: "[Data.Assay].[Assay]" },
                    { level: "[Data.Assay].[Timepoint]" },
                    { level: "[Data.Assay].[SampleType]" },
                    { level: "[Data.Timepoint].[Timepoint]" },
                    { level: "[Data.Timepoint].[SampleType]"},
                    { level: "[Data.SampleType].[SampleType]" },
                    { level: "[Data.SampleType].[Assay]" },
                    { level: "[Study].[Name]"}
                ]
            },
            countFilter: [{
                level: "[Subject].[Subject]",
                membersQuery: { level: "[Study].[Name]", members: loadedStudiesArray }
            }, ...createCubeFilters(filters)],
            countDistinctLevel: countLevel,
            showEmpty: showEmpty

        })

    })
}


export const getTotalCounts = (mdx: CubeMdx, filters: SelectedFilters, countLevel: string, loadedStudiesArray: string[]) => {
    const onRowsLevel = countLevel == "[Study].[Name]" ? "[Study].[(All)]" : "[Subject].[(All)]"
    return new Promise<Cube.CellSet>((resolve, reject) => {
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet, mdx, config) {
                resolve(cs)
            },
            name: 'DataFinderCube',
            onRows: {
                level: onRowsLevel, members: "members"
            },
            countFilter: [{
                level: "[Study].[Name]",
                membersQuery: { level: "[Study].[Name]", members: loadedStudiesArray }
            }, ...createCubeFilters(filters)],
            countDistinctLevel: countLevel,
            showEmpty: true
        })
    })
}

/// -----------------------------------------------------------
// 
export const createLoadedStudies = (studyInfoRes: SelectRowsResponse) => {
    const loadedStudiesArray = studyInfoRes.rows.map((sdy) => {
        return("[Study].[" + sdy.study_accession + "]")
    })
    // loadedStudiesArray.sort((a, b) => {
    //     const ida = parseInt(a.slice(12, a.length-1))
    //     const idb = parseInt(b.slice(12, b.length-1))
    //     return(ida - idb)
    // })
    // Remove two null studies (Project, and template)
    loadedStudiesArray.pop()
    loadedStudiesArray.pop()
    return(loadedStudiesArray)
}
export const createTotalCounts = ([subjectResponse, studyResponse]) => {
    return ({ study: studyResponse.cells[0][0].value || 0, participant: subjectResponse.cells[0][0].value || 0 })
}

export const createParticipantIds = (participantIdsCs: Cube.CellSet) => {
    return (participantIdsCs.axes[1].positions.map(position => position[0].name))
}

export const createStudyDict = ([studyInfoCs, studyCountCs]: [SelectRowsResponse, Cube.CellSet]) => {

    const studyDict: StudyCardTypes.StudyDict = {};
    studyInfoCs.rows.map((e, i) => {
        const studyName = e.study_accession;
        // studyDict[studyName] = studyInfo;
        studyDict[studyName] = { ...e }
    })

    // Combine with info for tiny heatmap
    // Things that are the same for all heatmaps
    const tinyHeatmapConsts = createTinyHeatmapConsts();

    // Things that are different for all heatmaps
    studyCountCs.axes[1].positions.forEach((e, i) => {
        const studyName = e[0].name;
        const totalParticipantCount = studyCountCs.cells[i][0].value;
        if (studyDict.hasOwnProperty(studyName)) {
            studyDict[studyName] = { totalParticipantCount, ...studyDict[studyName] }
            const assays = []
            const heatmapData = studyCountCs.axes[0].positions.map((f, j) => {
                const positionInfo = dataAssayNameToInfo(f[0].uniqueName, true)
                const positionCount = studyCountCs.cells[i][j].value;

                if (assays.indexOf(positionInfo.assay) == -1 && positionCount > 0 && positionInfo.assay != undefined) {
                    assays.push(positionInfo.assay)
                }

                return (
                    {
                        x: positionInfo.timepoint,
                        y: positionInfo.assay,
                        participantCount: positionCount,
                        studyCount: 1,
                        data: undefined
                    }
                )
            })
            heatmapData.shift()
            const heatmapHeight = 35 + 10 * assays.length
            const yaxisScale = createTinyHeatmapYaxisScale(assays)

            studyDict[studyName].heatmapInfo = {
                data: heatmapData,
                assays: assays.sort(),
                height: heatmapHeight,
                width: tinyHeatmapConsts.width,
                yaxisScale: yaxisScale,
                xaxisScale: tinyHeatmapConsts.xaxisScale,
                colorScale: tinyHeatmapConsts.colorScale
            } 
        }
    })
    return (studyDict)
}


export const createFilterCategories_old = (categoriesResponse: SelectRowsResponse) => {
    let categories: FilterCategories = {};

    categoriesResponse.rows.forEach((row) => {

        if (categories[row.variable] === undefined) categories[row.variable] = []
        categories[row.variable].push({ label: row.category, sortorder: row.sortorder })
    })
    Object.keys(categories).forEach((key) => {
        categories[key].sort((a, b) => {
            if (a.sortorder == b.sortorder) { if (a.label.toLowerCase() > b.label.toLowerCase()) return (1); else return (-1) }
            return a.sortorder - b.sortorder
        })
    })
    return (categories)
}

export const createFilterCategories = (categoriesCs: Cube.CellSet) => {
    let categories: FilterCategories = {};
    const sortorder = (level, label) => {
        if (label === "Unknown") return(99999)
        if (label === "Other") return(99998)
        if (level === "Timepoint") {
            if (label === "<0") return(-1); 
            if (label === ">56") return(99); 
            return(parseInt(label))
        } else if (level === "Study") {
            return(parseInt(label.slice(3)))
        }
        return(0)
    }
    categoriesCs.axes[1].positions.forEach((position) => {
        if ([
                "[Data.Assay].[Timepoint]",
                "[Data.Assay].[SampleType]",
                "[Data.SampleType].[Assay]",
                "[Data.Timepoint].[SampleType]"

        ].indexOf(position[0].level.uniqueName) == -1) {
            let level: string;
            let label: string;
            if (position[0].level.uniqueName === "[Data.SampleType].[Assay]") {
                level = "SampleTypeAssay"
                const l = position[0].uniqueName;
                const split = l.split("].[")

                label = [split[1], split[2].slice(0, split[2].length -1)].join(".")
            } else {
                level = position[0].level.name === "Name" ? "Study" : position[0].level.name;
                label = position[0].name;
            }
            if (categories[level] === undefined) categories[level] = []
            categories[level].push({label: label, sortorder: sortorder(level, label)})
        }
    })
    Object.keys(categories).forEach((key) => {
        categories[key].sort((a, b) => {
            if (a.sortorder == b.sortorder) { 
                if (a.label.toLowerCase() > b.label.toLowerCase()) return (1); else return (-1) 
            }
            return a.sortorder - b.sortorder
        })
    })
    return(categories)
}

export const createStudyParticipantCounts = (studyParticipantCountCs: Cube.CellSet) => {
    const studyParticipantCountArray: StudyCardTypes.IStudyParticipantCount[] = []
    const pids: string[] = []
    studyParticipantCountCs.cells.forEach((cell) => {
        if (cell[0].positions[1][0].level.uniqueName == "[Study].[Name]") {
            const studyName = cell[0].positions[1][0].name
            const participantCount = cell[0].value
            studyParticipantCountArray.push({
                studyName: studyName,
                participantCount: participantCount
            })
        } else {
            const pid = cell[0].positions[1][0].name
            pids.push(pid)
        }
    })

    const studyParticipantCounts = studyParticipantCountArray.map((spc: StudyCardTypes.IStudyParticipantCount) => {
        return (new StudyCardTypes.StudyParticipantCount(spc))
    })
    const countsList = Immutable.List<StudyParticipantCount>(studyParticipantCounts);

    return ({ countsList: countsList, pids: pids })
}

const cs2cd = ([participantCounts, studyCounts]: [Cube.CellSet, Cube.CellSet]) => {

    const results: { dim: string, levelArray: string[], data: PlotDatum }[] = participantCounts.cells.map((cell, cellIndex) => {
        const hierarchy = cell[0].positions[1][0].level.uniqueName.replace(/\[|\]/g, "") // remove "[" and "]"
        const cubeDim = hierarchy.replace(/\..+/, "") // remove everything after and including the first "."
        let level = hierarchy.replace(/\w+\./, "") // remove everything before and including the first "."
        // Move some subject filters to "study design"
        const dim = [
            "Species.Species", 
            "ExposureMaterial.ExposureMaterial", 
            "ExposureProcess.ExposureProcess"
        ].indexOf(level) > -1 ? "Study" : cubeDim
        let levelArray: string[]
        if (dim == "Data") {
            levelArray = level.split(".")
        } else {
            level = level.split(".")[0]
            levelArray = [level]
        }
        const member = cell[0].positions[1][0].uniqueName.replace(/\[\w+\.\w+\]\./, "").replace(/\[|\]/g, "")
        const participantCount = cell[0].value
        const studyCount = studyCounts?.cells[cellIndex][0].value

        return ({
            dim: dim,
            levelArray: levelArray,
            data: {
                level: level,
                member: member,
                participantCount: participantCount,
                studyCount: studyCount
            }
        })
    })
    let plotData: any = new PlotData()
    results.forEach((result) => {
        const members: Immutable.List<string> = plotData.getIn([result.dim, ...result.levelArray]).push(result.data)
        plotData = plotData.setIn([result.dim, ...result.levelArray], members)
    });
    return plotData.toJS()
}



export const createPlotData = (counts: [Cube.CellSet, Cube.CellSet]) => {
    const plotData = cs2cd(counts)
    return new PlotData(plotData);
}




const dataAssayNameToInfo = (name: string, shortAssayNames: boolean = false) => {
    if (/(All)/.test(name)) { return { assay: undefined, timepoint: undefined, sampleType: undefined } }
    const s = name.slice(13).split(/\./g).map(s => s.replace(/[\[\]]/g, ""))
    const info = { assay: s[0], timepoint: s[1], sampleType: s[2] }
    if (shortAssayNames) {
        const shortAssayNameMap = {
            "PCR": "PCR",
            "Neutralizing Antibody": "NAb",
            "MBAA": "MBAA",
            "HLA Typing": "HLA",
            "HAI": "HAI",
            "Gene Expression": "GE",
            "Flow Cytometry": "Flow",
            "ELISPOT": "ELISPOT",
            "ELISA": "ELISA",
            "CyTOF": "CyTOF",
            "KIR": "KIR"
        }
        info.assay = shortAssayNameMap[info.assay];
    }
    return (
        info
    )
}
