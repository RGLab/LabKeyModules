import * as React from 'react';
import { drawBarplot } from './d3/Barplot.d3'
import { CubeDatum, FilterCategory } from '../../typings/CubeData'

export interface BarplotProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
    categories: FilterCategory[]
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
            labels: createAxisData(props.categories)
        });
        }
    });


    return (
        <div className={props.name} >
            <svg id={"barplot-container-" + props.name} ></svg>
        </div>
    );
}
