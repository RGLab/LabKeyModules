import * as React from 'react'
import * as sf from './SelectedFilters'
import { SelectedFilters, SelectedFilter } from '../../typings/CubeData';
import { List, Map } from 'immutable'

describe('Manipulate Selected Filters', () => {

    test("ToggleFilters", () => {
        const oldFilters = new SelectedFilters()
        const newFilters1 = new SelectedFilters({ Data: { Timepoint: new SelectedFilter({ members: List(["1"]), operator: "OR" }) } })
        const newFilters2 = new SelectedFilters({ Data: { Timepoint: new SelectedFilter({ members: List(["1", "2"]), operator: "OR" }) } })
        const newFilters3 = new SelectedFilters({ Data: { Assay: { Timepoint: new SelectedFilter({ members: List(["HAI.0"]), operator: "OR" }) } } })
        const newFilters4 = new SelectedFilters({ Subject: { Age: new SelectedFilter({ members: List(["0-10"]), operator: "OR" }) } })
        const newFilters5 = new SelectedFilters({
            Subject: { Age: new SelectedFilter({ members: List(["0-10"]), operator: "OR" }) },
            Data: { Timepoint: new SelectedFilter({ members: List(["1"]), operator: "OR" }) }
        })


        expect(sf.toggleFilter("Data", "Timepoint", "1", oldFilters)).toEqual(newFilters1)
        expect(sf.toggleFilter("Data", "Timepoint", "2", newFilters1)).toEqual(newFilters2)
        expect(sf.toggleFilter("Data", "Timepoint", "1", newFilters1)).toEqual(oldFilters)

        expect(sf.toggleFilter("Data", "Assay.Timepoint", "HAI.0", oldFilters)).toEqual(newFilters3)

        expect(sf.toggleFilter("Subject", "Age", "0-10", oldFilters)).toEqual(newFilters4)
        expect(sf.toggleFilter("Subject", "Age", "0-10", newFilters1)).toEqual(newFilters5)
        expect(sf.toggleFilter("Subject", "Age", "0-10", newFilters5)).toEqual(newFilters1)

    })

    test("ToggleAndOr", () => {
        const filtersAnd = new SelectedFilters({ Data: { Timepoint: new SelectedFilter({ members: List(["1", "2"]), operator: "AND" }) } })
        const filtersOr = new SelectedFilters({ Data: { Timepoint: new SelectedFilter({ members: List(["1", "2"]), operator: "OR" }) } })
        expect(sf.toggleAndOr("Data","Timepoint", filtersAnd)).toEqual(filtersOr)
        expect(sf.toggleAndOr("Data", "Timepoint", filtersOr)).toEqual(filtersAnd)

    })

});