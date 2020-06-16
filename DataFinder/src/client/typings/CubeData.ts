import { Record, fromJS, List, Map } from 'immutable';
import { StudyParticipantCount } from './StudyCard';

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
    Timepoint?: {
        Timepoint?: PlotDatum[];
        SampleType?: PlotDatum[];
    };
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
    Timepoint: Map({
        Timepoint: List<PlotDatum>(),
        SampleType: List<PlotDatum>()
    }),
    SampleType: Map({
        SampleType: List<PlotDatum>(),
        Assay: List<PlotDatum>()
    })
}) {
    Assay: Map<string, List<PlotDatum>>;
    Timepoint:  Map<string, List<PlotDatum>>;
    SampleType:  Map<string, List<PlotDatum>>;

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
    studyParticipantCounts: {},
    totalCounts: new TotalCounts()
}) {
    plotData: PlotData;
    studyParticipantCounts: {[index: string]: number};
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
    Data?: { [index: string]: { [index: string]: SelectedFilter } }
}

export class SelectedFilters extends Record({
    Subject: Map<string, SelectedFilter>(),
    Study: Map<string, SelectedFilter>(),
    Data: Map<string, Map<string, SelectedFilter>>({
        Timepoint: Map<string, SelectedFilter>(),
        Assay: Map<string, SelectedFilter>(),
        SampleType: Map<string, SelectedFilter>()
    }
        
    )
}) {
    Subject: Map<string, SelectedFilter>;
    Study: Map<string, SelectedFilter>;
    Data: Map<string, Map<string, SelectedFilter>>;

    constructor(params?: ISelectedFilters) {
        if (params) {
            const subject = params.Subject ?  Map(params.Subject).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>()
            const study = params.Study ? Map(params.Study).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>()
            const data = Map({
                Timepoint: (params.Data && params.Data.Timepoint) ? Map(params.Data.Timepoint).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>(),
                Assay: (params.Data && params.Data.Assay) ? Map(params.Data.Assay).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>(),
                SampleType: (params.Data && params.Data.SampleType) ? Map(params.Data.SampleType).map(f => new SelectedFilter(f)) : Map<string, SelectedFilter>()
            })
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

