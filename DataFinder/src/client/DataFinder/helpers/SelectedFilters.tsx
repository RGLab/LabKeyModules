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

const createCubeFilter = (dim: string, filter: Filter) => {
    const level: string[] = [dim, ...filter.level.split(".").map((d) => { return ("[" + d + "]") })]
    const label: string[] = [dim, ...filter.member.split(".").map((d) => { return ("[" + d + "]") })]

    return ({
        level: level.join("."),
        membersQuery: [label.join(".")]
    })
}

export const createCubeFilters = (filters: SelectedFilters) => {
    // TODO:  add filters, join where necessary
    return ([{ "level": "[Subject].[Subject]", "membersQuery": [{ "level": "[Subject.Age].[Age]", "members": ["[Subject.Age].[> 70]"] }] }])
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
