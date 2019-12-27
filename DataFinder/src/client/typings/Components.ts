import { HeatmapDatum, BarplotDatum, Filter } from "./CubeData"

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

export interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: string[];
    filterClick: (dim: string, filter: Filter) => () => void;
}