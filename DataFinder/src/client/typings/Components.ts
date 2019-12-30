import { CubeDatum, Filter } from "./CubeData"

export interface TinyHeatmapProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
    colors: string[];
    colorBreaks: number[];
    assays: string[];
}

export interface BarplotProps {
    data: CubeDatum[];
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

export interface HeatmapProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
    xaxis: { label: string; data: any }[];
    yaxis: { label: string; data: any }[]
    breaks: number[];
    colors: string[];
    selected: string[];
    handleClick: (d: CubeDatum) => void
  }