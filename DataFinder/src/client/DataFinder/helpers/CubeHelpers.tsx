import { CubeMdx } from "../../typings/Cube";
import * as LABKEY from '@labkey/api';
import { SelectedFilters, CubeData } from "../../typings/CubeData";
import { values } from "d3";
import * as Cube from '../../typings/Cube'
import { HeatmapDatum } from '../../typings/CubeData'
import { createCubeFilters } from './SelectedFilters'
import * as StudyCardTypes from '../../typings/StudyCard'
import { StudyParticipantCount } from '../../typings/StudyCard'

// Create appropriate queries from SelectedFilters to create appropriate filters for cube request


export const createStudyDict = (mdx: CubeMdx, filters: SelectedFilters) => {
    const studyDict = new Promise<StudyCardTypes.StudyDict>((resolve, reject) => {
        const si1: StudyCardTypes.StaticStudyInfo = {
            assays: ["HAI", "GE"],
            brief_title: "Very Important Study",
            condition_studied: "influenza",
            sample_type: ["PBMC"],
            heatmapData: [{assay: "HAI", timepoint: "4", count: 15},
                          {assay: "HAI", timepoint: "2", count: 30}],
            pi_names: ["Helen Miller"],
            program_title: "Program 1",
            restricted: false,
            study_accession: "SDY269",
            totalParticipantCount: 100
        }
        const si2: StudyCardTypes.StaticStudyInfo = {
            assays: ["HAI", "GE"],
            brief_title: "Very Important Study",
            condition_studied: "influenza",
            sample_type: ["PBMC"],
            heatmapData: [{assay: "HAI", timepoint: "4", count: 15},
                          {assay: "HAI", timepoint: "2", count: 30}],
            pi_names: ["Helen Miller"],
            program_title: "Program 1",
            restricted: false,
            study_accession: "SDY28",
            totalParticipantCount: 40
        }
        resolve(
            {SDY269: si1,
             SDY28: si2}
        )
    })
    return studyDict
}


// Create StudyDict
const createStudyDict_old = (mdx: CubeMdx, filters: SelectedFilters) => {
    console.log("creating study dict")
    const cubeFilters = createCubeFilters(filters);

    // define a promise to get info from query
    const studyInfo = new Promise<SelectRowsResponse>((resolve, reject) => {
        LABKEY.Query.selectRows({
            schemaName: 'immport',
            queryName: 'dataFinder_studyCard',
            success: (data: SelectRowsResponse) => { resolve(data) }
        })
    })

    // Define a promise to get study counts
    const studyCounts = new Promise<Cube.CellSet>((resolve, reject) => {
        console.log("getting study counts")
        console.log(mdx)
        console.log(cubeFilters)
        mdx.query({
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs: Cube.CellSet, mdx, config) {
                console.log("got study counts")
                resolve(cs);
            },
            name: 'DataFinderCube',
            onRows: { level: "[Study].[Name]", members: ["members"] },
            onCols: {
                operator: "UNION",
                arguments: [
                    { level: "[Subject].[(All)]", members: ["members"] },
                    { level: "[Data.Assay].[Timepoint]", members: ["members"] }
                ]
            },
            countFilter: cubeFilters,
            countDistinctLevel: "[Subject].[Subject]",
            showEmpty: false

        })
    })

    // combine results after they have all been loaded
    // Return the promise which will return results once completed
    return Promise.all([studyInfo, studyCounts]).then((values) => {
        console.log("combining results")
        // combine results and return them
        const studyInfo = values[0];
        const studyCounts = values[1]
        const studyDict: StudyCardTypes.StudyDict = {};
        studyInfo.rows.map((e, i) => {
            const studyInfo: StudyCardTypes.StaticStudyInfo = {}
            const studyName = e.study_accession;
            studyDict[studyName] = studyInfo;
            studyDict[studyName] = { ...e }
        })
        // console.log(studyCounts)
        studyCounts.axes[1].positions.map((e, i) => {
            const studyName = e[0].name;
            const totalParticipantCount = studyCounts.cells[i][0].value;
            if (studyDict.hasOwnProperty(studyName)) {
                studyDict[studyName] = { totalParticipantCount, ...studyDict[studyName] }
                studyDict[studyName].heatmapData = studyCounts.axes[0].positions.map((f, j) => {
                    // if (j > 0) {
                    const positionInfo = dataAssayNameToInfo(f[0].uniqueName, true)
                    const positionCount = studyCounts.cells[i][j].value;
                    const heatmapDatum: HeatmapDatum = { ...positionInfo, count: positionCount };
                    return heatmapDatum
                    // }

                })
            }
        })


        return studyDict
    })
    
}
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

// Update StudyParticipantCounts from Cube response
export const getStudyParticipantCounts = (mdx: CubeMdx, filters: SelectedFilters) => {
    const spc: StudyParticipantCount[] = [
        { studyName: "SDY269", participantCount: 98 },
        { studyName: "SDY28", participantCount: 1 }]
    return (spc)
}

// Create CubeData object from cube response
export const createCubeData = (mdx: CubeMdx, filters: SelectedFilters) => {
    const cd: CubeData = {
        subject: {
            race: [],
            age: [{ label: "0-10", value: 15 },
            { label: "11-20", value: 86 }],
            gender: []
        },
        study: {
            name: [],
            program: [],
            condition: [],
            species: [{ label: "Homo Sapiens", value: 90 },
            { label: "Mus Musculus", value: 7 }],
            exposureMaterial: [],
            exposureProcess: []
        },
        data: {
            assay: {
                assay: [],
                timepoint: [],
                sampleType: []
            },
            timepoint: [],
            sampleType: []
        }
    }
    return (
        cd
    )
}