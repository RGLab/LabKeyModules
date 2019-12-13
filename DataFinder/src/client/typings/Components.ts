import { HeatmapDatum, BarplotDatum } from "./CubeData"

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