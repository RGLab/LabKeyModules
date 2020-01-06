// NOTE:  This will define what filters look like, include functions
// for translating between the filters passed around in state, and
// filters to send off to a cube query. "toggleFilter" is an important
// function, which takes a filter and "selectedFilters" object, turning
// the specified filter on or off in the "selectedFilters" object, and 
// returning the new "selectedFilters." It is passed down into the various
// filter selector buttons as well as the heatmap. 

import { Filter, SelectedFilters, SelectedFilter, ISelectedFilters } from '../../typings/CubeData'
import { List, Set, Map } from 'immutable';
// toggle filter

const createCubeFilter = (dim: string, filter: Filter) => {
    const level: string[] = [dim, ...filter.level.split(".").map((d) => {return("[" + d + "]")})]
    const label: string[] = [dim, ...filter.member.split(".").map((d) => {return("[" + d + "]")})]

    return({
        level: level.join("."),
        membersQuery: [label.join(".")]
    })
}

export const createCubeFilters = (filters: SelectedFilters) => {
    // TODO:  add filters, join where necessary
    return([{"level": "[Subject].[Subject]","membersQuery": [{"level": "[Subject.Age].[Age]", "members": ["[Subject.Age].[> 70]"]}]}])
}


export const toggleFilter = (dim: string, level: string, member: string, selectedFilters: SelectedFilters) => {
    console.log("toggleFilter()")
    

    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }

    let sf;
    let filters: string[];
    if (selectedFilters.getIn(filterIn) == undefined) {
        sf = selectedFilters.setIn(filterIn, new SelectedFilter({members: List([member])}))
    } else if (selectedFilters.getIn(filterIn).members.includes(member)) {
        sf = selectedFilters.setIn([...filterIn, "members"], List(Set(selectedFilters.getIn([...filterIn, "members"])).subtract([member]) ))
    } else {
        sf = selectedFilters.setIn([...filterIn, "members"], List(Set(selectedFilters.getIn([...filterIn, "members"])).union([member])))
    }

    if (sf.getIn([...filterIn, "members"]).size == 0) {
        // debugger
        sf = sf.deleteIn(filterIn)
    }

    return(sf)
}
