// NOTE: 
// While experimenting with immutable and typings, I found that I couldn't
// return an immutable object in a typed promise. So I return a regular
// js object, then have an additional function which translates it into the 
// proper immutable object. I'm open to other suggestions. -HM

import { CubeMdx } from "../../typings/Cube";
import * as LABKEY from '@labkey/api';
import { SelectedFilters, CubeData, ICubeData, Filter, CubeDatum } from "../../typings/CubeData";
import * as Cube from '../../typings/Cube'
import { HeatmapDatum } from '../../typings/CubeData'
import { createCubeFilters } from './SelectedFilters'
import * as StudyCardTypes from '../../typings/StudyCard'
import { StudyParticipantCount } from '../../typings/StudyCard'
import * as Immutable from 'immutable'

// TODO: Create appropriate queries from SelectedFilters to create appropriate filters for cube request
// TODO: Edit all functions in this file to actually make API calls using selected filters

// Study info ---- 
export const getStudyInfoArray = (mdx: CubeMdx, filters: SelectedFilters) => {


    console.log("getStudyInfoArray()")
    const studyInfoPromise = new Promise<StudyCardTypes.IStudyInfo[]>((resolve, reject) => {
        const si1: StudyCardTypes.StudyInfo = new StudyCardTypes.StudyInfo({
            assays: ["HAI", "GE"],
            brief_title: "Very Important Study",
            condition_studied: "influenza",
            sample_type: ["PBMC"],
            heatmapData: [{ level: "assay.timepoint", member: "HAI.4", participantCount: 15 },
            { level: "assay.timepoint", member: "HAI.2", participantCount: 30 }],
            pi_names: ["Helen Miller"],
            program_title: "Program 1",
            restricted: false,
            study_accession: "SDY269",
            totalParticipantCount: 100
        })
        const si2: StudyCardTypes.StudyInfo = new StudyCardTypes.StudyInfo({
            assays: ["HAI", "GE"],
            brief_title: "Very Important Study",
            condition_studied: "influenza",
            sample_type: ["PBMC"],
            heatmapData: [{ level: "assay.timepoint", member: "HAI.4", participantCount: 15 },
            { level: "assay.timepoint", member: "HAI.2", participantCount: 30 }],
            pi_names: ["Helen Miller"],
            program_title: "Program 1",
            restricted: false,
            study_accession: "SDY28",
            totalParticipantCount: 40
        })
        resolve([si1, si2])
    })
    return studyInfoPromise
}

export const createStudyDict = (studyInfoArray: StudyCardTypes.IStudyInfo[]) => {
    console.log("createStudyDict()")

    const studyInfo = studyInfoArray.map((si: StudyCardTypes.IStudyInfo) => {
        return ([si.study_accession, new StudyCardTypes.StudyInfo(si)])
    })
    const studyMap = Immutable.Map<string, StudyCardTypes.StudyInfo>(studyInfo)
    return (studyMap)
}

// Update StudyParticipantCounts from Cube response
export const getStudyParticipantCounts = (mdx: CubeMdx, filters: SelectedFilters) => {
    console.log("getStudyParticipantCounts()")

    const studyParticipantCountPromise = new Promise<StudyCardTypes.IStudyParticipantCount[]>((resolve, reject) => {
        const spc: StudyCardTypes.IStudyParticipantCount[] = [
            { studyName: "SDY269", participantCount: 98 },
            { studyName: "SDY28", participantCount: 1 }]
        resolve(spc)
    })
    return (studyParticipantCountPromise)
}
export const createStudyParticipantCounts = (studyParticipantCountArray: StudyCardTypes.IStudyParticipantCount[]) => {
    console.log("createStudyParticipantCounts()")

    const studyParticipantCounts = studyParticipantCountArray.map((spc: StudyCardTypes.IStudyParticipantCount) => {
        return (new StudyCardTypes.StudyParticipantCount(spc))
    })
    const countsList = Immutable.List<StudyParticipantCount>(studyParticipantCounts);
    return (countsList)
}

