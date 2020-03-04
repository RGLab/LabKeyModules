import {CubeDatum, HeatmapDatum} from './CubeData'
import { Record } from 'immutable';
import { AxisDatum } from '../DataFinder/components/AssayTimepointViewer';

// export interface Filter {
//     level: string;
//     membersQuery: {
//         level: string;
//         members: string[];
//     }
// }

export interface TinyHeatmapInfo {
    data?: HeatmapDatum<any>[];
    assays?: string[];
    height?: number;
    width?: number;
    yaxisScale?: d3.ScaleBand<string>;
    xaxisScale?: d3.ScaleBand<string>;
    colorScale?: d3.ScaleThreshold<number, string>;
}

export interface IStudyInfo {
    assays?: string[];
    brief_title?: string;
    research_focus?: string;
    heatmapData?: HeatmapDatum<any>[];
    pi_names?: string[];
    program_title?: string;
    restricted?: boolean;
    sample_type?: string[];
    shared_study?: string;
    study_accession?: string;
    totalParticipantCount?: number;
    container_id: string;
    heatmapInfo: TinyHeatmapInfo;
}

export class StudyInfo extends Record({
    assays: [],
    brief_title: "",
    research_focus: "",
    heatmapData: [],
    pi_names: [],
    program_title: "",
    restricted: false,
    sample_type: [],
    shared_study: "",
    study_accession: "",
    totalParticipantCount: 0,
    heatmapInfo: {}
}) {
    assays: string[];
    brief_title: string;
    research_focus: string;
    heatmapData: HeatmapDatum<any>[];
    pi_names: string[];
    program_title: string;
    restricted: boolean;
    sample_type: string[];
    shared_study: string;
    study_accession: string;
    totalParticipantCount: number;
    heatmapInfo: TinyHeatmapInfo

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