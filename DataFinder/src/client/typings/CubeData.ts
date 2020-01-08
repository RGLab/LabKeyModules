import { Record, fromJS, List, Map } from 'immutable';

export interface CubeDatum {
    level: string;
    member: string;
    count: number;
}

export interface HeatmapDatum<data> {
    x: string;
    y: string;
    count :number;
    data: data;
}

export interface ISubjectData {
    race?: CubeDatum[];
    age?: CubeDatum[];
    gender?: CubeDatum[];
}

export class SubjectData extends Record({
    race: List<CubeDatum>(),
    age: List<CubeDatum>(),
    gender: List<CubeDatum>(),
}) {
    race: List<CubeDatum>;
    age: List<CubeDatum>;
    gender: List<CubeDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IStudyData {
    name?: CubeDatum[];
    program?: CubeDatum[];
    condition?: CubeDatum[];
    species?: CubeDatum[];
    exposureMaterial?: CubeDatum[];
    exposureProcess?: CubeDatum[];
}

export class StudyData extends Record({
    name: List<CubeDatum>(),
    program: List<CubeDatum>(),
    condition: List<CubeDatum>(),
    species: List<CubeDatum>(),
    exposureMaterial: List<CubeDatum>(),
    exposureProcess: List<CubeDatum>()
}) {
    name: List<CubeDatum>;
    program: List<CubeDatum>;
    condition: List<CubeDatum>;
    species: List<CubeDatum>;
    exposureMaterial: List<CubeDatum>;
    exposureProcess: List<CubeDatum>;

    constructor(params?: IStudyData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IAssayData {
    assay?: {
        assay?: CubeDatum[];
        timepoint?: CubeDatum[];
        sampleType?: CubeDatum[];
    },
    timepoint?: CubeDatum[];
    sampleType?: {
        sampleType?: CubeDatum[];
        assay?: CubeDatum[];
    };
}

export class AssayData extends Record({
    assay: Map({
        assay: List<CubeDatum>(),
        timepoint: List<CubeDatum>(),
        sampleType: List<CubeDatum>(),
    }),
    timepoint: List<CubeDatum>(),
    sampleType: Map({
        sampleType: List<CubeDatum>(),
        assay: List<CubeDatum>()
    })
}) {
    assay: Map<string, List<CubeDatum>>;
    timepoint: List<CubeDatum>;
    sampleType: List<CubeDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface ICubeData {
    subject?: SubjectData,
    study?: StudyData,
    data?: AssayData
}

export class CubeData extends Record({
    subject: new SubjectData(),
    study: fromJS({
        name: [],
        program: [],
        condition: [],
        species: [],
        exposureMaterial: [],
        exposureProcess: []
    }),
    data: fromJS({
        assay: {
            assay: [],
            timepoint: [],
            sampleType: []
        },
        timepoint: [],
        sampleType: []
    })
}) {
    subject: SubjectData;
    study: StudyData;
    data: AssayData;


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

// export interface ISelectedFilter {}

// export class SelectedFilter extends Record({
//     members: List<string>(),
//     operator: "OR"
// }) {
//     members: List<string>;
//     operator: string

//     constructor(params?: ISelectedFilter) {
//         params ? super(fromJS(params)) : super()
//     }
// }

export interface ISelectedFilters {
    subject?: Map<string, List<List<string>>>
    study?: Map<string, List<List<string>>>
    data?: Map<string, Map<string, List<List<string>>>|List<List<string>>>
}

export class SelectedFilters extends Record({
    subject: Map<string, List<List<string>>>(),
    study: Map<string, List<List<string>>>(),
    data: Map<string, Map<string, List<List<string>>>>()
}) {
    subject: Map<string, List<List<string>>>;
    study: Map<string, List<List<string>>>;
    data: Map<string, Map<string, List<List<string>>>|List<List<string>>>;

    constructor(params?: ISelectedFilters) {
        params ? super(fromJS(params)) : super()
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



// export class CubeData extends CubeDataRecord implements ICubeData {
//     subject: {
//         race: CubeDatum[],
//         age: CubeDatum[],
//         gender: CubeDatum[]
//     };
//     study: {
//         name: CubeDatum[],
//         program: CubeDatum[],
//         condition: CubeDatum[],
//         species: CubeDatum[],
//         exposureMaterial: CubeDatum[],
//         exposureProcess: CubeDatum[]
//     };
//     data: {
//         assay: {
//             assay: CubeDatum[],
//             timepoint: HeatmapDatum[],
//             sampleType: HeatmapDatum[]
//         },
//         timepoint: CubeDatum[],
//         sampleType: CubeDatum[]
//     }
//     constructor(props: ICubeData) {
//         super(props)
//     }
// }

// export interface CollectCubeData 
//     (mdx: Cube)
// }