const cs2cd = (cs: Cube.CellSet) => {
    const results : {dim: string, levelArray: string[], data: CubeDatum}[] = cs.cells.map((cell) => {
        const hierarchy = cell[0].positions[1][0].level.uniqueName.replace(/\[|\]/g, "") // remove "[" and "]"
        const dim = hierarchy.replace(/\..+/, "") // remove everything after and including the first "."
        let level = hierarchy.replace(/\w+\./, "") // remove everything before and including the first "."
        // console.log(level)
        let levelArray: string[]
        if (level.match("Assay") || level.match("SampleType")) {
            levelArray = level.split(".")
        } else {
            level = level.split(".")[0]
            levelArray = [level]
        }
        const member = cell[0].positions[1][0].uniqueName.replace(/\[\w+\.\w+\]\./, "").replace(/\[|\]/g, "")
        const count = cell[0].value
        return ({
            dim: dim,
            levelArray: levelArray,
            data: {
                level: level,
                member: member,
                participantCount : count
            }
        })
    })
    let cubeData = new CubeData()
    results.forEach((result) => {
        // debugger
        const members: Immutable.List<string> = cubeData.getIn([result.dim, ...result.levelArray]).push(result.data)
        cubeData = Immutable.fromJS(cubeData.setIn([result.dim, ...result.levelArray], members).toJS())
    });
    // debugger
    return cubeData
}

