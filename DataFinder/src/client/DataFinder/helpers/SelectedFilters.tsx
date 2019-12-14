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

const createFilterKey = (filter: Filter) => {
    return([filter.dim, filter.level].join("."))
}

export const toggleFilter = (filter: Filter, selectedFilters: SelectedFilters) => {
    const filterKey = createFilterKey(filter)
    if (selectedFilters[filterKey] == undefined) {selectedFilters[filterKey] = {members: [], operator: "OR"}}
    const filterIndex = selectedFilters[filterKey].members.indexOf(filter)
    if (filterIndex > -1) {
        selectedFilters[filterKey].members.push(filter)
    } else {
        selectedFilters[filterKey].members.splice(filterIndex, 1)
    }
}
