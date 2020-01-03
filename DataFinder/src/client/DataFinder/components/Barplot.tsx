import * as React from 'react';
import { drawBarplot } from './d3/Barplot.d3'
import { CubeDatum } from '../../typings/CubeData'

export interface BarplotProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
    dataRange: number[];
    labels: string[];
}

// render the d3 barplot element
export const Barplot: React.FC<BarplotProps> = (props) => {
    React.useEffect(() => {
        // if (props.data.length > 0) {
            drawBarplot(props);
        // }
    });

    return (
        <div className={props.name} >
            <svg id={"barplot-" + props.name}></svg>
        </div>
    );
}
