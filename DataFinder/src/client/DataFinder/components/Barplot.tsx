import * as React from 'react';
import { drawBarplot } from './d3/Barplot.d3'
import { CubeDatum, FilterCategory } from '../../typings/CubeData'

export interface BarplotProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
    categories: FilterCategory[];
    countMetric: string;
    barColor: string;
}


const createAxisData = (members: FilterCategory[]) => {
    const axisData = JSON.parse(JSON.stringify(members)).reverse().map(m => m.label)
    return (axisData)
}

// render the d3 barplot element
export const Barplot: React.FC<BarplotProps> = (props) => {
    React.useEffect(() => {
        if (props.data.length > 0) {
            drawBarplot({
                data: props.data,
                name: props.name,
                width: props.width,
                height: props.height,
                labels: createAxisData(props.categories),
                countMetric: props.countMetric,
                barColor: props.barColor
            });
        }
    });


    return (
        <div className={props.name} >
            <div className="df-barplot-title"><h4>{props.name}</h4></div>
            <div id={"barplot-container-" + props.name} className="datafinder-barplot">
                <svg></svg>
            </div>
            <div id={"xaxis-" + props.name}>
                <svg></svg>
            </div>
        </div>
    );
}
