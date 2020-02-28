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
            const filterLevel = level == "Species" ? "[Study].[Name]" : "[Subject].[Subject]"
            const cubeFilters = {
                level: filterLevel, membersQuery: {
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
    }
    // debugger
    return [...subjectFilters, ...studyFilters, ...dataFilters.flat(2)]
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
    console.log("toggleAndOr()")
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
    console.log("setAndOr()")
    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }
    if (selectedFilters.getIn(filterIn) == undefined) return (selectedFilters)
    if (selectedFilters.getIn([...filterIn, "operator"]) == value) return(selectedFilters)
    const sf = selectedFilters.setIn([...filterIn, "operator"], value)
    return (new SelectedFilters(sf.toJS()))
}

export const connectFilters = (dim: string, level: string, member1: string, member2: string, selectedFilters: SelectedFilters) => {
    // Add member1 to the member2 group
    // or remove member1 from the member2 group
    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }
    const filters: List<List<string>> = selectedFilters.getIn(filterIn)
    const indices = [[undefined, undefined], [undefined, undefined]]
    filters.forEach((e, i) => {
        if (e.includes(member1)) {
            indices[0][0] = i
            e.forEach((f, j) => {
                if (f == member1) indices[0][1] = j
            })
        }
        if (e.includes(member2)) {
            indices[1][0] = i
            e.forEach((f, j) => {
                if (f == member2) indices[1][1] = j
            })
        }
    })
    // debugger
    if (indices[0][0] == undefined || indices[0][1] == undefined || !indices[1][0] == undefined || !indices[1][1] == undefined) return
    let f: List<List<string>>
    if (indices[0][0] == indices[1][0]) {
        // remove member1 from the member2 group
        f = filters.removeIn(indices[1])
        f = f.push(fromJS(member1))
        return (f)
    } else {
        // add member1 to the member2 group
        f = filters.removeIn(indices[0])
        f = f.update(indices[1][0], (memberList) => memberList.push(member1))
        if (f.get(indices[0][0]).size == 0) f = f.remove(indices[0][0])
    }
    const sf = selectedFilters.setIn(filterIn, f)
    return sf
}
