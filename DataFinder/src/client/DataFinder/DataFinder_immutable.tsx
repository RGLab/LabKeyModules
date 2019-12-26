import React from 'react';
// import { olap } from '../olap/olap.js'
import { ICubeData, CubeData, Filter, SelectedFilters } from '../typings/CubeData';
import { Barplot } from './components/Barplot'
import { createStudyDict, getStudyInfoArray, getStudyParticipantCounts, createStudyParticipantCounts, getCubeData, createCubeData } from './helpers/CubeHelpers'
import { toggleFilter } from './helpers/SelectedFilters';
import { FilterDropdown } from './components/FilterDropdown';
import { StudyParticipantCount, StudyInfo } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { ActionButton } from './components/ActionButton';
import { FilterSummary } from './components/FilterIndicator'
import { HeatmapSelector } from './components/HeatmapSelector'
import { Map, List } from 'immutable';

interface DataFinderControllerProps {
    mdx: any
}


const DataFinderController: React.FC<DataFinderControllerProps> = (props: DataFinderControllerProps) => {
    // Constants -------------------------------------
    const mdx = props.mdx;
    const cd = new CubeData({})

    // state -----
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)
    const [studyDict, setStudyDict] = React.useState<Map<string, StudyInfo>>(Map()); // this should only be loaded once
    const [studyParticipantCounts, setStudyParticipantCounts] = React.useState<List<StudyParticipantCount>>(List())
    const [selectedFilters, setSelectedFilters] = React.useState<SelectedFilters>({})

    // Listeners
    const [saveCounter, setSaveCounter] = React.useState<number>(0)
    const [applyCounter, setApplyCounter] = React.useState<number>(0)
    const [loadedGroup, setLoadedGroup] = React.useState<string>()
    const [groupCounter, setGroupCounter] = React.useState<number>(0);



    // Effects  -------------------------------------


    React.useEffect(() => {
        const cd2 = new CubeData(cubeData.setIn(["subject", "age"], [{ value: 15, label: "0-15" }]).toJS())
        setCubeData(cd2)
        getStudyInfoArray(mdx, {}).then((sia) => setStudyDict(createStudyDict(sia)));
    }, [])

    // Do these things only when the page loads
    React.useEffect(() => {
        // get filters from localStorage
        // load data
        getStudyInfoArray(mdx, selectedFilters).then((sia) => {
            setStudyDict(createStudyDict(sia))
            console.log(studyDict)
            applyFilters()
        })
    }, [])

    // Do these things when certain variables are incremented 
    // Apply filters
    React.useEffect(() => {
        // set local storage
        // call to sessionParticipantGroup.api
        // Update local state
        Promise.all([
            getStudyParticipantCounts(mdx, selectedFilters),
            getCubeData(mdx, selectedFilters)]).then(
                ([spc, cd]) => {
                    setStudyParticipantCounts(createStudyParticipantCounts(spc))
                    setCubeData(createCubeData(cd))
                })
    }, [applyCounter])


    React.useEffect(() => {
        // saveGroup(selectedFilters)
    }, [saveCounter])

    React.useEffect(() => {
        // load group
        // make api calls 
        applyFilters()
    }, [loadedGroup, groupCounter])

    // Helper functions ---------------------------------------------
    // These are functions which will get passed down to those components
    // which can cause updates to the page

    const getFilters = () => {
        // get filters from local storage
        // set SelectedFilters
    }

    const filterClick = (filter: Filter) => {
        // make a copy of SelectedFilters
        let sf: SelectedFilters = JSON.parse(JSON.stringify(selectedFilters))
        return (() => {
            sf = toggleFilter(filter, sf)
            setSelectedFilters(sf)
        })
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
        setSelectedFilters({});
        applyFilters()
    }





    return (
        <div>
            <pre>
                {JSON.stringify(cubeData.toJS(), undefined, 2)}
                {JSON.stringify(studyDict.toJS(), undefined, 2)}
            </pre>
            {studyParticipantCounts.map((sdy) => {
                if (sdy.participantCount > 0 && studyDict.get(sdy.studyName)) {
                    return (
                        <StudyCard key={sdy.studyName}
                            study={studyDict.get(sdy.studyName)}
                            participantCount={sdy.participantCount} />
                    )
                }

            })}
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
        return <DataFinderController mdx={{}} />
    }
    return <div></div>
}
