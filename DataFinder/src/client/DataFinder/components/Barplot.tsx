import * as React from 'react';
import { drawBarplot } from './d3/Barplot.d3'
import * as Components from '../../typings/Components'


// render the d3 barplot element
export const Barplot: React.FC<Components.BarplotProps> = (props) => {
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
