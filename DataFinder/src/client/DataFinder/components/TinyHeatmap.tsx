import * as React from 'react';
import { drawTinyHeatmap } from './d3/TinyHeatmap.d3'
import { HeatmapDatum } from '../../typings/CubeData';
// Barplot ---------------------------------------- //
export interface TinyHeatmapProps {
    data: HeatmapDatum<any>[];
    name: string;
    width: number;
    height: number;
    colors: string[];
    colorBreaks: number[];
    assays: string[];
}

export const TinyHeatmap: React.FC<TinyHeatmapProps> = (props) => {

    React.useEffect(() => {
        if (props.data.length > 0 && props.assays.length > 0) {
            drawTinyHeatmap(props);
        }
    }, []);

    return (
        <div className={"tinyheatmap"} >
            <svg id={"tinyheatmap-" + props.name}></svg>
        </div>
    );


}
