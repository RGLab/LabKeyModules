import * as React from 'react'
import * as CubeHelpers from './CubeHelpers'
import { mdx } from '../../tests/helpers'
import { SelectedFilters } from '../../typings/CubeData'

describe('Create Data', () => {
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

});