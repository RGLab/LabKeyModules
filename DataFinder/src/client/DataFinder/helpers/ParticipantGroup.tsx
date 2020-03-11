// Functions for manipulating the selected participant group, and interfacing with 
// the sessionParticipantGroup api

import { SelectedFilters, GroupInfo, SelectedFilter, ISelectedFilters } from "../../typings/CubeData";
import { List } from "immutable";
import { StudyParticipantCount, StudyDict} from "../../typings/StudyCard";

// TODO:
// get list of available participant groups
export const getAvailableGroups = () => {
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
        var groups: GroupInfo[] = [];
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
    let sf: any
    sf = new SelectedFilters()
    let dim: string;
    if (groupInfo.filters.Data) {
        const filters: ISelectedFilters = groupInfo.filters
        sf = new SelectedFilters(filters)
    } else {
        const missingDimensions = []
        // convert from old filters and warn user
        Object.keys(groupInfo.filters).forEach((level) => {
            const members = groupInfo.filters[level].members.map((uniqueName) => {
                return (uniqueName.split("].[")[1].replace(/[\[\]]/g, ""))
            })
            if (["Age", "Gender", "Race"].indexOf(level) > -1) {
                sf = sf.setIn(["Subject", level], new SelectedFilter({ members: members }))
            } else if (["Study", "ResearchFocus", "Condition", "ExposureMaterial", "ExposureProcess", "Species"].indexOf(level) > -1) {
                sf = sf.setIn(["Study", level], new SelectedFilter({ members: members }))
            } else if (level == "Assay") {
                sf = sf.setIn(["Data", "Assay", "Assay"], new SelectedFilter({ members: members, operator: groupInfo.filters[level].operator }))
            } else if (level == "Timepoint") {
                sf = sf.setIn(["Data", "Timepoint"], new SelectedFilter({ members: members, operator: groupInfo.filters[level].operator }))
            } else if (level == "SampleType") {
                sf = sf.setIn(["Data", "SampleType", "SampleType"], new SelectedFilter({ members: members, operator: groupInfo.filters[level].operator }))
            } else if (level == "Category") {
                sf = sf.setIn(["Study", "ResearchFocus"], new SelectedFilter({members: members}))
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
            jsonData: groupData,
            success: function (response) {
                var res = JSON.parse(response.responseText);
                if (res.success) {
                    resolve(true)
                }
            },
            failure: function (response, options) {
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

export const updateContainerFilter = (studyParticipantCounts: List<StudyParticipantCount>, studyDict: StudyDict) => {
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
            returnUrl: LABKEY.ActionURL.buildURL('project', 'begin')
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