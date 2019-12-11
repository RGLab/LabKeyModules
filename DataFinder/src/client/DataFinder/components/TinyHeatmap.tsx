import * as React from 'react';
import { drawTinyHeatmap } from './d3/TinyHeatmap'
import { TinyHeatmapProps } from '../../typings/Viz'
// Barplot ---------------------------------------- //

export const TinyHeatmap: React.FC<TinyHeatmapProps> = (props) => {

    React.useEffect(() => {
        if (props.data.length > 0 && props.assays.length > 0) {
            // console.log(props.data);
            drawTinyHeatmap(props);
        }
    });

    if (props.assays.length > 0) {
        return (
            <div className={"tinyheatmap"} >
                <svg id={"tinyheatmap-" + props.name}></svg>
            </div>
        );
    } else {
        return (
            <div></div>
        )
    }
    
}
