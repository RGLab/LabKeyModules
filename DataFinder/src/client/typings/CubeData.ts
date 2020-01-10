import { Record, fromJS, List, Map } from 'immutable';

export interface CubeDatum {
    level: string;
    member: string;
    participantCount?: number;
    studyCount?: number
}

export interface HeatmapDatum<data> {
    x: string;
    y: string;
    participantCount :number;
    studyCount: number;
    data: data;
}

export interface ISubjectData {
    Race?: CubeDatum[];
    Age?: CubeDatum[];
    Gender?: CubeDatum[];
}

export class SubjectData extends Record({
    Race: List<CubeDatum>(),
    Age: List<CubeDatum>(),
    Gender: List<CubeDatum>(),
}) {
    Race: List<CubeDatum>;
    Age: List<CubeDatum>;
    Gender: List<CubeDatum>;

    constructor(params?: ISubjectData) {
        params ? super(fromJS(params)) : super()
    }
}

export interface IStudyData {
    Name?: CubeDatum[];
    Program?: CubeDatum[];
    Condition?: CubeDatum[];
    Species?: CubeDatum[];
    ExposureMaterial?: CubeDatum[];
    ExposureProcess?: CubeDatum[];
}

export class StudyData extends Record({
    Name: List<CubeDatum>(),
    Program: List<CubeDatum>(),
    Condition: List<CubeDatum>(),
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
    Study: fromJS({
        Name: [],
        Program: [],
        Condition: [],
        Species: [],
        ExposureMaterial: [],
        ExposureProcess: []
    }),
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
    Subject: Map<string, List<List<string>>>(),
    Study: Map<string, List<List<string>>>(),
    Data: Map<string, Map<string, List<List<string>>>>()
}) {
    Subject: Map<string, List<List<string>>>;
    Study: Map<string, List<List<string>>>;
    Data: Map<string, Map<string, List<List<string>>>|List<List<string>>>;

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