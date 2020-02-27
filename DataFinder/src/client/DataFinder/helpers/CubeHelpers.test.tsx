import * as CubeHelpers from './CubeHelpers'
import { mdx, LABKEY } from '../../tests/helpers'
import { SelectedFilters } from '../../typings/CubeData'
import * as tc_Study from '../../tests/data/cubeResponse_getTotalCounts_Study.json'
import * as tc_Subject from '../../tests/data/cubeResponse_getTotalCounts_Subject.json'

describe('Get Data', () => {
    const filters = new SelectedFilters()
    test("getStudyCounts", () => {
        return CubeHelpers.getStudyCounts(mdx, filters).then(cs => {
            expect(cs).toBe("getStudyCounts cellSet")
        })
    })
    test("getStudyParticipantCounts", () => {
        return CubeHelpers.getStudyParticipantCounts(mdx, filters).then(cs => {
            expect(cs).toBe("getStudyParticipantCounts cellSet")
        })
    })
    test("getCubeData - Study", () => {
        return CubeHelpers.getCubeData(mdx, filters, "[Study].[Name]").then(cs => {
            expect(cs).toBe("getCubeData_Study cellSet")
        })
    })
    test("getCubeData - Subject", () => {
        return CubeHelpers.getCubeData(mdx, filters, "[Subject].[Subject]").then(cs => {
            expect(cs).toBe("getCubeData_Subject cellSet")
        })
    })
    test("getTotalCounts - Study", () => {
        return CubeHelpers.getTotalCounts(mdx, filters, "[Study].[Name]").then(cs => {
            expect(cs).toBe("getTotalCounts_Study cellSet")
        })
    })
    test("getTotalCounts - Subject", () => {
        return CubeHelpers.getTotalCounts(mdx, filters, "[Subject].[Subject]").then(cs => {
            expect(cs).toBe("getTotalCounts_Subject cellSet")
        })
    })
    test("getFilterCategories", () => {
        return CubeHelpers.getFilterCategories(LABKEY).then(res => {
            expect(res).toBe("dataFinder_dropdownCategories")
        })
    })
    test("getStudyInfo", () => {
        return CubeHelpers.getStudyInfo(LABKEY).then(res => {
            expect(res).toBe("dataFinder_studyCard")
        })
    })

});

describe("Create Data", () => {
    test("createTotalCounts", () => {
        const totalCounts = CubeHelpers.createTotalCounts([tc_Study, tc_Subject])
        expect(typeof(totalCounts)).toBe("object")
        expect(Object.keys(totalCounts)).toEqual(["study", "participant"])
        expect(typeof(totalCounts.participant)).toBe("number")
        expect(totalCounts.participant).toEqual(95)
    })
})