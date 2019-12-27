import {Record, fromJS, List, Map} from 'immutable'; 

export interface BarplotDatum {
    label: string;
    value: number;
}

export interface BarplotData {
    [index: string] : BarplotDatum[]
}

export interface HeatmapDatum {
    assay: string;
    timepoint: string;
    sampleType?: string;
    count: number;
}

export interface ICubeData {
    subject?: {
        race?: BarplotDatum[],
        age?: BarplotDatum[],
        gender?: BarplotDatum[]
    },
    study?: {
        name?: BarplotDatum[],
        program?: BarplotDatum[],
        condition?: BarplotDatum[],
        species?: BarplotDatum[],
        exposureMaterial?: BarplotDatum[],
        exposureProcess?: BarplotDatum[]
    },
    data?: {
        assay?: {
            assay?: BarplotDatum[],
            timepoint?: HeatmapDatum[],
            sampleType?: HeatmapDatum[]
        },
        timepoint?: BarplotDatum[],
        sampleType?: BarplotDatum[]
    }
}

export class CubeData extends Record({
    subject: fromJS({
        race: [],
        age: [],
        gender: []
    }),
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
        subject: {
            race: BarplotDatum[];
            age: BarplotDatum[];
            gender: BarplotDatum[]};
        study: {
            name: BarplotDatum[];
            program: BarplotDatum[];
            condition: BarplotDatum[];
            species: BarplotDatum[];
            exposureMaterial: BarplotDatum[];
            exposureProcess: BarplotDatum[];
        };
        data: {
            assay: {
                assay: BarplotDatum[];
                timepoint: HeatmapDatum[];
                sampleType: HeatmapDatum[];
            };
            timepoint: BarplotDatum[];
            sampleType: BarplotDatum[];
        };
    

    constructor(params?: ICubeData) {
        params ? super(params) : super()
    }

    with(values: ICubeData) {
        return this.merge(values) as this;
    }
}

export interface Filter {
    level: string,
    member: string
}

export interface ISelectedFilter {
    members?: List<string>;
    operator?: string
}

export class SelectedFilter extends Record({
    members: List<string>(),
    operator: "OR"
}) {
    members: List<string>;
    operator: string

    constructor(params?: ISelectedFilter) {
        params ? super(params) : super()
    }
} 

export interface ISelectedFilters {
    subject?: Map<string, SelectedFilter>
    study?: Map<string, SelectedFilter>
    data?: Map<string, SelectedFilter>
}

export class SelectedFilters extends Record({
    subject: Map<string, SelectedFilter>(),
    study: Map<string, SelectedFilter>(),
    data: Map<string, SelectedFilter>()
}) {
    subject: Map<string, SelectedFilter>;
    study: Map<string, SelectedFilter>;
    data: Map<string, SelectedFilter>;

    constructor(params?: ISelectedFilters) {
        params ? super(params) : super()
    }
}

export interface FilterQuery {
    level: string;
    membersQuery: {
        level: string;
        members: string[]|string;
    }[]
}



// export class CubeData extends CubeDataRecord implements ICubeData {
//     subject: {
//         race: BarplotDatum[],
//         age: BarplotDatum[],
//         gender: BarplotDatum[]
//     };
//     study: {
//         name: BarplotDatum[],
//         program: BarplotDatum[],
//         condition: BarplotDatum[],
//         species: BarplotDatum[],
//         exposureMaterial: BarplotDatum[],
//         exposureProcess: BarplotDatum[]
//     };
//     data: {
//         assay: {
//             assay: BarplotDatum[],
//             timepoint: HeatmapDatum[],
//             sampleType: HeatmapDatum[]
//         },
//         timepoint: BarplotDatum[],
//         sampleType: BarplotDatum[]
//     }
//     constructor(props: ICubeData) {
//         super(props)
//     }
// }

// export interface CollectCubeData 
//     (mdx: Cube)
// }