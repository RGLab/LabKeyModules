import "./DataFinder.scss";
import React, { memo } from 'react';
// import {olap} from '../olap/olap'
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
import { HeatmapSelector, SampleTypeCheckbox } from './components/HeatmapSelector';

interface DataFinderControllerProps {
    mdx: any
}

const DataFinderController: React.FC<DataFinderControllerProps> = (props: DataFinderControllerProps) => {
    // Constants -------------------------------------
    const mdx = props.mdx;
    const cd = new CubeData({})
    const sf = new SelectedFilters(JSON.parse(localStorage.getItem("dataFinderSelectedFilters")));

    // state -----
    const [cubeData, setCubeData] = React.useState<CubeData>(cd)
    const [studyDict, setStudyDict] = React.useState({}); // this should only be loaded once
    const [studyParticipantCounts, setStudyParticipantCounts] = React.useState<List<StudyParticipantCount>>(List())
    const [appliedFilters, setAppliedFilters] = React.useState<SelectedFilters>(sf)
    const [selectedFilters, setSelectedFilters] = React.useState<SelectedFilters>(appliedFilters)
    const [showSampleType, setShowSampleType] = React.useState<boolean>(false)

    // Listeners
    const [saveCounter, setSaveCounter] = React.useState<number>(0)
    const [applyCounter, setApplyCounter] = React.useState<number>(0)
    const [loadedGroup, setLoadedGroup] = React.useState<string>()
    const [groupCounter, setGroupCounter] = React.useState<number>(0);



    // Effects  -------------------------------------


    // Do these things only when the page loads --------
    React.useEffect(() => {
        // load data
        CubeHelpers.getStudyDict(mdx, appliedFilters).then((sd) => {
            setStudyDict(sd)
        })
    }, [])

    // Do these things when certain variables are incremented --------
    // Apply filters
    React.useEffect(() => {
        // set applied filters
        setAppliedFilters(selectedFilters)
        // set local storage
        localStorage.setItem("dataFinderSelectedFilters", JSON.stringify(selectedFilters))
    }, [applyCounter])

    React.useEffect(() => {
        // Update local state
        // separated from above effect so filters can pop up in banner before data is finished updating
        Promise.all([
            CubeHelpers.getStudyParticipantCounts(mdx, selectedFilters),
            CubeHelpers.getCubeData(mdx, selectedFilters)]
        ).then(
            ([spc, cd]) => {
                setStudyParticipantCounts(CubeHelpers.createStudyParticipantCounts(spc))
                setCubeData(CubeHelpers.createCubeData(cd))

            })
    }, [appliedFilters])

    React.useEffect(() => {
        CubeHelpers.getParticipantIds(mdx, selectedFilters).then((pids) =>
            ParticipantGroupHelpers.saveParticipantIdGroupInSession(pids)
        )
    }, [cubeData])


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
    const Banner = memo(FilterSummary)

    // ------ filter-related -------
    const getFilters = () => {
        console.log("getFilters()")
        // get filters from local storage
        // set SelectedFilters
    }

    const filterClick = (dim: string, filter: Filter) => {
        console.log("filterClick()")
        return (() => {
            const sf = toggleFilter(dim, filter.level, filter.member, selectedFilters)
            setSelectedFilters(sf)
        })
    }

    const applyFilters = () => {
        console.log("applyFilters()")
        setApplyCounter(applyCounter + 1)
    }

    const clearFilters = () => {
        setSelectedFilters(new SelectedFilters());
        applyFilters()
    }
    // ----------------

    // ----- participant group-related -----
    const saveParticipantGroup = () => {
        ParticipantGroupHelpers.saveParticipantGroup("group")
        setSaveCounter(saveCounter + 1)
    }

    const loadParticipantGroup = (groupName: string) => {
        ParticipantGroupHelpers.loadParticipantGroup(groupName)
        setLoadedGroup(groupName)
        setGroupCounter(groupCounter + 1)
    }


    // ------ Other ------
    const toggleSampleType = () => {
        setShowSampleType(!showSampleType)
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
            <Banner filters={appliedFilters} />
            <FilterDropdown
                key={"Subject"}
                dimension={"Subject"}
                level={"Age"}
                members={cubeData.getIn(["Subject", "Age"]).map((e) => { return (e.get("member")) })}
                filterClick={filterClick}
                selected={selectedFilters.Subject.get("Age")} />
            <FilterDropdown
                key={"study"}
                dimension={"study"}
                level={"species"}
                members={cubeData.getIn(["Study", "Species"]).map((e) => { return (e.get("member")) })}
                filterClick={filterClick}
                selected={selectedFilters.Study.get("Species")} />
            <Barplot data={cubeData.getIn(["Subject", "Age"]).toJS()} name={"Age"} height={200} width={500} dataRange={[0, 3000]} />

            <SampleTypeCheckbox
                toggleShowSampleType={toggleSampleType}
                showSampleType={showSampleType} />
            <HeatmapSelector
                data={cubeData.Data.toJS()}
                filterClick={filterClick}
                showSampleType={showSampleType}
                selected={selectedFilters.Data} />
            {studyParticipantCounts.map((sdy) => {
                if (sdy.participantCount > 0 && studyDict[sdy.studyName]) {
                    return (
                        <StudyCard key={sdy.studyName}
                            study={studyDict[sdy.studyName]}
                            participantCount={sdy.participantCount} />
                    )
                }
            })}
            <pre>{JSON.stringify(selectedFilters.toJS(), null, 2)}</pre>
        </div>
    )

}

export const App: React.FC = () => {

    const [cubeReady, setCubeReady] = React.useState(false)
    // debugger
    const dfcube = LABKEY.query.olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'DataFinder',
        name: 'DataFinderCube'
    })
    React.useEffect(() => {
        dfcube.onReady((mdx) => {
            setCubeReady(true)
        })
    }, [])

    if (cubeReady) {
        return <DataFinderController mdx={dfcube.mdx} />
    }
    return <div></div>
}
