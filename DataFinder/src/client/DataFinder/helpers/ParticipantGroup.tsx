// Functions for manipulating the selected participant group, and interfacing with 
// the sessionParticipantGroup api

import { SelectedFilters } from "../../typings/CubeData";
import { group } from "d3";

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
                // debugger

                // remove duplicates from the filters members array
                Object.keys(groupFilters).forEach((key) => {
                    // if (groupFilters[key].isArray) {
                    //     groupFilters[key].members = Ext4.Array.unique(value.members);
                    // }
                    groups.push({
                        "id": data.groups[i].id,
                        "label": data.groups[i].label,
                        "selected": false,
                        "filters": groupFilters
                    });
                })
            }
        }
    }
    return groups;
}


// load participant group
export const loadParticipantGroup = (groupName: string) => {
    // get participant group info
    // set local storage
    // set selected participants

    console.log("loadParticipantGroup(" + groupName + ")")
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
