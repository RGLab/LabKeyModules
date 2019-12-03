import * as React from 'react';
import * as LABKEY from '@labkey/api';
import { olap } from '../olap/olap.js'
import { StudyCard } from './components/StudyCard'
import { BarplotController } from './components/Barplot'
import * as Cube from '../typings/Cube'
import * as StudyCardTypes from '../typings/StudyCard'
import { HeatmapDatum } from '../typings/Viz'

const DataFinderController: React.FC = () => {
    // Constants -------------------------------------
    const studyFilter: StudyCardTypes.Filter = {
        level: "[Study].[Name]",
        membersQuery: { level: "[Study].[Name]", members: ["[Study].[SDY1092]", "[Study].[SDY1119]", "[Study].[SDY1291]", "[Study].[SDY903]", "[Study].[SDY28]", "[Study].[SDY514]", "[Study].[SDY387]", "[Study].[SDY34]", "[Study].[SDY1370]", "[Study].[SDY1373]", "[Study].[SDY789]", "[Study].[SDY1260]", "[Study].[SDY1264]", "[Study].[SDY1276]", "[Study].[SDY1328]", "[Study].[SDY296]", "[Study].[SDY301]", "[Study].[SDY63]", "[Study].[SDY74]", "[Study].[SDY312]", "[Study].[SDY314]", "[Study].[SDY315]", "[Study].[SDY478]", "[Study].[SDY113]", "[Study].[SDY305]", "[Study].[SDY472]", "[Study].[SDY395]", "[Study].[SDY406]", "[Study].[SDY460]", "[Study].[SDY773]", "[Study].[SDY421]", "[Study].[SDY461]", "[Study].[SDY675]", "[Study].[SDY400]", "[Study].[SDY404]", "[Study].[SDY614]", "[Study].[SDY112]", "[Study].[SDY888]", "[Study].[SDY1109]", "[Study].[SDY67]", "[Study].[SDY61]", "[Study].[SDY508]", "[Study].[SDY517]", "[Study].[SDY520]", "[Study].[SDY640]", "[Study].[SDY144]", "[Study].[SDY162]", "[Study].[SDY167]", "[Study].[SDY18]", "[Study].[SDY180]", "[Study].[SDY207]", "[Study].[SDY820]", "[Study].[SDY887]", "[Study].[SDY269]", "[Study].[SDY1289]", "[Study].[SDY1293]", "[Study].[SDY1324]", "[Study].[SDY984]", "[Study].[SDY522]", "[Study].[SDY753]", "[Study].[SDY56]", "[Study].[SDY278]", "[Study].[SDY1294]", "[Study].[SDY1325]", "[Study].[SDY1364]", "[Study].[SDY1368]", "[Study].[SDY80]", "[Study].[SDY270]", "[Study].[SDY515]", "[Study].[SDY422]", "[Study].[SDY506]", "[Study].[SDY523]", "[Study].[SDY756]", "[Study].[SDY299]", "[Study].[SDY300]", "[Study].[SDY364]", "[Study].[SDY368]", "[Study].[SDY369]", "[Study].[SDY372]", "[Study].[SDY376]", "[Study].[SDY645]", "[Study].[SDY416]", "[Study].[SDY597]", "[Study].[SDY667]", "[Study].[SDY87]", "[Study].[SDY89]", "[Study].[SDY690]", "[Study].[SDY212]", "[Study].[SDY215]", "[Study].[SDY519]", "[Study].[SDY224]", "[Study].[SDY232]", "[Study].[SDY241]", "[Study].[SDY1041]", "[Study].[SDY1097]"] }
    }

    // State variables -------------------------------------
    const [filterUpdate, setFilterUpdate] = React.useState<number>(0);
    const [studyDict, setStudyDict] = React.useState<StudyCardTypes.StudyDict>({});
    const [inputText, setInputText] = React.useState<string>('[{"level": "[Subject].[Subject]","membersQuery": {"level": "[Subject.Age].[Age]", "members": "[Subject.Age].[> 70]"}}]');
    const [filters, setFilters] = React.useState<StudyCardTypes.Filter[]>([studyFilter]);
    const [dfcube, setCube] = React.useState(olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'immport',
        name: 'DataFinderCube',
        deferLoad: false,
        // console.log(olap.CubeManager.getCube({
        //     configId: 'DataFinder:/DataFinderCube',
        //     schemaName: 'immport',
        //     name: 'DataFinderCube',
        //     deferLoad: false,
        //     memberExclusionFields: ["[Subject].[Subject]"]
        // }))
        memberExclusionFields: ["[Subject].[Subject]"]
    }))
    const [selectedStudiesArray, setSelectedStudiesArray] = React.useState<StudyCardTypes.CurrentStudyInfo[]>([])
    const [barplotCategories, setBarplotCategories] = React.useState(
        {
            study: { unionArgs: [], members: [] },
            participant: { unionArgs: [], members: [] }
        })
    // Effects  -------------------------------------

    React.useEffect(() => {
        // Submit the example filters when the page loads
        submitFilters()
        // Get categories for barplots
        const studyUnionArgs = [
            { level: "[Subject.Species].[Species]" },
            { level: "[Study.Condition].[Condition]" },
            { level: "[Subject.ExposureMaterial].[ExposureMaterial]" }
        ]
        const participantUnionArgs = [
            { level: "[Subject.Age].[Age]" },
            { level: "[Subject.Race].[Race]" },
            { level: "[Subject.Gender].[Gender]" }
        ]
        // subject-level
        dfcube.onReady((mdx) => {
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    const members = cs.axes[1].positions.map((position) => {
                        return(position[0].uniqueName)
                    })
                    const bpc = barplotCategories;
                    bpc.participant = {
                        unionArgs: participantUnionArgs,
                        members: members
                    }
                    setBarplotCategories(bpc)
                },
                name: 'DataFinderCube',
                onRows: {
                    operator: "UNION",
                    arguments: participantUnionArgs,
                    members: "members"
                },
                countFilter: [studyFilter],
                countDistinctLevel: "[Subject].[Subject]",
                showEmpty: false
            });
        })
        // study-level
        dfcube.onReady((mdx) => {
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    const members = cs.axes[1].positions.map((position) => {
                        return(position[0].uniqueName)
                    })
                    const bpc = barplotCategories;
                    bpc.study = {
                        unionArgs: studyUnionArgs,
                        members: members
                    }
                    setBarplotCategories(bpc)
                },
                name: 'DataFinderCube',
                onRows: {
                    operator: "UNION",
                    arguments: studyUnionArgs,
                    members: "members"
                },
                countFilter: [studyFilter],
                countDistinctLevel: "[Study].[Name]",
                showEmpty: false
            });
        })
    }, [])

    // Update data every time the filter update button is clicked
    React.useEffect(() => {

        dfcube.onReady((mdx) => {
            Promise.all([getTheData(mdx), getSelectedParticipants(mdx, filters)])
                .then((values) => {
                    setStudyDict(values[0])
                    const selectedStudies = getSelectedStudiesArray(values[0], values[1]);
                    setSelectedStudiesArray(selectedStudies);
                })
        })

    }, [filterUpdate])

    // Other Setup -------------------------------------

    // Helper Functions -------------------------------------

    // keep inputText up-to-date with any changes to the text box
    function handleInputChange(event) {
        setInputText(event.target.value);
    }

    function clearFilters() {
        setInputText("[]")
        const allFilters = [studyFilter];
        setFilters(allFilters);
        setFilterUpdate(filterUpdate + 1);
    }

    function resetFilters() {
        const text = '[{"level": "[Subject].[Subject]","membersQuery": {"level": "[Subject.Age].[Age]", "members": "[Subject.Age].[> 70]"}}]'
        setInputText(text);
        const parsedFilters = JSON.parse(text);
        const allFilters: StudyCardTypes.Filter[] = [studyFilter, ...parsedFilters];
        setFilters(allFilters);
        setFilterUpdate(filterUpdate + 1);
    }

    function submitFilters() {
        // Parse filters, update filters in state and increment filterupdate counter to 
        // set off new study data query
        const parsedFilters = JSON.parse(inputText);
        const allFilters: StudyCardTypes.Filter[] = [studyFilter, ...parsedFilters];
        setFilters(allFilters);
        setFilterUpdate(filterUpdate + 1);
    }

    // helper function which combines studies and selected participants to get
    // an array with info about currently selected studies
    function getSelectedStudiesArray(studies: StudyCardTypes.StudyDict, selectedParticipants: StudyCardTypes.SelectedStudies) {
        const selectedStudies = {};
        Object.keys(selectedParticipants).map((e, i) => {
            const studyName = e;
            selectedStudies[studyName] = {};
            selectedStudies[studyName] = { ...selectedParticipants[studyName], ...studies[studyName] }
        })
        const selectedStudiesArray: StudyCardTypes.CurrentStudyInfo[] = Object["values"](selectedStudies);
        return selectedStudiesArray;
    }

    // Returns a promise which will get studyDict with all the static info about studies
    function getTheData(mdx) {

        // return cached data if it has already been loaded
        if (studyDict.hasOwnProperty("SDY269")) {
            return studyDict;
        }

        // define a promise to get info from query
        const studyInfo = new Promise<SelectRowsResponse>((resolve, reject) => {
            LABKEY.Query.selectRows({
                schemaName: 'immport',
                queryName: 'dataFinder_studyCard',
                success: (data: SelectRowsResponse) => { resolve(data) }
            })
        })

        // Define a promise to get study counts
        const studyCounts = new Promise<Cube.CellSet>((resolve, reject) => {
            mdx.query({
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    resolve(cs);
                },
                name: 'DataFinderCube',
                onRows: { level: "[Study].[Name]", members: "members" },
                onCols: {
                    operator: "UNION",
                    arguments: [
                        { level: "[Subject].[(All)]", members: "members" },
                        { level: "[Data.Assay].[Timepoint]", members: "members" }
                    ]
                },
                countFilter: [studyFilter],
                countDistinctLevel: "[Subject].[Subject]",
                showEmpty: false

            })
        })

        // combine results after they have all been loaded
        // Return the promise which will return results once completed
        return Promise.all([studyInfo, studyCounts]).then((values) => {
            // combine results and return them
            const studyInfo = values[0];
            const studyCounts = values[1]
            const studyDict: StudyCardTypes.StudyDict = {};
            studyInfo.rows.map((e, i) => {
                const studyInfo: StudyCardTypes.StaticStudyInfo = {}
                const studyName = e.study_accession;
                studyDict[studyName] = studyInfo;
                studyDict[studyName] = { ...e }
            })
            // console.log(studyCounts)
            studyCounts.axes[1].positions.map((e, i) => {
                const studyName = e[0].name;
                const totalParticipantCount = studyCounts.cells[i][0].value;
                if (studyDict.hasOwnProperty(studyName)) {
                    studyDict[studyName] = { totalParticipantCount, ...studyDict[studyName] }
                    studyDict[studyName].heatmapData = studyCounts.axes[0].positions.map((f, j) => {
                        // if (j > 0) {
                        const positionInfo = dataAssayNameToInfo(f[0].uniqueName, true)
                        const positionCount = studyCounts.cells[i][j].value;
                        const heatmapDatum: HeatmapDatum = { ...positionInfo, count: positionCount };
                        return heatmapDatum
                        // }

                    })
                }
            })

            //console.log(studyDict)
            function dataAssayNameToInfo(name: string, shortAssayNames: boolean = false) {
                if (/(All)/.test(name)) { return { assay: undefined, timepoint: undefined, sampleType: undefined } }
                const s = name.slice(13).split(/\./g).map(s => s.replace(/[\[\]]/g, ""))
                const info = { assay: s[0], timepoint: s[1], sampleType: s[2] }
                if (shortAssayNames) {
                    const shortAssayNameMap = {
                        "PCR": "PCR",
                        "Neutralizing Antibody": "NAb",
                        "MBAA": "MBAA",
                        "HLA Typing": "HLA",
                        "HAI": "HAI",
                        "Gene Expression": "GE",
                        "Flow Cytometry": "Flow",
                        "ELISPOT": "ELISPOT",
                        "ELISA": "ELISA",
                        "CyTOF": "CyTOF",
                        "KIR": "KIR"
                    }
                    info.assay = shortAssayNameMap[info.assay];
                }
                return (
                    info
                )
            }
            return studyDict
        })
    }

    // Returns a promise which will get selected participants per study based on filter
    function getSelectedParticipants(mdx, countFilter: StudyCardTypes.Filter[]) {

        const selectedParticipants = new Promise<StudyCardTypes.SelectedStudies>((resolve, reject) => {
            mdx.query({
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    // console.log(cs);
                    const selectedStudies: StudyCardTypes.SelectedStudies = {};
                    cs.axes[1].positions.map((e, i) => {
                        const studyName = e[0].name;
                        const selectedParticipantCount = cs.cells[i][0].value
                        selectedStudies[studyName] = {}
                        selectedStudies[studyName] = { selectedParticipantCount }
                    })
                    // console.log(selectedStudies)
                    resolve(selectedStudies);

                },
                name: 'DataFinderCube',
                onRows: { level: "[Study].[Name]", members: "members" },
                countFilter: [
                    countFilter
                ],
                countDistinctLevel: "[Subject].[Subject]",
                showEmpty: false

            })
        })
        return selectedParticipants;
    }

    // Render everything
    // TODO:  Use the same controller for BarplotController
    const colstyle: React.CSSProperties = {
        width: '45%',
        padding: '5px',
        display: 'inline-block'
    }
    return (
        <div>
            <div>
                <div style={colstyle}>
                    <div >
                        <label>Filters:</label>
                        <button onClick={submitFilters}>Submit</button>
                        <button onClick={resetFilters}>Reset</button>
                        <button onClick={clearFilters}>Clear</button>
                    </div>
                    <div >
                        <textarea value={inputText} onChange={handleInputChange} rows={10} cols={50} />
                    </div>
                </div>
                <div style={colstyle}>
                    <BarplotController dfcube={dfcube} categories = {barplotCategories} countFilter={filters} width={400} height={200} />
                </div>
            </div>
            <div id="df-study-panel">
                {selectedStudiesArray.map((study) => {
                    return (
                        <StudyCard key={study.study_accession} study={study} />
                    )

                })}
            </div>
        </div>
    )

}



export function App() {

    return <DataFinderController />

}
