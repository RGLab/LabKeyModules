import { Filter, SelectedFilters } from '../../typings/CubeData'
// toggle filter

const createCubeFilter = (filter: Filter) => {
    const dim: string = "[" + filter.dim + "]"
    const level: string[] = [dim, ...filter.level.split(".").map((d) => {return("[" + d + "]")})]
    const label: string[] = [dim, ...filter.label.split(".").map((d) => {return("[" + d + "]")})]

    return({
        level: level.join("."),
        membersQuery: [label.join(".")]
    })
}

export const createCubeFilters = (filters: SelectedFilters) => {
    // TODO:  add filters, join where necessary
    return([{"level": "[Subject].[Subject]","membersQuery": [{"level": "[Subject.Age].[Age]", "members": ["[Subject.Age].[> 70]"]}]}])
}

const createFilterKey = (filter: Filter) => {
    return([filter.dim, filter.level].join("."))
}

export const toggleFilter = (filter: Filter, selectedFilters: SelectedFilters) => {
    const filterKey = createFilterKey(filter)
    if (selectedFilters[filterKey] == undefined) {selectedFilters[filterKey] = {members: [], operator: "OR"}}
    const filterIndex = selectedFilters[filterKey].members.indexOf(filter.label)
    if (filterIndex > -1) {
        selectedFilters[filterKey].members.splice(filterIndex, 1)
        if (selectedFilters[filterKey].members.length == 0) delete selectedFilters[filterKey]
    } else {
        selectedFilters[filterKey].members.push(filter.label)

    }
    return(selectedFilters)
}
