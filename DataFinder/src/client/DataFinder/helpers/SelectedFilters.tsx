// NOTE:  This will define what filters look like, include functions
// for translating between the filters passed around in state, and
// filters to send off to a cube query. "toggleFilter" is an important
// function, which takes a filter and "selectedFilters" object, turning
// the specified filter on or off in the "selectedFilters" object, and 
// returning the new "selectedFilters." It is passed down into the various
// filter selector buttons as well as the heatmap. 

import { Filter, SelectedFilters, SelectedFilter, ISelectedFilters } from '../../typings/CubeData'
import { List, Set } from 'immutable';
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
    console.log("toggleFilter")
    // debugger;

    let sf;

    // let newSelectedFilters = new SelectedFilter();
    if (selectedFilters.getIn([dim, level]) == undefined) {
        sf = selectedFilters.setIn([dim, level], new SelectedFilter({members: List([member])}))
    } else if (selectedFilters.getIn([dim, level]).members.includes(member)) {
        sf = selectedFilters.setIn([dim, level, "members"], List(Set(selectedFilters.getIn([dim, level, "members"])).subtract([member]) ))
    } else {
        sf = selectedFilters.setIn([dim, level, "members"], List(Set(selectedFilters.getIn([dim, level, "members"])).union([member]) ))
    }

    if (sf.getIn([dim, level, "members"]).size == 0) {
        sf = sf.deleteIn([dim, level])
    }

    // return(sf)
    return(sf)
}
