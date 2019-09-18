import * as React from 'react';
import { drawBarplot } from '../d3/Barplot'

import * as Cube from '../../typings/Cube'
import * as StudyCardTypes from '../../typings/StudyCard'
import * as Viz from '../../typings/Viz'
// Barplot ---------------------------------------- //
// Types 
interface BarplotControllerProps {
    dfcube: any;
    countFilter: StudyCardTypes.Filter[];
    height: number;
    width: number;
}
interface BarplotProps {
    data: any;
    height: number;
    name: string;
    width: number;
}

export const BarplotController: React.FC<BarplotControllerProps> = (props) => {
    // Constants -------------------------------------
    const dfcube = props.dfcube;
    const countFilter = props.countFilter;

    // State Variables -------------------------------------
    const [data, setData] = React.useState<Viz.BarplotData[]>([])

    React.useEffect(() => {
        // Get the data from the cube
        dfcube.onReady((mdx) => {
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    setData(formatBarplotData(cs));
                },
                name: 'DataFinderCube',
                onRows: { level: "[Subject.Gender].[Gender]", members: "members" },
                countFilter: countFilter,
                countDistinctLevel: "[Subject].[Subject]",
                showEmpty: true
            });
        })
    }, [countFilter])

    function formatBarplotData(cs: Cube.CellSet) {
        const bpd: Viz.BarplotData[] = new Array(cs.cells.length);
        const cells = cs.cells;
        cells.forEach((e, i) => {
            const uniqueName = e[0].positions[1][0].uniqueName;
            const label = uniqueName.split(/\./g).map(s => s.replace(/[\[\]]/g, ""))[2]
            bpd[i] = {
                label: label,
                value: e[0].value
            }
        })
        return (bpd)
    }

    return (
        <div>
            <Barplot
                data={data}
                height={props.height}
                name={"gender"}
                width={props.width}
            />
        </div>
    );
}

// render the d3 barplot element
const Barplot: React.FC<BarplotProps> = (props) => {
    React.useEffect(() => {
        if (props.data.length > 0) {
            drawBarplot(props);
        }
    });

    return (
        <div className={props.name} >
            <svg id={"barplot-" + props.name}></svg>
        </div>
    );
}

