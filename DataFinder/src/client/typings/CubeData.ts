import { Record, fromJS, List, Map } from 'immutable';

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

export interface CubeDatum {
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
    Race?: CubeDatum[];
    Age?: CubeDatum[];
    Gender?: CubeDatum[];
    Species?: CubeDatum[];
    ExposureMaterial?: CubeDatum[];
    ExposureProcess?: CubeDatum[];
}

export class SubjectData extends Record({
    Race: List<CubeDatum>(),
    Age: List<CubeDatum>(),
    Gender: List<CubeDatum>(),
    Species: List<CubeDatum>(),
    ExposureMaterial: List<CubeDatum>(),
    ExposureProcess: List<CubeDatum>()
}) {
    Race: List<CubeDatum>;
    Age: List<CubeDatum>;
    Gender: List<CubeDatum>;
    Species: List<CubeDatum>;
    ExposureMaterial: List<CubeDatum>;
    ExposureProcess: List<CubeDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IStudyData {
    Name?: CubeDatum[];
    Program?: CubeDatum[];
    Condition?: CubeDatum[];
    ResearchFocus: CubeDatum[];
    Species?: CubeDatum[];
    ExposureMaterial?: CubeDatum[];
    ExposureProcess?: CubeDatum[];
}

export class StudyData extends Record({
    Name: List<CubeDatum>(),
    Program: List<CubeDatum>(),
    Condition: List<CubeDatum>(),
    ResearchFocus: List<CubeDatum>(),
    Species: List<CubeDatum>(),
    ExposureMaterial: List<CubeDatum>(),
    ExposureProcess: List<CubeDatum>()
}) {
    Name: List<CubeDatum>;
    Program: List<CubeDatum>;
    Condition: List<CubeDatum>;
    Species: List<CubeDatum>;
    ExposureMaterial: List<CubeDatum>;
    ExposureProcess: List<CubeDatum>;

    constructor(params?: IStudyData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IAssayData {
    Assay?: {
        Assay?: CubeDatum[];
        Timepoint?: CubeDatum[];
        SampleType?: CubeDatum[];
    },
    Timepoint?: CubeDatum[];
    SampleType?: {
        SampleType?: CubeDatum[];
        Assay?: CubeDatum[];
    };
}

export class AssayData extends Record({
    Assay: Map({
        Assay: List<CubeDatum>(),
        Timepoint: List<CubeDatum>(),
        SampleType: List<CubeDatum>(),
    }),
    Timepoint: List<CubeDatum>(),
    SampleType: Map({
        SampleType: List<CubeDatum>(),
        Assay: List<CubeDatum>()
    })
}) {
    Assay: Map<string, List<CubeDatum>>;
    Timepoint: List<CubeDatum>;
    SampleType: List<CubeDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface ICubeData {
    Subject?: SubjectData,
    Study?: StudyData,
    Data?: AssayData
}

export class CubeData extends Record({
    Subject: new SubjectData(),
    Study: new StudyData(),
    Data: fromJS({
        Assay: {
            Assay: [],
            Timepoint: [],
            SampleType: []
        },
        Timepoint: [],
        SampleType: {
            SampleType: [],
            Assay: []
        }
    })
}) {
    Subject: SubjectData;
    Study: StudyData;
    Data: AssayData;


    constructor(params?: ICubeData) {
        params ? super(fromJS(params)) : super()
    }

    with(values: ICubeData) {
        return this.merge(fromJS(values)) as this;
    }

}

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


export interface TotalCounts {
    study: number,
    participant: number
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

