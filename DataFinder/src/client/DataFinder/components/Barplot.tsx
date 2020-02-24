import * as React from 'react';
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


const createAxisData = (members: FilterCategory[]) => {
    const axisData = JSON.parse(JSON.stringify(members)).reverse().map(m => m.label)
    return (axisData)
}

// render the d3 barplot element



export const Barplot: React.FC<BarplotProps> = (props) => {
    if (props.data.size == 0) return (<></>)
    // get labels
    const labels = createAxisData(props.categories)

    // get total height
    const totalHeight = Math.max(195, 15 * labels.length + 20)

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
        width: 220,
        totalHeight: totalHeight,
        height: props.height,
        labels: createAxisData(props.categories),
        countMetric: props.countMetric,
        barColor: props.barColor
    }

    React.useEffect(() => {
        // get labels
        const labels = createAxisData(props.categories)

        // get total height
        const totalHeight = Math.max(195, 15 * labels.length + 20)

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
            width: 220,
            totalHeight: totalHeight,
            height: props.height,
            labels: createAxisData(props.categories),
            countMetric: props.countMetric,
            barColor: props.barColor
        }
        D3Barplot.create(props.name, data.toJS(), config)
    }, [])

    React.useEffect(() => {
        // get labels
        const labels = createAxisData(props.categories)

        // get total height
        const totalHeight = Math.max(195, 15 * labels.length + 20)

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
            width: 220,
            totalHeight: totalHeight,
            height: props.height,
            labels: createAxisData(props.categories),
            countMetric: props.countMetric,
            barColor: props.barColor
        }
        D3Barplot.update(props.name, data.toJS(), config)
    }, [props.data])

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