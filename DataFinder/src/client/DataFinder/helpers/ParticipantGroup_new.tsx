// Functions for manipulating the selected participant group, and interfacing with 
// the sessionParticipantGroup api

import { SelectedFilters, GroupInfo, SelectedFilter, ISelectedFilters, TotalCounts } from "../../typings/CubeData";
import ParticipantGroupAPI, { ParticipantGroup } from '../../typings/ParticipantGroup'
import { List } from "immutable";
import { StudyParticipantCount, IStudyInfo } from "../../typings/StudyCard";
import { GroupSummary } from "../components/Banner";

const participantGroupAPI: ParticipantGroupAPI = LABKEY.Study.ParticipantGroup

// TODO:
// get list of available participant groups
export const getAvailableGroups = () => {
    console.log("getAvailableGroups")
    return new Promise<ParticipantGroup[]>((resolve, reject) => {
        participantGroupAPI.browseParticipantGroups({
            distinctCategories: false,
            success: (res) => {
                const data: ParticipantGroup[] =  JSON.parse(res.responseText).groups
                resolve(data)
            },
            failure: (res, options) => {
                console.log("An error occured trying to get available participant groups ", res.responseText)
                reject()
            }
        })
    })
}

export const getGroupInfoById = (groupId: number) => {
    return new Promise<ParticipantGroup>((resolve, reject) => {
        participantGroupAPI.getParticipantGroup({
            groupId: groupId,
            success: (res) => {
                const data: ParticipantGroup = JSON.parse(res.responseText).groups[0]
                resolve(data)
            },
            failure: (res, options) => {
                console.log("An error occured trying to load participant group ", res.responseText)
                reject()
            }
        })
    })
}

export const getSessionParticipantGroup = () => {
    return new Promise<ParticipantGroup>((resolve, reject) => {
        participantGroupAPI.getSessionParticipantGroup({
            success: (res) => {
                const response = JSON.parse(res.responseText)
                if (response.data === undefined) resolve(response)
                const data: ParticipantGroup = response.data
                resolve(data)
            },
            failure: (res, options) => {
                console.log("An error occured trying to get the session participant group, ", res.responseText)
                reject()
            }
        })
    })
}

// update participant group
export const updateParticipantGroup = (groupId: number, groupInfo: ParticipantGroup) => {
    const groupData = {
        label: groupInfo.label,
        participantIds: groupInfo.participantIds,
        categoryLabel: "",
        categoryType: "",
        filters: groupInfo.filters,
        rowId: groupId
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
                reject()
            }
        });
    })
}

export const setSessionParticipantIds = (participantIds: string[], filters: SelectedFilters, groupSummary: GroupSummary, counts: TotalCounts ) => {
    return new Promise<void>((resolve, reject) => {
        const description = {summary: groupSummary.toJS(), counts: counts.toJS()}
        participantGroupAPI.setSessionParticipantGroup({
            participantIds: participantIds,
            filters: JSON.stringify(filters.toJS()),
            description: JSON.stringify(description),
            success: () => resolve(),
            failure: (res, options) => {
                console.log("An error occured trying to set session participant group: ", res.responseText);
                reject()
            }
        })
    })
}

export const setSessionParticipantGroup = (groupId: number) => {
    return new Promise<boolean>((resolve, reject) => {
        participantGroupAPI.setSessionParticipantGroup({
            groupId: groupId,
            success: (res) => {
                const resText = JSON.parse(res.responseText);
                if (resText.success) resolve(true)
                reject()
            },
            failure: (res, options) => {
                LABKEY.Utils.displayAjaxErrorResponse(res, options, false, "An error occurred trying to set participant group:  ");
                reject()
            }
        })
    })
}

export const clearSessionParticipantGroup = () => {
    return new Promise<void>((resolve, reject) => {
        participantGroupAPI.clearSessionParticipantGroup({
            success: () => {resolve(); return(null);},
            failure: () => {reject(); return(null);}
        })
    })
}



// ------------------------------------------------- //

