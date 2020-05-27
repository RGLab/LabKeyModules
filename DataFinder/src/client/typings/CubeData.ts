import { Record, fromJS, List, Map } from 'immutable';
import { StudyParticipantCount } from './StudyCard';
import { createTotalCounts } from '../DataFinder/helpers/CubeHelpers';

export interface GroupInfo {
    id: number;
    label: string;
    selected: boolean;
    filters: {
        [index: string]: {
            members: string[];
            name: string;
            operator: string
        }
    } | ISelectedFilters;
    new?: boolean
}

export interface PlotDatum {
    level: string;
    member: string;
    participantCount?: number;
    studyCount?: number
}

export interface HeatmapDatum<data> {
    x: string;
    y: string;
    participantCount: number;
    studyCount: number;
    data: data;
}

export interface ISubjectData {
    Race?: PlotDatum[];
    Age?: PlotDatum[];
    Gender?: PlotDatum[];
    Species?: PlotDatum[];
    ExposureMaterial?: PlotDatum[];
    ExposureProcess?: PlotDatum[];
}

export class SubjectData extends Record({
    Race: List<PlotDatum>(),
    Age: List<PlotDatum>(),
    Gender: List<PlotDatum>(),
    Species: List<PlotDatum>(),
    ExposureMaterial: List<PlotDatum>(),
    ExposureProcess: List<PlotDatum>()
}) {
    Race: List<PlotDatum>;
    Age: List<PlotDatum>;
    Gender: List<PlotDatum>;
    Species: List<PlotDatum>;
    ExposureMaterial: List<PlotDatum>;
    ExposureProcess: List<PlotDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IStudyData {
    Name?: PlotDatum[];
    Program?: PlotDatum[];
    Condition?: PlotDatum[];
    ResearchFocus: PlotDatum[];
    Species?: PlotDatum[];
    ExposureMaterial?: PlotDatum[];
    ExposureProcess?: PlotDatum[];
}

export class StudyData extends Record({
    Name: List<PlotDatum>(),
    Program: List<PlotDatum>(),
    Condition: List<PlotDatum>(),
    ResearchFocus: List<PlotDatum>(),
    Species: List<PlotDatum>(),
    ExposureMaterial: List<PlotDatum>(),
    ExposureProcess: List<PlotDatum>()
}) {
    Name: List<PlotDatum>;
    Program: List<PlotDatum>;
    Condition: List<PlotDatum>;
    Species: List<PlotDatum>;
    ExposureMaterial: List<PlotDatum>;
    ExposureProcess: List<PlotDatum>;

    constructor(params?: IStudyData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IAssayData {
    Assay?: {
        Assay?: PlotDatum[];
        Timepoint?: PlotDatum[];
        SampleType?: PlotDatum[];
    },
    Timepoint?: PlotDatum[];
    SampleType?: {
        SampleType?: PlotDatum[];
        Assay?: PlotDatum[];
    };
}

export class AssayData extends Record({
    Assay: Map({
        Assay: List<PlotDatum>(),
        Timepoint: List<PlotDatum>(),
        SampleType: List<PlotDatum>(),
    }),
    Timepoint: List<PlotDatum>(),
    SampleType: Map({
        SampleType: List<PlotDatum>(),
        Assay: List<PlotDatum>()
    })
}) {
    Assay: Map<string, List<PlotDatum>>;
    Timepoint: List<PlotDatum>;
    SampleType: List<PlotDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IPlotData {
    Subject?: SubjectData,
    Study?: StudyData,
    Data?: AssayData
}

export class PlotData extends Record({
    Subject: new SubjectData(),
    Study: new StudyData(),
    Data: new AssayData()
}) {
    Subject: SubjectData;
    Study: StudyData;
    Data: AssayData;


    constructor(params?: IPlotData) {
        params ? super(fromJS(params)) : super()
    }

    with(values: IPlotData) {
        return this.merge(fromJS(values)) as this;
    }

}

export class TotalCounts extends Record ({
    study: 0,
    participant: 0
}) {
    study: number
    participant: number

    constructor(params?: {study?: number, participant?: number}) {
        params ? super(params) : super()
    }
}


export class CubeData extends Record({
    plotData: new PlotData(),
    studyParticipantCounts: List(),
    totalCounts: new TotalCounts()
}) {
    plotData: PlotData;
    studyParticipantCounts: List<StudyParticipantCount>;
    totalCounts: TotalCounts

}

// -------------------------------------------------
// Filters

export interface Filter {
    level: string,
    member: string
}

export interface ISelectedFilter {
    members?: string[] | List<string>;
    operator?: string
}

export class SelectedFilter extends Record({
    members: List<string>(),
    operator: "OR"
}) {
    members: List<string>;
    operator: string;

    constructor(params?: ISelectedFilter) {
        params ? super(fromJS(params)) : super()
    }

    with(values: ISelectedFilter) {
        return this.merge(fromJS(values)) as this;
    }
}

export interface ISelectedFilters {
    Subject?: { [index: string]: SelectedFilter };
    Study?: { [index: string]: SelectedFilter };
    Data?: { [index: string]: SelectedFilter | { [index: string]: SelectedFilter } }
}

export class SelectedFilters extends Record({
    Subject: Map<string, SelectedFilter>(),
    Study: Map<string, SelectedFilter>(),
    Data: Map<string, Map<string, SelectedFilter> | SelectedFilter>()
}) {
    Subject: Map<string, SelectedFilter>;
    Study: Map<string, SelectedFilter>;
    Data: Map<string, SelectedFilter | Map<string, SelectedFilter>>;

    constructor(params?: ISelectedFilters) {
        if (params) {
            const subject = params.Subject ? Map(params.Subject).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>()
            const study = params.Study ? Map(params.Study).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>()
            let data = Map();
            if (params.Data) {
                if (params.Data.Timepoint)
                    data = data.set("Timepoint", new SelectedFilter(params.Data.Timepoint))
                if (params.Data.Assay)
                    data = data.set("Assay", Map(params.Data.Assay).map(f => new SelectedFilter(f)))
                if (params.Data.SampleType) 
                    data = data.set("SampleType", Map(params.Data.SampleType).map(f => new SelectedFilter(f)))
            }
            super({Subject: subject, Study: study, Data: data})
        } else {
            super()
        }
    }

    with(values: ISelectedFilters) {
        return this.merge(fromJS(values)) as this;
    }
}

export interface FilterQuery {
    level: string;
    membersQuery: {
        level: string;
        members: string[] | string;
    }[]
}




export interface IBannerInfo {
    groupName?: string,
    counts?: TotalCounts,
    unsavedFilters?: boolean
}
export class BannerInfo extends Record({
    groupName: "",
    counts: { study: 0, participant: 0 },
    unsavedFilters: false
}) {
    groupName: string
    counts: TotalCounts
    unsavedFilters: boolean

    constructor(params?: IBannerInfo) {
        params ? super(params) : super()
    }

    with(values: IBannerInfo) {
        return this.merge(values) as this;
    }
}

export interface FilterCategory {
    label: string;
    sortorder: number
}

export interface FilterCategories {
    [index: string]: FilterCategory[]
}

