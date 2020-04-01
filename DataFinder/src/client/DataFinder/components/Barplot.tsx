import React, { CSSProperties } from 'react';
import { D3Barplot } from './d3/Barplot.d3'
import { CubeDatum, FilterCategory } from '../../typings/CubeData'
import { List } from 'immutable'

export interface BarplotProps {
    data: List<CubeDatum>;
    name: string;
    width: number;
    height: number;
    categories: FilterCategory[];
    countMetric: string;
    barColor: string;
}

// helpers
const createAxisData = (members: FilterCategory[]) => {
    const axisData = JSON.parse(JSON.stringify(members)).reverse().map(m => m.label)
    return (axisData)
}

const setup = (props: BarplotProps) => {
    // get labels
    const labels = createAxisData(props.categories)

    // get total height
    const totalHeight = Math.max(props.height, 15 * labels.length + 40)

    // clean data
    const unusedDataIndices = [];
    let data = props.data
    props.data.toJS().forEach((d, i) => {
        if (labels.indexOf(d.member) == -1) {
            unusedDataIndices.push(i)
        }
    })
    unusedDataIndices.reverse().forEach((d) => {
        data = data.delete(d)
    })
    const config = {
        width: props.width - 20,
        height: totalHeight,
        labels: createAxisData(props.categories),
        countMetric: props.countMetric,
        barColor: props.barColor
    }
    return({name: props.name, data: data.toJS(), config: config})
}

// render the d3 barplot element
export const Barplot: React.FC<BarplotProps> = (props) => {

    if (props.data.size == 0) return (<></>)

    const datafinderBarplotStyle: CSSProperties = {
        width: props.width,
        height: props.height - 40
    }

    React.useEffect(() => {
        const args = setup(props)
        D3Barplot.create(args.name, args.data, args.config)
    }, [])

    React.useEffect(() => {
        const args = setup(props)
        D3Barplot.update(args.name, args.data, args.config)
    }, [props.data])

    return (
        <div className={props.name} >
            <div className="df-barplot-title"><h4>{props.name}</h4></div>
            <div id={"barplot-container-" + props.name} className="datafinder-barplot" style={datafinderBarplotStyle}>
                <svg></svg>
            </div>
            <div id={"xaxis-" + props.name}>
                <svg></svg>
            </div>
        </div>
    );

}