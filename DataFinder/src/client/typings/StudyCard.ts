import {CubeDatum, HeatmapDatum} from './CubeData'
import { Record } from 'immutable';

// export interface Filter {
//     level: string;
//     membersQuery: {
//         level: string;
//         members: string[];
//     }
// }
export interface IStudyInfo {
    assays?: string[];
    brief_title?: string;
    condition_studied?: string;
    heatmapData?: CubeDatum[];
    pi_names?: string[];
    program_title?: string;
    restricted?: boolean;
    sample_type?: string[];
    shared_study?: string;
    study_accession?: string;
    totalParticipantCount?: number;
}

export class StudyInfo extends Record({
    assays: [],
    brief_title: "",
    condition_studied: "",
    heatmapData: [],
    pi_names: [],
    program_title: "",
    restricted: false,
    sample_type: [],
    shared_study: "",
    study_accession: "",
    totalParticipantCount: 0
}) {
    assays: string[];
    brief_title: string;
    condition_studied: string;
    heatmapData: CubeDatum[];
    pi_names: string[];
    program_title: string;
    restricted: boolean;
    sample_type: string[];
    shared_study: string;
    study_accession: string;
    totalParticipantCount: number;

    constructor(params?: IStudyInfo) {
        params ? super(params) : super()
    }

    with(values: IStudyInfo) {
        return this.merge(values) as this;
    }
}


export interface StudyDict {
    [index: string]: IStudyInfo;
}

export interface SelectedStudies {
    [index: string]: {
        selectedParticipantCount?: number;
    }
}

export interface IStudyParticipantCount {
        studyName: string;
        participantCount: number;
}

export class StudyParticipantCount extends Record({
    studyName: "",
    participantCount: 0
}) {
    studyName: string;
    participantCount: number;

    constructor(params?: IStudyParticipantCount) {
        params ? super(params) : super()
    }

    with(values: IStudyParticipantCount) {
        return this.merge(values) as this;
    }
}