export const getCubeData = (mdx: CubeMdx, filters: SelectedFilters) => {
    console.log("getCubeData()")
    // const studyFilter = [{
    //     level: "[Study].[Name]",
    //     membersQuery: { level: "[Study].[Name]", members: ["[Study].[SDY1092]", "[Study].[SDY1119]", "[Study].[SDY1291]", "[Study].[SDY903]", "[Study].[SDY28]", "[Study].[SDY514]", "[Study].[SDY387]", "[Study].[SDY34]", "[Study].[SDY1370]", "[Study].[SDY1373]", "[Study].[SDY789]", "[Study].[SDY1260]", "[Study].[SDY1264]", "[Study].[SDY1276]", "[Study].[SDY1328]", "[Study].[SDY296]", "[Study].[SDY301]", "[Study].[SDY63]", "[Study].[SDY74]", "[Study].[SDY312]", "[Study].[SDY314]", "[Study].[SDY315]", "[Study].[SDY478]", "[Study].[SDY113]", "[Study].[SDY305]", "[Study].[SDY472]", "[Study].[SDY395]", "[Study].[SDY406]", "[Study].[SDY460]", "[Study].[SDY773]", "[Study].[SDY421]", "[Study].[SDY461]", "[Study].[SDY675]", "[Study].[SDY400]", "[Study].[SDY404]", "[Study].[SDY614]", "[Study].[SDY112]", "[Study].[SDY888]", "[Study].[SDY1109]", "[Study].[SDY67]", "[Study].[SDY61]", "[Study].[SDY508]", "[Study].[SDY517]", "[Study].[SDY520]", "[Study].[SDY640]", "[Study].[SDY144]", "[Study].[SDY162]", "[Study].[SDY167]", "[Study].[SDY18]", "[Study].[SDY180]", "[Study].[SDY207]", "[Study].[SDY820]", "[Study].[SDY887]", "[Study].[SDY269]", "[Study].[SDY1289]", "[Study].[SDY1293]", "[Study].[SDY1324]", "[Study].[SDY984]", "[Study].[SDY522]", "[Study].[SDY753]", "[Study].[SDY56]", "[Study].[SDY278]", "[Study].[SDY1294]", "[Study].[SDY1325]", "[Study].[SDY1364]", "[Study].[SDY1368]", "[Study].[SDY80]", "[Study].[SDY270]", "[Study].[SDY515]", "[Study].[SDY422]", "[Study].[SDY506]", "[Study].[SDY523]", "[Study].[SDY756]", "[Study].[SDY299]", "[Study].[SDY300]", "[Study].[SDY364]", "[Study].[SDY368]", "[Study].[SDY369]", "[Study].[SDY372]", "[Study].[SDY376]", "[Study].[SDY645]", "[Study].[SDY416]", "[Study].[SDY597]", "[Study].[SDY667]", "[Study].[SDY87]", "[Study].[SDY89]", "[Study].[SDY690]", "[Study].[SDY212]", "[Study].[SDY215]", "[Study].[SDY519]", "[Study].[SDY224]", "[Study].[SDY232]", "[Study].[SDY241]", "[Study].[SDY1041]", "[Study].[SDY1097]"] }
    // }]
    // const cubeFilters = createCubeFilters(filters)
    // debugger

    const cubeData = new Promise<ICubeData>((resolve, reject) => {
        // debugger
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet, mdx, config) {
                resolve(cs2cd(cs))
            },
            name: 'DataFinderCube',
            onRows: {
                operator: "UNION",
                arguments: [
                    { level: "[Subject.Race].[Race]" },
                    { level: "[Subject.Age].[Age]"},
                    { level: "[Subject.Gender].[Gender]"},
                    { level: "[Study.Condition].[Condition]"},
                    { level: "[Data.Assay].[Assay]"},
                    { level: "[Data.Assay].[Timepoint]"},
                    { level: "[Data.Assay].[SampleType]"},
                    { level: "[Data.Timepoint].[Timepoint]"},
                    { level: "[Data.SampleType].[SampleType]"},
                    { level: "[Data.SampleType].[Assay]"}
                ]
            },
            countFilter: [{
                level: "[Study].[Name]",
                membersQuery: { level: "[Study].[Name]", members: ["[Study].[SDY1092]", "[Study].[SDY1119]", "[Study].[SDY1291]", "[Study].[SDY903]", "[Study].[SDY28]", "[Study].[SDY514]", "[Study].[SDY387]", "[Study].[SDY34]", "[Study].[SDY1370]", "[Study].[SDY1373]", "[Study].[SDY789]", "[Study].[SDY1260]", "[Study].[SDY1264]", "[Study].[SDY1276]", "[Study].[SDY1328]", "[Study].[SDY296]", "[Study].[SDY301]", "[Study].[SDY63]", "[Study].[SDY74]", "[Study].[SDY312]", "[Study].[SDY314]", "[Study].[SDY315]", "[Study].[SDY478]", "[Study].[SDY113]", "[Study].[SDY305]", "[Study].[SDY472]", "[Study].[SDY395]", "[Study].[SDY406]", "[Study].[SDY460]", "[Study].[SDY773]", "[Study].[SDY421]", "[Study].[SDY461]", "[Study].[SDY675]", "[Study].[SDY400]", "[Study].[SDY404]", "[Study].[SDY614]", "[Study].[SDY112]", "[Study].[SDY888]", "[Study].[SDY1109]", "[Study].[SDY67]", "[Study].[SDY61]", "[Study].[SDY508]", "[Study].[SDY517]", "[Study].[SDY520]", "[Study].[SDY640]", "[Study].[SDY144]", "[Study].[SDY162]", "[Study].[SDY167]", "[Study].[SDY18]", "[Study].[SDY180]", "[Study].[SDY207]", "[Study].[SDY820]", "[Study].[SDY887]", "[Study].[SDY269]", "[Study].[SDY1289]", "[Study].[SDY1293]", "[Study].[SDY1324]", "[Study].[SDY984]", "[Study].[SDY522]", "[Study].[SDY753]", "[Study].[SDY56]", "[Study].[SDY278]", "[Study].[SDY1294]", "[Study].[SDY1325]", "[Study].[SDY1364]", "[Study].[SDY1368]", "[Study].[SDY80]", "[Study].[SDY270]", "[Study].[SDY515]", "[Study].[SDY422]", "[Study].[SDY506]", "[Study].[SDY523]", "[Study].[SDY756]", "[Study].[SDY299]", "[Study].[SDY300]", "[Study].[SDY364]", "[Study].[SDY368]", "[Study].[SDY369]", "[Study].[SDY372]", "[Study].[SDY376]", "[Study].[SDY645]", "[Study].[SDY416]", "[Study].[SDY597]", "[Study].[SDY667]", "[Study].[SDY87]", "[Study].[SDY89]", "[Study].[SDY690]", "[Study].[SDY212]", "[Study].[SDY215]", "[Study].[SDY519]", "[Study].[SDY224]", "[Study].[SDY232]", "[Study].[SDY241]", "[Study].[SDY1041]", "[Study].[SDY1097]"] }
            }, ...createCubeFilters(filters)],
            countDistinctLevel: "[Subject].[Subject]",
            showEmpty: true

        })

    })
    return (cubeData)
}

