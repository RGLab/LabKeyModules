import React from 'react';
// import { olap } from '../olap/olap.js'
import { ICubeData, CubeData, Filter, SelectedFilters } from '../typings/CubeData';
import { Barplot } from './components/Barplot'
import {  createStudyDict, getStudyParticipantCounts } from './helpers/CubeHelpers'
import { toggleFilter } from './helpers/SelectedFilters';
import { FilterDropdown } from './components/FilterDropdown';
import { StudyParticipantCount } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { ActionButton } from './components/ActionButton';
import { FilterSummary } from './components/FilterIndicator'
import { HeatmapSelector } from './components/HeatmapSelector'

interface DataFinderControllerProps {
    mdx: any
}


const DataFinderController: React.FC<DataFinderControllerProps> = (props: DataFinderControllerProps) => {
    // Constants -------------------------------------
    const mdx = props.mdx;
    const cd = new CubeData({})
    
    // state -----
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)

    // effects
    React.useEffect(() => {
        const cd2 = new CubeData(cubeData.setIn(["subject", "age"], [{value: 15, label: "0-15"}]).toJS())
        console.log(cd2.toJS())
        setCubeData(cd2)
    }, [])
    


    return (
        <div>
            <pre>
 {JSON.stringify(cubeData.toJS(), undefined, 2)}
            </pre>
        </div>


    )

}

export const App: React.FC = () => {

    const [cubeReady, setCubeReady] = React.useState(false)

    // const dfcube = olap.CubeManager.getCube({
    //     configId: 'DataFinder:/DataFinderCube',
    //     schemaName: 'immport',
    //     name: 'DataFinderCube',
    //     deferLoad: false,
    //     memberExclusionFields: ["[Subject].[Subject]"]
    // })

    React.useEffect(() => {
        // dfcube.onReady((mdx) => {
            setCubeReady(true)
        // })
    }, [])

    if (cubeReady) {
        return <DataFinderController mdx = {{}} />
    }
    return <div></div>
}
