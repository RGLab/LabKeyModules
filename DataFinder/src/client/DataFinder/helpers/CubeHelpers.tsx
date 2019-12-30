// NOTE: 
// While experimenting with immutable and typings, I found that I couldn't
// return an immutable object in a typed promise. So I return a regular
// js object, then have an additional function which translates it into the 
// proper immutable object. I'm open to other suggestions. -HM

import { CubeMdx } from "../../typings/Cube";
import * as LABKEY from '@labkey/api';
import { SelectedFilters, CubeData, ICubeData } from "../../typings/CubeData";
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
            heatmapData: [{ assay: "HAI", timepoint: "4", count: 15 },
            { assay: "HAI", timepoint: "2", count: 30 }],
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
            heatmapData: [{ assay: "HAI", timepoint: "4", count: 15 },
            { assay: "HAI", timepoint: "2", count: 30 }],
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

export const getCubeData = (mdx: CubeMdx, filters: SelectedFilters) => {
    console.log("getCubeData()")

    const cubeData = new Promise<ICubeData>((resolve, reject) => {
        const cd: ICubeData = {
            subject: Immutable.fromJS({
                race: [],
                age: [{ label: "0-10", value: 15 },
                { label: "11-20", value: 86 }],
                gender: []
            }),
            study: Immutable.fromJS({
                name: [],
                program: [],
                condition: [],
                species: [{ label: "Homo Sapiens", value: 90 },
                { label: "Mus Musculus", value: 7 }],
                exposureMaterial: [],
                exposureProcess: []
            }),
            data: Immutable.fromJS({
                assay: {
                    assay: [],
                    timepoint: [{ assay: "HAI", timepoint: "0", count: 86 }, { assay: "Gene Expression", timepoint: "8", count: 1408 }],
                    sampleType: []
                },
                timepoint: Immutable.fromJS([]),
                sampleType: Immutable.fromJS([])
            })
        }
        resolve(cd);
    })
    return (cubeData)
}

export const createCubeData = (cubeData: ICubeData) => {
    console.log("createCubeData()")

    return new CubeData(cubeData);

    // return new CubeData(cubeData);
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