export const createCubeData = (cubeData: ICubeData) => {
    console.log("createCubeData()")
    return new CubeData(cubeData);
}

export const getParticipantIds = (mdx: CubeMdx, filters: SelectedFilters) => {
    console.log("getCubeData()")
    const participantIds = new Promise<string[]>((resolve, reject) => {
        // debugger
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet, mdx, config) {
                const pids = cs.axes[1].positions.map(position => position[0].name)
                resolve(pids)
            },
            name: 'DataFinderCube',
            onRows: { level: "[Subject].[Subject]"
            },
            countFilter: [{
                level: "[Study].[Name]",
                membersQuery: { level: "[Study].[Name]", members: ["[Study].[SDY1092]", "[Study].[SDY1119]", "[Study].[SDY1291]", "[Study].[SDY903]", "[Study].[SDY28]", "[Study].[SDY514]", "[Study].[SDY387]", "[Study].[SDY34]", "[Study].[SDY1370]", "[Study].[SDY1373]", "[Study].[SDY789]", "[Study].[SDY1260]", "[Study].[SDY1264]", "[Study].[SDY1276]", "[Study].[SDY1328]", "[Study].[SDY296]", "[Study].[SDY301]", "[Study].[SDY63]", "[Study].[SDY74]", "[Study].[SDY312]", "[Study].[SDY314]", "[Study].[SDY315]", "[Study].[SDY478]", "[Study].[SDY113]", "[Study].[SDY305]", "[Study].[SDY472]", "[Study].[SDY395]", "[Study].[SDY406]", "[Study].[SDY460]", "[Study].[SDY773]", "[Study].[SDY421]", "[Study].[SDY461]", "[Study].[SDY675]", "[Study].[SDY400]", "[Study].[SDY404]", "[Study].[SDY614]", "[Study].[SDY112]", "[Study].[SDY888]", "[Study].[SDY1109]", "[Study].[SDY67]", "[Study].[SDY61]", "[Study].[SDY508]", "[Study].[SDY517]", "[Study].[SDY520]", "[Study].[SDY640]", "[Study].[SDY144]", "[Study].[SDY162]", "[Study].[SDY167]", "[Study].[SDY18]", "[Study].[SDY180]", "[Study].[SDY207]", "[Study].[SDY820]", "[Study].[SDY887]", "[Study].[SDY269]", "[Study].[SDY1289]", "[Study].[SDY1293]", "[Study].[SDY1324]", "[Study].[SDY984]", "[Study].[SDY522]", "[Study].[SDY753]", "[Study].[SDY56]", "[Study].[SDY278]", "[Study].[SDY1294]", "[Study].[SDY1325]", "[Study].[SDY1364]", "[Study].[SDY1368]", "[Study].[SDY80]", "[Study].[SDY270]", "[Study].[SDY515]", "[Study].[SDY422]", "[Study].[SDY506]", "[Study].[SDY523]", "[Study].[SDY756]", "[Study].[SDY299]", "[Study].[SDY300]", "[Study].[SDY364]", "[Study].[SDY368]", "[Study].[SDY369]", "[Study].[SDY372]", "[Study].[SDY376]", "[Study].[SDY645]", "[Study].[SDY416]", "[Study].[SDY597]", "[Study].[SDY667]", "[Study].[SDY87]", "[Study].[SDY89]", "[Study].[SDY690]", "[Study].[SDY212]", "[Study].[SDY215]", "[Study].[SDY519]", "[Study].[SDY224]", "[Study].[SDY232]", "[Study].[SDY241]", "[Study].[SDY1041]", "[Study].[SDY1097]"] }
            }, ...createCubeFilters(filters)],
            countDistinctLevel: "[Subject].[Subject]",
            showEmpty: false

        })

    })
    return (participantIds)
}


