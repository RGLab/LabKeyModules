// NOTE:  This will define what filters look like, include functions
// for translating between the filters passed around in state, and
// filters to send off to a cube query. "toggleFilter" is an important
// function, which takes a filter and "selectedFilters" object, turning
// the specified filter on or off in the "selectedFilters" object, and 
// returning the new "selectedFilters." It is passed down into the various
// filter selector buttons as well as the heatmap. 

import { Filter, SelectedFilters, ISelectedFilters, SelectedFilter } from '../../typings/CubeData'
import { List, Set, Map, fromJS } from 'immutable';
// toggle filter

interface CubeFilter {
    level: string;
    membersQuery: {
        level: string;
        members: string[] | string;
    }
}

export const createCubeFilters = (filters: SelectedFilters) => {
    // Subject

    const subjectSelectedFilters = filters.Subject
    const studySelectedFilters = filters.Study
    const dataSelectedFilters = filters.Data
    let subjectFilters, studyFilters, dataFilters
    if (subjectSelectedFilters.size == 0) {
        subjectFilters = []
    } else {
        // if (subjectSelectedFilters.get("Age").size > 2) debugger
        subjectFilters = subjectSelectedFilters.map((selectedFilter, level) => {
            const cubeFilters = {
                level: "[Subject].[Subject]", membersQuery: {
                    level: `[Subject.${level}].[${level}]`,
                    members: selectedFilter.members.map((member) => (`[Subject.${level}].[${member}]`))
                }
            }
            return (cubeFilters)
        }).valueSeq().toJS()
    }
    if (studySelectedFilters.size == 0) {
        studyFilters = []
    } else {
        studyFilters = studySelectedFilters.map((selectedFilter, level) => {
            const realDim = ["ExposureProcess", "ExposureMaterial", "Species"].indexOf(level) > -1 ? "Subject" : "Study"
            const cubeFilters = {
                level: "[Subject].[Subject]", membersQuery: {
                    level: `[${realDim}.${level}].[${level}]`,
                    members: selectedFilter.members.map((member) => (`[${realDim}.${level}].[${member}]`))
                }
            }
            return (cubeFilters)
        }).valueSeq().toJS()
    }
    if (dataSelectedFilters.size == 0) {
        dataFilters = []
    } else {
        dataFilters = dataSelectedFilters.map((selectedFiltersOrMap: any, hierarchy) => {
            if (hierarchy == "Assay" || hierarchy == "SampleType") {
                const hierarchyFilters = selectedFiltersOrMap.map((selectedFilter: SelectedFilter, level: string) => {
                    if (selectedFilter.operator == "OR") {
                        return ({
                            level: "[Subject].[Subject]", membersQuery: {
                                level: `[Data.${hierarchy}].[${level}]`,
                                members: selectedFilter.members.map(m => ("[Data." + hierarchy + "].[" + m.split(".").join("].[") + "]")).toJS()
                            }
                        })
                    } else {
                        return (
                            selectedFilter.members.map((member) => {
                                return ({
                                    level: "[Subject].[Subject]", membersQuery: {
                                        level: `[Data.${hierarchy}].[${level}]`,
                                        members: "[Data." + hierarchy + "].[" + member.split(".").join("].[") + "]"
                                    }
                                })
                            }).toJS()
                        )
                    }
                })
                return (hierarchyFilters.valueSeq())
            } else if (hierarchy == "Timepoint") {
                const selectedFilter = selectedFiltersOrMap
                if (selectedFilter.operator == "OR") {
                    return ({
                        level: "[Subject].[Subject]", membersQuery: {
                            level: `[Data.Timepoint].[Timepoint]`,
                            members: selectedFilter.members.map(member => ("[Data.Timepoint].[" + member + "]")).toJS()
                        }
                    })
                } else {
                    return (
                        selectedFilter.members.map((member) => {
                            return ({
                                level: "[Subject].[Subject]", membersQuery: {
                                    level: `[Data.Timepoint].[Timepoint]`,
                                    members: "[Data.Timepoint].[" + member + "]"
                                }
                            })
                        }).toJS()
                    )
                }
            }
        }).valueSeq().toJS()
            .reduce((acc, val) => acc.concat(val), []) // Use this instead of flat() because flat() for some reason doesn't work while testing
    }
    return [...subjectFilters, ...studyFilters, ...dataFilters]
}



export const toggleFilter = (dim: string, level: string, member: string, selectedFilters: SelectedFilters) => {

    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }

    let f: any;
    let sf;
    const filters: SelectedFilter = selectedFilters.getIn(filterIn)
    if (filters == undefined) {
        f = new SelectedFilter({ members: [member] })
    } else {
        if (filters.members.includes(member)) {
            f = filters.removeIn(["members", filters.members.indexOf(member)])
        } else {
            f = filters.set("members", filters.members.push(member))
        }
    }

    // if (sf.getIn(filterIn).size > 1) sf = connectFilters(dim, level, sf.getIn([...filterIn, 0, 0]), sf.getIn([...filterIn, 1, 0]), sf)

    if (f.members.size == 0) {
        sf = selectedFilters.deleteIn(filterIn)
    } else {
        sf = selectedFilters.setIn(filterIn, f)
    }
    return (sf)
}

export const toggleAndOr = (dim: string, level: string, selectedFilters: SelectedFilters) => {
    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }

    if (selectedFilters.getIn(filterIn) == undefined) return (selectedFilters)

    if (selectedFilters.getIn([...filterIn, "operator"]) == "AND") {
        const sf = selectedFilters.setIn([...filterIn, "operator"], "OR")
        return (new SelectedFilters(sf.toJS()))
    } else {
        const sf = selectedFilters.setIn([...filterIn, "operator"], "AND")
        return (new SelectedFilters(sf.toJS()))
    }
}

export const setAndOr = (dim: string, level: string, value: string, selectedFilters: SelectedFilters) => {
    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }
    if (selectedFilters.getIn(filterIn) == undefined) return (selectedFilters)
    if (selectedFilters.getIn([...filterIn, "operator"]) == value) return (selectedFilters)
    const sf = selectedFilters.setIn([...filterIn, "operator"], value)
    return (new SelectedFilters(sf.toJS()))
}

