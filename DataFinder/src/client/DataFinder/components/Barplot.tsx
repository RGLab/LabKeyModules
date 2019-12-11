import * as React from 'react';
import { drawBarplot } from './d3/Barplot'

import * as Cube from '../../typings/Cube'
import * as StudyCardTypes from '../../typings/StudyCard'
import * as Viz from '../../typings/Viz'
// Barplot ---------------------------------------- //
// Types 
interface BarplotControllerProps {
    dfcube: any;
    categories: BarplotCategories;
    countFilter: StudyCardTypes.Filter[];
    height: number;
    width: number;
}
export interface BarplotCategories {
    study: {
        unionArgs: {level: string}[];
        members: string[];
    },
    participant: {
        unionArgs: {level: string}[];
        members: string[];
    }
}


export const BarplotController: React.FC<BarplotControllerProps> = (props: BarplotControllerProps) => {
    if (props.categories.participant.unionArgs.length == 0) {
        return <div></div>
    }
    // Constants -------------------------------------
    const dfcube = props.dfcube;
    const countFilter = props.countFilter;
    const categories = props.categories;

    // State Variables -------------------------------------
    const [subjectData, setSubjectData] = React.useState<Viz.BarplotData>({})
    const [studyData, setStudyData] = React.useState<Viz.BarplotData>({})

    React.useEffect(() => {
        // Get the data from the cube
        dfcube.onReady((mdx) => {
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    const bpData = formatBarplotData(cs);
                    setSubjectData(bpData);
                },
                name: 'DataFinderCube',
                onRows: {
                    operator: "UNION",
                    arguments: props.categories.participant.unionArgs,
                    members: "members"
                },
                countFilter: countFilter,
                countDistinctLevel: "[Subject].[Subject]",
                showEmpty: true
            });
        })
        dfcube.onReady((mdx) => {
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs: Cube.CellSet, mdx, config) {
                    // console.log(cs)
                    const bpData = formatBarplotData(cs);
                    // console.log(bpData);
                    setStudyData(bpData);
                },
                name: 'DataFinderCube',
                onRows: {
                    operator: "UNION",
                    arguments: [
                        { level: "[Subject.Species].[Species]" },
                        { level: "[Study.Condition].[Condition]" },
                        { level: "[Subject.ExposureMaterial].[ExposureMaterial]"}
                    ],
                    members: "members"
                },
                countFilter: countFilter,
                countDistinctLevel: "[Study].[Name]",
                showEmpty: false
            });
        })
    }, [countFilter])


    function formatBarplotData(cs: Cube.CellSet) {
        const bpd = {
            age: [],
            race: [],
            gender: [],
            species: [],
            condition: [],
            material: []
        };
        const cells = cs.cells;
        cells.forEach((e, i) => {
            const uniqueName = e[0].positions[1][0].uniqueName;
            const label = uniqueName.split(/\./g).map(s => s.replace(/[\[\]]/g, ""))[2]
            if (/Age/.test(uniqueName)) {
                if (!bpd.hasOwnProperty("age")) bpd["age"] = [];
                bpd.age.push({
                    label: label,
                    value: e[0].value
                })
            } else if (/Race/.test(uniqueName)) {
                bpd.race.push({
                    label: label,
                    value: e[0].value
                })
            } else if (/Gender/.test(uniqueName)) {
                bpd.gender.push({
                    label: label,
                    value: e[0].value
                })
            } else if (/Species/.test(uniqueName)) {
                bpd.species.push({
                    label: label,
                    value: e[0].value
                })
            } else if (/Condition/.test(uniqueName)) {
                bpd.condition.push({
                    label: label,
                    value: e[0].value
                })
            } else if (/ExposureMaterial/.test(uniqueName)) {
                bpd.material.push({
                    label: label,
                    value: e[0].value
                })
            }
        })
        return (bpd)
    }
    let subjectPlots: JSX.Element = <div/>
    if (subjectData.hasOwnProperty("age")) {
        subjectPlots = 
            <div>
                <Barplot
                    data={subjectData.gender}
                    height={props.height}
                    name={"gender"}
                    width={props.width}
                    dataRange={[0,3500]}
                    labels = {["Unknown", "Other", "Male", "Female"]}
                />
                {/* <Barplot
                    data={subjectData.age}
                    height={props.height}
                    name={"age"}
                    width={props.width}
                    dataRange={[0,3500]}
                    labels = {["> 70", "61-70", "51-60", "41-50", "31-40", "21-30", "11-20", "0-10"]}
                />
                <Barplot
                    data={subjectData.race}
                    height={props.height}
                    name={"race"}
                    width={props.width}
                    dataRange={[0,3500]}
                    labels = {[ "American Indian or Alaska Native", "Asian", "Black or African American", "Native Hawaiian or Other Pacific Islander", "Not Specified", "Not_Specified", "Other", "Unknown", "White" ]}
                /> */}
            </div>
        
    } 
    
    let studyPlots: JSX.Element = <div/>
    if (studyData.hasOwnProperty("species")) {
        studyPlots = 
            <div>
                {/* <Barplot
                    data={studyData.species}
                    height={props.height}
                    name={"species"}
                    width={props.width}
                    dataRange={[0,30]}
                    labels = {["Homo Sapiens", "Mus Musculus"]}
                />
                <Barplot
                    data={studyData.condition}
                    height={props.height}
                    name={"condition"}
                    width={props.width}
                    dataRange={[0,30]}
                    labels = {[ "dengue disease", "Dengue hemorrhagic fever", "encephalitis", "Hepatitis C", "Meningitis", "meningoencephalitis", "Other", "West Nile encephalitits", "West Nile fever", "Zika fever", "Zika virus disease" ]}
                /> */}
                {/* <Barplot
                    data={studyData.material}
                    height={props.height}
                    name={"exposure-material"}
                    width={props.width}
                    dataRange={[0,30]}
                    labels = {[]}
                /> */}
            </div>
        
    } 
    return (
        <div>
            {subjectPlots}
            {studyPlots}
        </div>
    )
}

// render the d3 barplot element
const Barplot: React.FC<Viz.BarplotProps> = (props) => {
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

