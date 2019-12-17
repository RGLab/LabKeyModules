import React from 'react';
import { olap } from '../olap/olap.js'
import { CubeData, Filter } from '../typings/CubeData';
import { Barplot } from './components/Barplot'
import { createCubeData, createStudyDict, getStudyParticipantCounts } from './helpers/CubeHelpers'
import { SelectedFilters } from '../typings/CubeData'
import { toggleFilter } from './helpers/SelectedFilters';
import { FilterDropdown } from './components/FilterDropdown';
import { string } from 'prop-types';
import { StudyParticipantCount } from '../typings/StudyCard'
import { StudyCard } from './components/StudyCard'
import { ParticipantGroup } from '@labkey/api';
import { getStudyNabGraphURL } from '@labkey/api/dist/labkey/Assay';

interface DataFinderControllerProps {
    mdx: any
}


const DataFinderController: React.FC<DataFinderControllerProps> = (props: DataFinderControllerProps) => {
    // Constants -------------------------------------
    const mdx = props.mdx;
    const emptyCubeData: CubeData = {
        subject: {
            race: [],
            age: [],
            gender: []
        },
        study: {
            name: [],
            program: [],
            condition: [],
            species: [],
            exposureMaterial: [],
            exposureProcess: []
        },
        data: {
            assay: {
                assay: [],
                timepoint: [],
                sampleType: []
            },
            timepoint: [],
            sampleType: []
        }
    }


    // State variables -------------------------------------
    // Data objects (model)
    const [SelectedFilters, setSelectedFilters] = React.useState<SelectedFilters>({})
    const [CubeData, setCubeData] = React.useState(emptyCubeData)
    const [StudyDict, setStudyDict] = React.useState({})
    const [StudyParticipantCounts, setStudyParticipantCounts] = React.useState<StudyParticipantCount[]>([])

    // Listeners
    const [saveCounter, setSaveCounter] = React.useState<number>(0)
    const [applyCounter, setApplyCounter] = React.useState<number>(0)
    const [loadedGroup, setLoadedGroup] = React.useState<string>()
    const [groupCounter, setGroupCounter] = React.useState<number>(0);

    // Effects  -------------------------------------

    // Do these things only when the page loads
    React.useEffect(() => {
        // get filters from localStorage
        // load data
        createStudyDict(mdx, SelectedFilters).then((sd) => {
            setStudyDict(sd)
            console.log(StudyDict)
            applyFilters()}
         )
    }, [])

    // Do these things when certain variables are incremented 
    // Apply filters
    React.useEffect(() => {
        // set local storage
        // call to sessionParticipantGroup.api
         // write this asychronosouly? 
         const cd = createCubeData(mdx, SelectedFilters)
         setCubeData(cd)
         const spc = getStudyParticipantCounts(mdx, SelectedFilters)
         setStudyParticipantCounts(spc)
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

    const filterClick = (filter: Filter) => {
        // make a copy of SelectedFilters
        let sf: SelectedFilters = JSON.parse(JSON.stringify(SelectedFilters))
        return(() => {
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
            {/* banner */}
            <Barplot data={CubeData.subject.age} name={"age"} height={300} width={500} dataRange={[0,300]} labels={["0-10","11-20","21-30"]} /> 
            <FilterDropdown dimension={"subject"} 
                            level={"age"} 
                            members={CubeData.subject.age.map((e)=>{return(e.label)})}
                            filterClick={filterClick} />
            <FilterDropdown dimension={"study"}
                            level={"species"}
                            members={CubeData.study.species.map((e)=>{return(e.label)})}
                            filterClick={filterClick} />
            <span>{JSON.stringify(SelectedFilters)}</span>
            {StudyParticipantCounts.map((sdy) => {
                if(sdy.participantCount > 0 && StudyDict[sdy.studyName]) {
                    return(
                        <StudyCard key={sdy.studyName} study={StudyDict[sdy.studyName]} participantCount={sdy.participantCount} />
                    )
                }

            })}
            {/* various buttons */}
            {/* query summary text */}
            {/* heatmap selector */ }
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

interface TestTextProps {
    sf: SelectedFilters;
}

const TestText: React.FC<TestTextProps> = (props) => {
    return(
        <span>{JSON.stringify(props.sf)}</span>
    )
}