// // Create StudyDict
// const createStudyDict_old = (mdx: CubeMdx, filters: SelectedFilters) => {
//     console.log("creating study dict")
//     const cubeFilters = createCubeFilters(filters);

//     // define a promise to get info from query
//     const studyInfo = new Promise<SelectRowsResponse>((resolve, reject) => {
//         LABKEY.Query.selectRows({
//             schemaName: 'immport',
//             queryName: 'dataFinder_studyCard',
//             success: (data: SelectRowsResponse) => { resolve(data) }
//         })
//     })

//     // Define a promise to get study counts
//     const studyCounts = new Promise<Cube.CellSet>((resolve, reject) => {
//         console.log("getting study counts")
//         console.log(mdx)
//         console.log(cubeFilters)
//         mdx.query({
//             configId: "DataFinder:/DataFinderCube",
//             schemaName: 'immport',
//             success: function (cs: Cube.CellSet, mdx, config) {
//                 console.log("got study counts")
//                 resolve(cs);
//             },
//             name: 'DataFinderCube',
//             onRows: { level: "[Study].[Name]", members: ["members"] },
//             onCols: {
//                 operator: "UNION",
//                 arguments: [
//                     { level: "[Subject].[(All)]", members: ["members"] },
//                     { level: "[Data.Assay].[Timepoint]", members: ["members"] }
//                 ]
//             },
//             countFilter: cubeFilters,
//             countDistinctLevel: "[Subject].[Subject]",
//             showEmpty: false

//         })
//     })

//     // combine results after they have all been loaded
//     // Return the promise which will return results once completed
//     return Promise.all([studyInfo, studyCounts]).then((values) => {
//         console.log("combining results")
//         // combine results and return them
//         const studyInfo = values[0];
//         const studyCounts = values[1]
//         const studyDict: StudyCardTypes.StudyDict = {};
//         studyInfo.rows.map((e, i) => {
//             const studyInfo: StudyCardTypes.StaticStudyInfo = {}
//             const studyName = e.study_accession;
//             studyDict[studyName] = studyInfo;
//             studyDict[studyName] = { ...e }
//         })
//         // console.log(studyCounts)
//         studyCounts.axes[1].positions.map((e, i) => {
//             const studyName = e[0].name;
//             const totalParticipantCount = studyCounts.cells[i][0].value;
//             if (studyDict.hasOwnProperty(studyName)) {
//                 studyDict[studyName] = { totalParticipantCount, ...studyDict[studyName] }
//                 studyDict[studyName].heatmapData = studyCounts.axes[0].positions.map((f, j) => {
//                     // if (j > 0) {
//                     const positionInfo = dataAssayNameToInfo(f[0].uniqueName, true)
//                     const positionCount = studyCounts.cells[i][j].value;
//                     const heatmapDatum: HeatmapDatum = { ...positionInfo, count: positionCount };
//                     return heatmapDatum
//                     // }

//                 })
//             }
//         })


//         return studyDict
//     })

// }
//console.log(studyDict)
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
