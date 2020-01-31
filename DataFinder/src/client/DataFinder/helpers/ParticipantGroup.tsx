// Functions for manipulating the selected participant group, and interfacing with 
// the sessionParticipantGroup api

import { SelectedFilters, GroupInfo } from "../../typings/CubeData";
import { local } from "d3";
import { List, fromJS } from "immutable";
import { createStudyParticipantCounts } from "./CubeHelpers";
import { StudyParticipantCount, StudyDict, IStudyParticipantCount } from "../../typings/StudyCard";

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
    return groups;
}


// load participant group
export const getParticipantGroupFilters = (groupInfo: GroupInfo) => {

    console.log("loadParticipantGroup(" + groupInfo.label + ")")
    let sf: any
    sf = new SelectedFilters()
    let dim: string;
    // set local storage
    if (groupInfo.filters.Data) {
        sf = new SelectedFilters(fromJS(groupInfo.filters))
    } else {
        console.log("--------- OLD FILTERS ------")
        const missingDimensions = []
        // convert from old filters and warn user
        Object.keys(groupInfo.filters).forEach((level) => {
            const andMembers = groupInfo.filters[level].members.map((uniqueName) => {
                return ([uniqueName.split("].[")[1].replace(/[\[\]]/g, "")])
            })
            const orMembers = [groupInfo.filters[level].members.map((uniqueName) => {
                return (uniqueName.split("].[")[1].replace(/[\[\]]/g, ""))
            })]
            if (["Age", "Gender", "Race", "ExposureMaterial", "ExposureProcess", "Species"].indexOf(level) > -1) {
                sf = sf.setIn(["Subject", level], fromJS(andMembers))
            } else if (["Category", "Condition"].indexOf(level) > -1) {
                sf = sf.setIn(["Study", level], fromJS(andMembers))
            } else if (level == "Assay") {
                const assayMembers = groupInfo.filters[level].operator == "OR" ? orMembers : andMembers
                sf = sf.setIn(["Data", "Assay", "Assay"], fromJS(assayMembers))
            } else if (level == "Timepoint") {
                const timepointMembers = groupInfo.filters[level].operator == "OR" ? orMembers : andMembers
                sf = sf.setIn(["Data", "Timepoint"], fromJS(timepointMembers))
            } else if (level == "SampleType") {
                const sampleTypeMembers = groupInfo.filters[level].operator == "OR" ? orMembers : andMembers
                sf = sf.setIn(["Data", "SampleType", "SampleType"], fromJS(sampleTypeMembers))
            } else {
                missingDimensions.push(groupInfo.filters[level].name)
            }
        })
        // debugger
        let msg = "Note: Converting filters from old version of Data Finder. Use 'Save' to update this filter.\n\n"
        if (missingDimensions.length > 0) {
            msg += "Additionally: sSome parts of this saved filter can no longer be applied. \n"
            for (const m in missingDimensions) {
                msg += "Filter aspect '" + missingDimensions[m] + "' not found.\n"
            }
        }
        alert(msg)
    }
    return (sf);
}

// save participant group
export const openSaveWindow = (studySubject, pids, appliedFilters, groupLabel = "", goToSendAfterSave = false) => {
    // save the group with applied filters in localStorage

    console.log("saveParticipantGroup()")
    const win = Ext4.create('Study.window.ParticipantGroup', {
        subject: studySubject,
        groupLabel: groupLabel,
        participantIds: pids,
        filters: appliedFilters,
        goToSendAfterSave: goToSendAfterSave
    });
    win.show()

    
    return (win)
}

// update participant group
export const updateParticipantGroup = (pids: string[], appliedFilters: SelectedFilters, groupInfo: GroupInfo) => {
    const groupData = {
        label: groupInfo.label,
        participantIds: pids,
        categoryLabel: "",
        categoryType: "",
        filters: JSON.stringify(appliedFilters),
        rowId: groupInfo.id
    }
    return new Promise((resolve, reject) => {
        LABKEY.Ajax.request({
            url: (LABKEY.ActionURL.buildURL("participant-group", 'updateParticipantGroup.api')),
            method: 'POST',
            jsonData : groupData,
            success : function(response)
            {
                var res = JSON.parse(response.responseText);
                if (res.success) {
                    resolve(true)
                }
            },
            failure : function(response, options)
            {
                LABKEY.Utils.displayAjaxErrorResponse(response, options, false, "An error occurred trying to save:  ");
            }
        });
    })
    
}

export const saveParticipantIdGroupInSession = (participantIds: string[]) => {
    return new Promise((resolve, reject) => {
        LABKEY.Ajax.request({
            method: "POST",
            url: LABKEY.ActionURL.buildURL("participant-group", "sessionParticipantGroup.api"),
            jsonData: {
                participantIds: participantIds
            },
            success: () => { resolve() }
        });
    })

}

// update container filter

export const updateContainerFilter = (studyParticipantCounts: IStudyParticipantCount[], studyDict: StudyDict) => {
    const containers = []
    studyParticipantCounts.forEach((participantCount) => {
        if (participantCount.participantCount > 0 && studyDict[participantCount.studyName]) {
            containers.push(studyDict[participantCount.studyName].container_id)
        }
    })

    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL('study-shared', 'sharedStudyContainerFilter.api'),
        method: 'POST',
        jsonData: { containers: containers }
    });
}

export const goToSend = (groupId) => {
    if (groupId == null) { console.log("null group: can't send") } else {
        window.location = LABKEY.ActionURL.buildURL('study', 'sendParticipantGroup', null, {
            rowId: groupId,
            returnUrl: LABKEY.ActionURL.buildURL('immport', 'dataFinder')
        });
    }
}

// export const loadGroupFilters = (filters: SelectedFilters | {
//     [index: string]: {
//         members: string[];
//         name: string;
//         operator: string
//     }}) => {
//         if filters
//     }