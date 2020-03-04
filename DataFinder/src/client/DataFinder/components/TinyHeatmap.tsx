import * as React from 'react';
import { drawTinyHeatmap } from './d3/TinyHeatmap.d3'
import { TinyHeatmapInfo } from '../../typings/StudyCard'
// Barplot ---------------------------------------- //
export interface TinyHeatmapProps {
    name: string;
    heatmapInfo: TinyHeatmapInfo
}

export const TinyHeatmap: React.FC<TinyHeatmapProps> = (props) => {

    React.useEffect(() => {
        if (props.heatmapInfo.data.length > 0 && props.heatmapInfo.assays.length > 0) {
            drawTinyHeatmap(props);
        }
    }, []);

    return (
        <div className={"tinyheatmap"} >
            <svg id={"tinyheatmap-" + props.name}></svg>
        </div>
    );


}
