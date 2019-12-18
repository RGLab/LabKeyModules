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

export interface CubeData {
    subject: {
        race: BarplotDatum[],
        age: BarplotDatum[],
        gender: BarplotDatum[]
    },
    study: {
        name: BarplotDatum[],
        program: BarplotDatum[],
        condition: BarplotDatum[],
        species: BarplotDatum[],
        exposureMaterial: BarplotDatum[],
        exposureProcess: BarplotDatum[]
    },
    data: {
        assay: {
            assay: BarplotDatum[],
            timepoint: HeatmapDatum[],
            sampleType: HeatmapDatum[]
        },
        timepoint: BarplotDatum[],
        sampleType: BarplotDatum[]
    }
}

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