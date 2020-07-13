export default interface ParticipantGroupAPI {
    browseParticipantGroups: (config: browseParticipantGroupConfig) => void;
    getParticipantGroup: (config: getParticipantGroupConfig) => void;
    saveParticipantGroup: (config: saveParticipantGroupConfig) => void;
    deleteParticipantGroup: (config: deleteParticipantGroupConfig) => void;
    getSessionParticipantGroup: (config: getSessionParticipantGroupConfig) => void;
    setSessionParticipantGroup: (config: setSessionParticipantGroupConfig) => void;
    clearSessionParticipantGroup: (config: clearSessionParticipantGroupConfig) => void;
}

interface browseParticipantGroupConfig {
    includeParivateGroups?: boolean;
    type?: string;
    includeParticipantIds?: boolean;
    categoryId?: number;
    includeUnassigned?: boolean;
    distinctCategories?: boolean;
    success: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

interface getParticipantGroupConfig {
    groupId: number;
    includeParticipantIds?: boolean;
    success: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

interface saveParticipantGroupConfig {
    groupId: number;
    label: string;
    description?: string;
    filters: string;
    participantIds: string[];
    categoryId?: number;
    categoryLabel?: string;
    categoryType?: string;
    categoryOwnerId?: number;
    success: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

interface deleteParticipantGroupConfig {
    groupId: number;
    success?: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

interface getSessionParticipantGroupConfig {
    success: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

interface setSessionParticipantGroupConfig {
    groupId?: number;
    label?: string;
    description?: string;
    filters?: string;
    participantIds?: string[];
    success?: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

interface clearSessionParticipantGroupConfig {
    success?: (data: XMLHttpRequest) => any;
    failure?: (data: XMLHttpRequest, options: any) => any;
}

export interface ParticipantGroup {
    rowId?: number;
    id?: number;
    participantIds?: string[];
    label: string;
    description: string;
    filters: string;
    type: string;
    category: ParticipantGroupCategory
}

interface ParticipantGroupCategory {
    rowId: number;
    shared: boolean;
    label: string;
    type: string;
}

