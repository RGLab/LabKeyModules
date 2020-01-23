// NOTE:  This will define what filters look like, include functions
// for translating between the filters passed around in state, and
// filters to send off to a cube query. "toggleFilter" is an important
// function, which takes a filter and "selectedFilters" object, turning
// the specified filter on or off in the "selectedFilters" object, and 
// returning the new "selectedFilters." It is passed down into the various
// filter selector buttons as well as the heatmap. 

import { Filter, SelectedFilters, ISelectedFilters } from '../../typings/CubeData'
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
        subjectFilters = subjectSelectedFilters.map((filterList, level) => {
            const filterLevel = level == "Species" ? "[Study].[Name]" : "[Subject].[Subject]"
            const cubeFilters = {
                level: filterLevel, membersQuery: {
                    level: `[Subject.${level}].[${level}]`,
                    members: filterList.map((memberList) => (`[Subject.${level}].[${memberList.get(0)}]`)).toJS()
                }
            }
            return (cubeFilters)
        }).valueSeq().toJS()
    }
    if (studySelectedFilters.size == 0) {
        studyFilters = []
    } else {
        studyFilters = studySelectedFilters.map((filterList, level) => {
            const cubeFilters = {
                level: "[Subject].[Subject]", membersQuery: {
                    level: `[Study.${level}].[${level}]`,
                    members: filterList.map((memberList) => (`[Study.${level}].[${memberList.get(0)}]`)).toJS()
                }
            }
            return (cubeFilters)
        }).valueSeq().toJS()
    }
    if (dataSelectedFilters.size == 0) {
        dataFilters = []
    } else {
        dataFilters = dataSelectedFilters.map((filterListOrMap: any, hierarchy) => {
            if (hierarchy == "Assay" || hierarchy == "SampleType") {
                // debugger
                const hierarchyFilters = filterListOrMap.map((filterList: List<List<string>>, level: string) => {
                    const cubeFilters = filterList.map((memberList) => {
                        const cubeFilter = {
                            level: "[Subject].[Subject]", membersQuery: {
                                level: `[Data.${hierarchy}].[${level}]`,
                                members: memberList.map(m => ("[Data." + hierarchy + "].[" + m.split(".").join("].[") + "]")).toJS()
                            }
                        }
                        return (cubeFilter)
                    })
                    return (cubeFilters).toJS()
                })
                return (hierarchyFilters.valueSeq())
            } else if (hierarchy == "Timepoint") {
                const cubeFilters = filterListOrMap.map((memberList: List<string>) => {
                    const cubeFilter = {
                        level: "[Subject].[Subject]",
                        membersQuery: {
                            level: "[Data.Timepoint].[Timepoint]",
                            members: memberList.map(m => (`[Data.Timepoint].[${m}]`))
                        }
                    }
                    return (cubeFilter)
                })
                return (cubeFilters)
            }
        }).valueSeq().toJS()
    }
    // debugger
    return [...subjectFilters, ...studyFilters, ...dataFilters.flat(2)]
}



export const toggleFilter = (dim: string, level: string, member: string, selectedFilters: SelectedFilters) => {
    console.log("toggleFilter()")
    // debugger

    let filterIn: string[];
    if (/\./.test(level)) {
        const l = level.split(".")
        filterIn = [dim, l[0], l[1]]
    } else {
        filterIn = [dim, level]
    }

    let f: List<List<string>>;
    let sf;
    const filters = selectedFilters.getIn(filterIn)
    if (filters == undefined) {
        f = fromJS([[member]])
    } else {
        let indices: number[] = [undefined, undefined]
        filters.forEach((e, i) => {
            if (e.includes(member)) {
                indices[0] = i
                e.forEach((g, j) => {
                    if (g == member) indices[1] = j
                })
            }
        })
        if (indices[0] != undefined) {
            f = filters.removeIn(indices)
            if (f.get(indices[0]).size == 0) f = f.remove(indices[0])
        } else {
            f = filters.push(fromJS([member]))
        }
    }
    sf = selectedFilters.setIn(filterIn, f)
    // if (sf.getIn(filterIn).size > 1) sf = connectFilters(dim, level, sf.getIn([...filterIn, 0, 0]), sf.getIn([...filterIn, 1, 0]), sf)

    if (sf.getIn(filterIn).size == 0) {
        // debugger
        sf = sf.deleteIn(filterIn)
    }

    return (sf)
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