export const createAvailableGroups = (data: ParticipantGroup[]) => {
        var groups: GroupInfo[] = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].filters !== undefined) {
                var groupFilters = JSON.parse(data[i].filters);

                // remove duplicates from the filters members array
                // Object.keys(groupFilters).forEach((key) => {
                // if (groupFilters[key].isArray) {
                //     groupFilters[key].members = Ext4.Array.unique(value.members);
                // }

                groups.push({
                    "id": data[i].id,
                    "label": data[i].label,
                    "selected": false,
                    "filters": groupFilters
                });
            }
        }
    return groups;
}


// load participant group
export const getParticipantGroupFilters = (filters: any) => {
    let sf: any
    let isSaved = true
    sf = new SelectedFilters()
    let dim: string;
    if (filters.Data) {
        sf = new SelectedFilters(filters)
    } else {
        isSaved = false
        const missingDimensions = []
        // convert from old filters and warn user
        Object.keys(filters).forEach((level) => {
            const members = filters[level].members.map((uniqueName) => {
                return (uniqueName.split("].[")[1].replace(/[\[\]]/g, ""))
            })
            if (["Age", "Gender", "Race"].indexOf(level) > -1) {
                sf = sf.setIn(["Subject", level], new SelectedFilter({ members: members }))
            } else if (["Study", "ResearchFocus", "Condition", "ExposureMaterial", "ExposureProcess", "Species"].indexOf(level) > -1) {
                sf = sf.setIn(["Study", level], new SelectedFilter({ members: members }))
            } else if (level == "Assay") {
                sf = sf.setIn(["Data", "Assay", "Assay"], new SelectedFilter({ members: members, operator: filters[level].operator }))
            } else if (level == "Timepoint") {
                sf = sf.setIn(["Data", "Timepoint"], new SelectedFilter({ members: members, operator: filters[level].operator }))
            } else if (level == "SampleType") {
                sf = sf.setIn(["Data", "SampleType", "SampleType"], new SelectedFilter({ members: members, operator: filters[level].operator }))
            } else if (level == "Category") {
                sf = sf.setIn(["Study", "ResearchFocus"], new SelectedFilter({ members: members }))
            } else {
                missingDimensions.push(filters[level].name)
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
    return ({sf, isSaved});
}


// update container filter

export const updateContainerFilter = (studyParticipantCounts: {[index: string]: number}, studyInfoArray: IStudyInfo[]) => {
    const containers = []
    studyInfoArray.forEach((studyInfo) => {
        if (studyParticipantCounts[studyInfo.study_accession] > 0) {
            containers.push(studyInfo.container_id)
        }
    })

    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL('study-shared', 'sharedStudyContainerFilter.api'),
        method: 'POST',
        jsonData: { containers: containers }
    });
}

export const goToSend = (groupId) => {
    console.log("Going to send!")
    if (groupId == null) { console.log("null group: can't send") } else {
        window.location = LABKEY.ActionURL.buildURL('study', 'sendParticipantGroup', null, {
            rowId: groupId,
            returnUrl: LABKEY.ActionURL.buildURL('project', 'begin')
        });
    }
}


export const updateSessionGroupById = (studyParticipantCounts: {[index: string]: number}, groupId: number, studyInfoArray) => {
    setSessionParticipantGroup(groupId)
    updateContainerFilter(studyParticipantCounts, studyInfoArray)
}
export const updateSessionGroup = (
  pids: string[],
  studyParticipantCounts: {[index: string]: number},
  filters: SelectedFilters,
  summary: GroupSummary,
  totalCounts: TotalCounts,
  studyInfoArray
) => {
  setSessionParticipantIds(pids, filters, summary, totalCounts);
  if (studyInfoArray) {
    updateContainerFilter(studyParticipantCounts, studyInfoArray);
  }
};


// export const loadGroupFilters = (filters: SelectedFilters | {
//     [index: string]: {
//         members: string[];
//         name: string;
//         operator: string
//     }}) => {
//         if filters
//     }