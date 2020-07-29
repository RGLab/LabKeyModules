import * as CubeHelpers from './CubeHelpers'
import { SelectedFilters, StudyData, CubeData } from '../../typings/CubeData'
import { List } from 'immutable';
import { StudyParticipantCount } from '../../typings/StudyCard';
import { retrocycle } from './cycle'

import tc_StudyCs from '../../tests/data/cubeResponse_getTotalCounts_Study.json'
import tc_SubjectCs from '../../tests/data/cubeResponse_getTotalCounts_Subject.json'
import studyInfo from '../../tests/data/selectRowsResponse_dataFinder_studyCard.json'
import studyCountCs from '../../tests/data/cubeResponse_getStudyCounts.json'
import studyParticipantCountsCs from '../../tests/data/cubeResponse_getStudyParticipantCounts.json'
import cubeDataCs_study from '../../tests/data/cubeResponse_getCubeData_Study.json'
import cubeDataCs_subject from '../../tests/data/cubeResponse_getCubeData_Subject.json'
import {initMocks, resetMocks} from "../../tests/mock";

// this uses cycle.js https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
// To read in self-referential objects
retrocycle(tc_StudyCs)
retrocycle(tc_SubjectCs)
retrocycle(studyCountCs)
retrocycle(studyParticipantCountsCs)
retrocycle(cubeDataCs_study)
retrocycle(cubeDataCs_subject)

describe('Get Data', () => {
    const filters = new SelectedFilters()
    const loadedStudiesArray = CubeHelpers.createLoadedStudies(studyInfo)

    test("getStudyInfo mock", () => {
        initMocks();
        return (
            CubeHelpers.getStudyInfo().then(result => {
                expect(JSON.stringify(result)).toBe(JSON.stringify(studyInfo));
            }).catch((error) => {
                fail(error)
            })
        )
        resetMocks();
    });
});

describe("Create Data", () => {
    test("createTotalCounts", () => {
        const totalCounts = CubeHelpers.createTotalCounts([tc_StudyCs, tc_SubjectCs])
        expect(typeof(totalCounts)).toBe("object")
        expect(Object.keys(totalCounts)).toEqual(["study", "participant"])
        expect(typeof(totalCounts.participant)).toBe("number")
        expect(totalCounts.participant).toEqual(95)
    })
    test("createStudyDict", () => {
        const studyDict = CubeHelpers.createStudyDict([studyInfo, studyCountCs])
        expect(typeof(studyDict)).toBe("object")
        expect(studyDict).toHaveProperty("SDY269")
        expect(studyDict).toHaveProperty("SDY269.study_accession", "SDY269")
        expect(studyDict).toHaveProperty(["SDY269", "heatmapInfo","assays"])
        expect(studyDict).toHaveProperty(["SDY269", "heatmapInfo", "data", 0, "participantCount"])
    })
    test("createFilterCategories", () => {
        const categories = CubeHelpers.createFilterCategories(cubeDataCs_subject)
        expect(categories).toHaveProperty("Age")
        expect(categories).toHaveProperty("ExposureMaterial")
        expect(Array.isArray(categories.Age)).toBeTruthy()
        expect(categories).toHaveProperty(["Age", 0, "label"], "0-10")
    })
    test("createStudyParticipantCounts", () => {
        const studyParticipantCounts = CubeHelpers.createStudyParticipantCounts(studyParticipantCountsCs)
        expect(studyParticipantCounts).toHaveProperty("studyParticipantCounts")
        expect(studyParticipantCounts).toHaveProperty("pids")
        expect(Array.isArray(studyParticipantCounts.pids)).toBeTruthy()
        expect(typeof(studyParticipantCounts.pids[0])).toBe("string")
        expect(studyParticipantCounts.pids[0]).toContain("SUB")
        expect(studyParticipantCounts.studyParticipantCounts).toBeInstanceOf(List)
        expect(studyParticipantCounts.studyParticipantCounts.get(0)).toBeInstanceOf(StudyParticipantCount)
    })
    // test("createCubeData", () => {
    //     const subject: any = cubeDataCs_subject
    //     const cd = CubeHelpers.createCubeData([cubeDataCs_study, subject])
    //     expect(cd).toBeInstanceOf(CubeData)
    // })
})