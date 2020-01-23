// Functions for manipulating the selected participant group, and interfacing with 
// the sessionParticipantGroup api

import { SelectedFilters, GroupInfo } from "../../typings/CubeData";
import { local } from "d3";
import { List, fromJS } from "immutable";

// TODO:
// get list of available participant groups
export const getAvailableGroups = () => {
    console.log("getAvailableGroups()")
    return new Promise((resolve, reject) => {
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api'),
            method: 'POST',
            jsonData: {
                'distinctCatgories': false,
                'type': 'participantGroup',
                'includeUnassigned': false,
                'includeParticipantIds': false
            },
            success: LABKEY.Utils.getCallbackWrapper((data) => {
                resolve(data)

            })
        })

    })
}
export const createAvailableGroups = (data) => {
    if (data.success) {
        var groups = [];
        for (var i = 0; i < data.groups.length; i++) {
            if (data.groups[i].filters !== undefined) {
                var groupFilters = JSON.parse(data.groups[i].filters);
                console.log(groupFilters)

                // remove duplicates from the filters members array
                // Object.keys(groupFilters).forEach((key) => {
                    // if (groupFilters[key].isArray) {
                    //     groupFilters[key].members = Ext4.Array.unique(value.members);
                    // }

                    groups.push({
                        "id": data.groups[i].id,
                        "label": data.groups[i].label,
                        "selected": false,
                        "filters": groupFilters
                    });
            }
        }
    }
    console.log(groups)
    return groups;
}


// load participant group
export const loadParticipantGroup = (groupInfo: GroupInfo) => {
    let sf: any
    sf = new SelectedFilters()
    let dim: string;
    // set local storage
    if (groupInfo.new) {
        localStorage.setItem("dataFinderSelectedFilters", JSON.stringify(groupInfo.filters))
    } else {
        // convert from old filters and warn user
        Object.keys(groupInfo.filters).forEach((level) => {
            if (["Age", "Gender", "Race"].indexOf(level) != -1) {
                const members = groupInfo.filters[level].members.map((uniqueName) => {
                    return([uniqueName.split(".")[1].replace(/[\[\]]/g, "")])
                })
                sf = sf.setIn(["Subject",level], fromJS(members))
            } else if (["Assay", "Category", "Condition", "SampleType", "Species", "Timepoint"]) {}
        })
    }
    // set selected participants

    console.log("loadParticipantGroup(" + groupInfo.label + ")")
    return (true);
}

// save participant group
export const saveParticipantGroup = (groupName: string) => {
    // save the group with applied filters in localStorage

    console.log("saveParticipantGroup(" + groupName + ")")
    return (true)
}

export const saveParticipantIdGroupInSession = (participantIds: string[]) => {
    return new Promise((resolve, reject) => {
        LABKEY.Ajax.request({
            method: "POST",
            url: LABKEY.ActionURL.buildURL("participant-group", "sessionParticipantGroup.api"),
            jsonData: {
                participantIds: participantIds
            },
            success: ()=>{resolve()}
        });
    })
    
}

// export const loadGroupFilters = (filters: SelectedFilters | {
//     [index: string]: {
//         members: string[];
//         name: string;
//         operator: string
//     }}) => {
//         if filters
//     }