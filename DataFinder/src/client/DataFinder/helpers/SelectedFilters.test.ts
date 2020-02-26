import * as React from 'react'
import * as sf from './SelectedFilters'
import { SelectedFilters, SelectedFilter } from '../../typings/CubeData';
import { List, Map } from 'immutable'

describe('Manipulate Selected Filters', () => {

   test("createCubeFilters", () => {
       const oldFilters = new SelectedFilters()
       const newFilters = new SelectedFilters({Data: {Timepoint: new SelectedFilter({members:  List(["1"]), operator: "OR"})}})
       const output = sf.toggleFilter("Data", "Timepoint", "1", oldFilters)
       expect(output).toEqual(newFilters)
   })

});