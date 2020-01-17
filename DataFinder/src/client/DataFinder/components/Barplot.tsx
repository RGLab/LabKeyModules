import * as React from 'react';
import { drawBarplot } from './d3/Barplot.d3'
import { CubeDatum } from '../../typings/CubeData'

export interface BarplotProps {
    data: CubeDatum[];
    name: string;
    width: number;
    height: number;
}


const createAxisData = (data: CubeDatum[]) => {
    const axisData = data.map(cd => cd.member)

    axisData.sort()

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
            labels: createAxisData(props.data)
        });
        }
    });


    return (
        <div className={props.name} >
            <svg id={"barplot-container-" + props.name} ></svg>
        </div>
    );
}
