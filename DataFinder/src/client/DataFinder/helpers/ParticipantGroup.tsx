// Functions for manipulating the selected participant group, and interfacing with 
// the sessionParticipantGroup api

import { SelectedFilters } from "../../typings/CubeData";

// TODO:
// get list of available participant groups
export const getAvailableGroups = () => {
    
    console.log("getAvailableGroups()")
    return [];
}

// load participant group
export const loadParticipantGroup = (groupName: string) => {
    // get participant group info
    // set local storage
    // set selected participants
    
    console.log("loadParticipantGroup(" + groupName + ")")
    return(true);
}

// save participant group
export const saveParticipantGroup = (groupName: string) => {
    // save the group with applied filters in localStorage

    console.log("saveParticipantGroup(" + groupName + ")")
    return(true)
}
