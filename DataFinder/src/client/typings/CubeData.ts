import {Record, fromJS} from 'immutable'; 

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

export interface Filter {
    dim: string;
    level: string;
    label: string;
}

export interface SelectedFilter {
    members: string[],
    operator: string
}

export interface SelectedFilters {
    [index: string]: {
        members: string[],
        operator: string
    }
}