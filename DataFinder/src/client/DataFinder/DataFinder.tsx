import React from 'react';
import { olap } from '../olap/olap.js'

interface DataFinderControllerProps {
    mdx: any
}


const DataFinderController: React.FC<DataFinderControllerProps> = (props: DataFinderControllerProps) => {
    // Constants -------------------------------------
    const mdx = props.mdx;


    // State variables -------------------------------------
    // Data objects (model)
    const [SelectedFilters, setSelectedFilters] = React.useState([])
    const [CubeData, setCubeData] = React.useState([])
    const [StudyDict, setStudyDict] = React.useState([])

    // Listeners
    const [saveCounter, setSaveCounter] = React.useState<number>(0)
    const [applyCounter, setApplyCounter] = React.useState<number>(0)
    const [loadedGroup, setLoadedGroup] = React.useState<string>()
    const [groupCounter, setGroupCounter] = React.useState<number>(0);

    // Effects  -------------------------------------

    // Do these things only when the page loads
    React.useEffect(() => {
        // loadData
        // const cubeData = createCubeData(mdx)
        // setCubeData(cubeData)
        // const studyDict = createStudyDict(mdx)
        // setStudyDict(studyDict)
    }, [])

    // Do these things when certain variables are incremented 
    // Apply filters
    React.useEffect(() => {
        // set local storage
        // call to sessionParticipantGroup.api
        // update CubeData
        // update StudyDict
    }, [applyCounter])


    React.useEffect(() => {
        // saveGroup(selectedFilters)
    }, [saveCounter])

    React.useEffect(() => {
        // load group
        // make api calls
        // update CubeData
        // update StudyDict
    }, [loadedGroup, groupCounter])

    // Helper functions ---------------------------------------------
    // These are functions which will get passed down to those components
    // which can cause updates to the page

    const toggleFilter = (dim: string, level: string, label: string) => {
        // get filter from arguments
        // if in selected filters, remove it. Otherwise, add to selectedFilters
    }

    const applyFilters = () => {
        setApplyCounter(applyCounter + 1)
    }

    const saveParticipantGroup = () => {
        setSaveCounter(saveCounter + 1)
    }

    const loadParticipantGroup = (groupName: string) => {
        setLoadedGroup(groupName)
        setGroupCounter(groupCounter + 1)
    }

    const clearFilters = () => {
        setSelectedFilters([]);
        applyFilters()
    }

    return (
        <div>
            ready!
        </div>
    )

}

export const App: React.FC = () => {

    const [cubeReady, setCubeReady] = React.useState(false)

    const dfcube = olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'immport',
        name: 'DataFinderCube',
        deferLoad: false,
        memberExclusionFields: ["[Subject].[Subject]"]
    })

    React.useEffect(() => {
        dfcube.onReady((mdx) => {
            setCubeReady(true)
        })
    }, [])

    if (cubeReady) {
        return <DataFinderController mdx = {dfcube.mdx} />
    }
    return <div></div>
}


