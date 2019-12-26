import React from 'react';
// import { olap } from '../olap/olap.js'
import { CubeData, Filter, SelectedFilters } from '../typings/CubeData';
import * as CubeHelpers from './helpers/CubeHelpers';
import * as ParticipantGroupHelpers from './helpers/ParticipantGroup';
import { toggleFilter } from './helpers/SelectedFilters';
import { StudyParticipantCount, StudyInfo } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { Map, List } from 'immutable';
import { ActionButton } from './components/ActionButton'
import { FilterDropdown } from './components/FilterDropdown'
import { FilterSummary } from './components/FilterIndicator'
import { Barplot } from './components/Barplot'

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


    // Do these things only when the page loads --------
    React.useEffect(() => {
        // get filters from localStorage
        // load data
        CubeHelpers.getStudyInfoArray(mdx, selectedFilters).then((sia) => {
            setStudyDict(CubeHelpers.createStudyDict(sia))
            console.log(studyDict)
            applyFilters()
        })
    }, [])

    // Do these things when certain variables are incremented --------
    // Apply filters
    React.useEffect(() => {
        // set local storage
        // call to sessionParticipantGroup.api
        // Update local state
        Promise.all([
            CubeHelpers.getStudyParticipantCounts(mdx, selectedFilters),
            CubeHelpers.getCubeData(mdx, selectedFilters)]).then(
                ([spc, cd]) => {
                    setStudyParticipantCounts(CubeHelpers.createStudyParticipantCounts(spc))
                    setCubeData(CubeHelpers.createCubeData(cd))
                })
    }, [applyCounter])


    // Save group
    React.useEffect(() => {
        // saveGroup(selectedFilters)
    }, [saveCounter])

    // Load group
    React.useEffect(() => {
        // load group
        // make api calls 
        applyFilters()
    }, [loadedGroup, groupCounter])

    // Helper functions ---------------------------------------------
    // These are functions which will get passed down to those components
    // which can cause updates to the page

    const getFilters = () => {
        console.log("getFilters()")
        // get filters from local storage
        // set SelectedFilters
    }

    const filterClick = (filter: Filter) => {
        console.log("filterClick()")
        // make a copy of SelectedFilters
        let sf: SelectedFilters = JSON.parse(JSON.stringify(selectedFilters))
        return (() => {
            sf = toggleFilter(filter, sf)
            setSelectedFilters(sf)
        })
    }

    const applyFilters = () => {
        console.log("applyFilters()")
        setApplyCounter(applyCounter + 1)
    }

    const saveParticipantGroup = () => {
        ParticipantGroupHelpers.saveParticipantGroup("group")
        setSaveCounter(saveCounter + 1)
    }

    const loadParticipantGroup = (groupName: string) => {
        ParticipantGroupHelpers.loadParticipantGroup(groupName)
        setLoadedGroup(groupName)
        setGroupCounter(groupCounter + 1)
    }

    const clearFilters = () => {
        setSelectedFilters({});
        applyFilters()
    }





    return (
        <div>
            {/* <pre>
                {JSON.stringify(cubeData.toJS(), undefined, 2)}
                {JSON.stringify(studyDict.toJS(), undefined, 2)}
            </pre> */}
            <ActionButton text={"Apply"} onClick={applyFilters} />
            <ActionButton text={"Save"} onClick={saveParticipantGroup} />
            <ActionButton text={"Clear"} onClick={clearFilters} />
            <ActionButton text={"Reset"} onClick={getFilters} />
            <FilterSummary filters={selectedFilters}/>
            <FilterDropdown dimension={"subject"} 
                            level={"age"} 
                            members={cubeData.getIn(["subject", "age"]).map((e)=>{return(e.label)})}
                            filterClick={filterClick} />
            <FilterDropdown dimension={"study"}
                            level={"species"}
                            members={cubeData.getIn(["study", "species"]).map((e)=>{return(e.label)})}
                            filterClick={filterClick} />
            <Barplot data={cubeData.getIn(["subject", "age"])} name={"age"} height={300} width={500} dataRange={[0,300]} labels={["0-10","11-20","21-30"]} /> 
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
