export interface BarplotDatum {
        label: string;
        value: number;
}

export interface HeatmapDatum {
        assay: string;
        timepoint: string;
        sampleType: string;
        count: number;
}


export interface TinyHeatmapProps {
        data: HeatmapDatum[];
        name: string;
        width: number;
        height: number;
        colors: string[];
        colorBreaks: number[];
        assays: string[];
}

export interface BarplotProps {
        data: BarplotDatum[];
        name: string;
        width: number;
        height: number;
        dataRange: number[];
        labels: string[];
    }

export interface BarplotData {
        [index: string]: BarplotDatum[]
}