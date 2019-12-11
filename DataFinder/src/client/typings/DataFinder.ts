import { BarplotDatum, HeatmapDatum } from "./Viz";

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

export interface SelectedFilters {
    
}