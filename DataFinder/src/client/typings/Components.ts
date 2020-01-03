import { CubeDatum, Filter, HeatmapDatum, SelectedFilter } from "./CubeData"

export interface TinyHeatmapProps {
    data: HeatmapDatum<any>[];
    name: string;
    width: number;
    height: number;
    colors: string[];
    colorBreaks: number[];
    assays: string[];
}


