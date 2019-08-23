const rootElement = document.getElementById('study-panel')

function DataFinderController(props) {
    const studyFilter = {
        level: "[Study].[Name]",
        membersQuery: { level: "[Study].[Name]", members: ["[Study].[SDY1092]", "[Study].[SDY1119]", "[Study].[SDY1291]", "[Study].[SDY903]", "[Study].[SDY28]", "[Study].[SDY514]", "[Study].[SDY387]", "[Study].[SDY34]", "[Study].[SDY1370]", "[Study].[SDY1373]", "[Study].[SDY789]", "[Study].[SDY1260]", "[Study].[SDY1264]", "[Study].[SDY1276]", "[Study].[SDY1328]", "[Study].[SDY296]", "[Study].[SDY301]", "[Study].[SDY63]", "[Study].[SDY74]", "[Study].[SDY312]", "[Study].[SDY314]", "[Study].[SDY315]", "[Study].[SDY478]", "[Study].[SDY113]", "[Study].[SDY305]", "[Study].[SDY472]", "[Study].[SDY395]", "[Study].[SDY406]", "[Study].[SDY460]", "[Study].[SDY773]", "[Study].[SDY421]", "[Study].[SDY461]", "[Study].[SDY675]", "[Study].[SDY400]", "[Study].[SDY404]", "[Study].[SDY614]", "[Study].[SDY112]", "[Study].[SDY888]", "[Study].[SDY1109]", "[Study].[SDY67]", "[Study].[SDY61]", "[Study].[SDY508]", "[Study].[SDY517]", "[Study].[SDY520]", "[Study].[SDY640]", "[Study].[SDY144]", "[Study].[SDY162]", "[Study].[SDY167]", "[Study].[SDY18]", "[Study].[SDY180]", "[Study].[SDY207]", "[Study].[SDY820]", "[Study].[SDY887]", "[Study].[SDY269]", "[Study].[SDY1289]", "[Study].[SDY1293]", "[Study].[SDY1324]", "[Study].[SDY984]", "[Study].[SDY522]", "[Study].[SDY753]", "[Study].[SDY56]", "[Study].[SDY278]", "[Study].[SDY1294]", "[Study].[SDY1325]", "[Study].[SDY1364]", "[Study].[SDY1368]", "[Study].[SDY80]", "[Study].[SDY270]", "[Study].[SDY515]", "[Study].[SDY422]", "[Study].[SDY506]", "[Study].[SDY523]", "[Study].[SDY756]", "[Study].[SDY299]", "[Study].[SDY300]", "[Study].[SDY364]", "[Study].[SDY368]", "[Study].[SDY369]", "[Study].[SDY372]", "[Study].[SDY376]", "[Study].[SDY645]", "[Study].[SDY416]", "[Study].[SDY597]", "[Study].[SDY667]", "[Study].[SDY87]", "[Study].[SDY89]", "[Study].[SDY690]", "[Study].[SDY212]", "[Study].[SDY215]", "[Study].[SDY519]", "[Study].[SDY224]", "[Study].[SDY232]", "[Study].[SDY241]", "[Study].[SDY1041]", "[Study].[SDY1097]"] }
    }
    const [studyDict, setStudyDict] = React.useState({});
    const [selectedParticipantCounts, setSelectedParticipantCounts] = React.useState({});
    const [inputText, setInputText] = React.useState('[{"level": "[Subject].[Subject]","membersQuery": {"level": "[Subject.Age].[Age]", "members": "[Subject.Age].[> 70]"}}]');
    const [filters, setFilters] = React.useState([studyFilter]);
    const [dfcube, setCube] = React.useState(LABKEY.query.olap.CubeManager.getCube({
        configId: 'DataFinder:/DataFinderCube',
        schemaName: 'immport',
        name: 'DataFinderCube',
        deferLoad: false,
        memberExclusionFields: ["[Subject].[Subject]"]
    }))
    const [selectedStudiesArray, setSelectedStudiesArray] = React.useState([])


    function handleInputChange(event) {
        setInputText(event.target.value);
    }

    function submitFilters() {
        const parsedFilters = JSON.parse(inputText);
        const allFilters = [studyFilter, ...parsedFilters];
        setFilters(allFilters);
        console.log("updating participant counts")
        dfcube.onReady((mdx) => {
            console.log("really updating those counts now...")
            getSelectedParticipants(mdx, filters)
                .then((selectedParticipants) => {
                    setSelectedParticipantCounts(selectedParticipants);
                    console.log("selectedParticipants")
                    console.log(selectedParticipants)
                }).then(() => {
                    getSelectedStudiesArray();
                })
        })
    }

    function getSelectedStudiesArray() {
        const selectedStudies = {};
        Object.keys(selectedParticipantCounts).map((e, i) => {
            const studyName = e;
            selectedStudies[studyName] = {};
            selectedStudies[studyName] = { ...selectedParticipantCounts[studyName], ...studyDict[studyName] }
        })
        setSelectedStudiesArray(Object.values(selectedStudies));
        console.log("SelectedStudiesArray")
        console.log(selectedStudiesArray)
    }

    // console.log("studyDict")
    // console.log(studyDict)
    // console.log("selectedParticipantCounts")
    // console.log(selectedParticipantCounts);
    // console.log("selectedStudiesArray")
    // console.log(selectedStudiesArray);



    React.useEffect(() => {
        dfcube.onReady((mdx) => {
            getTheData(mdx).then((theData) => {
                setStudyDict(theData);
                return getSelectedParticipants(mdx, filters);
            }).then((selectedParticipants) => {
                setSelectedParticipantCounts(selectedParticipants);
            }).then(() => {
                submitFilters();
            }).then(() => {
                getSelectedStudiesArray()
            })
        })

    }, [])


    // Whenever a filter changes, just update selectedParticipantCounts

    function getTheData(mdx) {
        console.log("getting the data")

        // define a promise to get the first state
        const studyInfo = new Promise((resolve, reject) => {
            LABKEY.Query.selectRows({
                schemaName: 'immport',
                queryName: 'dataFinder_studyCard',
                success: (data) => { resolve(data) }
            })
        })

        const studyCounts = new Promise((resolve, reject) => {
            mdx.query({
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs, mdx, config) {
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

        // combine results after they have all been loaded (using Promise.all...?)
        // combine results and return
        return Promise.all([studyInfo, studyCounts]).then((values) => {
            // combine results and return them
            const studyInfo = values[0];
            const studyCounts = values[1]
            const studyDict = {};
            studyInfo.rows.map((e, i) => {
                const studyName = e.study_accession;
                studyDict[studyName] = {}
                studyDict[studyName] = { ...e }
            })
            studyCounts.axes[1].positions.map((e, i) => {
                const studyName = e[0].name;
                const totalParticipantCount = studyCounts.cells[i][0].value;
                if (studyDict.hasOwnProperty(studyName)) {
                    studyDict[studyName] = { totalParticipantCount, ...studyDict[studyName] }
                    studyDict[studyName].otherFunInfo = studyCounts.axes[0].positions.map((f, j) => {
                        if (j > 0) {
                            const positionInfo = dataAssayNameToInfo(f[0].uniqueName)
                            const positionCount = studyCounts.cells[i][j].value;
                            return { ...positionInfo, count: positionCount }
                        }

                    })
                }
            })

            //console.log(studyDict)
            function dataAssayNameToInfo(name) {
                var s = name.slice(13).split(/\./g).map(s => s.replace(/[\[\]]/g, ""))
                return (
                    { assay: s[0], timepoint: s[1], sampleType: s[2] }
                )
            }
            return studyDict
        })
    }

    function getSelectedParticipants(mdx, countFilter) {

        const selectedParticipants = new Promise((resolve, reject) => {
            mdx.query({
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs, mdx, config) {
                    const selectedStudies = {};
                    cs.axes[1].positions.map((e, i) => {
                        const studyName = e[0].name;
                        const selectedParticipantCount = cs.cells[i][0].value
                        selectedStudies[studyName] = {}
                        selectedStudies[studyName] = { selectedParticipantCount, ...studyDict[studyName] }
                    })
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

    return (
        <div>
            <div>
                <BarplotController dfcube={dfcube} countFilter={filters} />
            </div>
            <div>
                <label>
                    Filters:
                </label>
                <button onClick={submitFilters}>Submit</button>
                <textarea value={inputText} onChange={handleInputChange} rows="10" cols="50" />
                <br />
                <br />
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

function StudyProperty(props) {
    const labelStyle = {
        fontWeight: "bold",
    }
    return (
        <p className="card-text"><span style={labelStyle}>{props.label}: </span>{props.value}</p>
    )
}

function StudyProperties(props) {

    return (
        props.studyProperties.map((property) => {
            return (
                <StudyProperty key={property.label} label={property.label} value={property.value} />
            )
        })
    )

}

function StudyProgressBar(props) {
    const pbarStyle = {
        width: (props.selectedParticipantCount / props.totalParticipantCount * 100) + "%"
    }
    return (
        <div>
            <div className="progress">
                <div className="progress-bar"
                    role="progressbar"
                    aria-valuenow={props.selectedParticipantCount}
                    aria-valuemin="0"
                    aria-valuemax={props.totalParticipantCount}
                    style={pbarStyle}>
                </div>
            </div>
            <p>
                <em>{props.selectedParticipantCount} of {props.totalParticipantCount} participants selected.</em>
            </p>
        </div>
    )
}

function StudyCard(props) {
    const study = props.study;
    const studyProperties = [
        {
            label: "Condition",
            value: study.condition_studied
        },
        {
            label: "Sample Type",
            value: study.sample_type[0]
        },
        {
            label: "Assays",
            value: study.assays[0]
        }
    ]

    return (
        <div className="study-card">
            <div className="study-label">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="study" value="SDY28" />
                        <span className="study-id">{study.study_accession}</span>
                    </label>
                </div>
                <span className="study-pi">{study.pi_names}</span>
            </div>
            <hr />
            <a href={"./" + study.study_accession + "/begin.view?"} className="labkey-text-link labkey-study-card-goto">
                Go to study
            </a>
            <div className="study-title">
                {study.brief_title}
            </div>
            <StudyProgressBar totalParticipantCount={study.totalParticipantCount} selectedParticipantCount={study.selectedParticipantCount} />
            <StudyProperties studyProperties={studyProperties} />
            {/* <TinyHeatmap data={props.data}/> */}
        </div>
    )
}

// React stuff ==================================== //

function BarplotController(props) {
    const dfcube = props.dfcube;
    const countFilter = props.countFilter;
    const [data, setData] = React.useState([])

    React.useEffect(() => {
        // Get the data from the cube
        dfcube.onReady((mdx) => {
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function (cs, mdx, config) {
                    console.log(cs);
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

    function formatBarplotData(cs) {
        var bpd = new Array(cs.cells.length);
        var cells = cs.cells;
        cells.forEach((e, i) => {
            var uniqueName = e[0].positions[1][0].uniqueName;
            var label = uniqueName.split(/\./g).map(s => s.replace(/[\[\]]/g, ""))[2]
            bpd[i] = {
                label: label,
                value: e[0].value
            }
        })
        console.log("got the data")
        return (bpd)
    }

    return (
        <div>
            <Barplot
                data={data}
                height={250}
                name={"gender"}
                width={800}
            />
        </div>
    );
}
// console.log(BarplotController);

function Barplot(props) {
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


// ================================================================== //
/* 
This is a barplot component which takes the following arguments in 
the props: 
  * data
  * name (id for the div to stick it in)
  * width
  * height

*/

function drawBarplot(props) {
    const data = props.data;
    const name = props.name;
    const labels = [];
    const dataRange = [0, 0];

    data.map((e, i) => {
        labels.push(e.label);
        if (e.value > dataRange[1]) dataRange[1] = e.value;
    });


    var svg = d3
        .select("#barplot-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "barplot-" + name);

    // Create margins
    var margin = { top: 20, right: 0, bottom: 40, left: 175 },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;

    // Set scales using options

    var yaxisScale = d3
        .scaleLinear()
        .domain([0, 3500])
        .range([height, 0]);

    var xaxisScale = d3
        .scaleBand()
        .domain(labels)
        .range([0, width]);

    // Create body and axes
    // svg.append("g")
    //     .call(d3.axisLeft(yaxisScale));

    // svg.append("g")
    //     .call(d3.axisBottom(xaxisScale));

    if (svg.selectAll("g").empty()) {



        var barplot = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "barplot" + name);
        svg.append("g")
            .attr("id", "xaxis-labels")
            .attr(
                "transform",
                "translate(" + margin.left + ", " + (height + margin.top) + ")"
            )
            .call(d3.axisBottom(xaxisScale));

        svg.append("g")
            .attr("id", "yaxis-labels")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.axisLeft(yaxisScale));
    } else {
        var barplot = svg.select("#barplot" + name)
    }



    // add data
    var boxes = barplot.selectAll("rect").data(data);
    boxes
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return xaxisScale(d.label);
        })
        .attr("width", xaxisScale.bandwidth() - 5)
        .attr("y", function (d) {
            return yaxisScale(d.value);
        })
        .attr("height", function (d) {
            return height - yaxisScale(d.value);
        })
        .style("fill", "steelblue")
    boxes
        .transition()
        .duration(300)
        .attr("x", function (d) {
            return xaxisScale(d.label);
        })
        .attr("width", xaxisScale.bandwidth() - 5)
        .attr("y", function (d) {
            return yaxisScale(d.value);
        })
        .attr("height", function (d) {
            return height - yaxisScale(d.value);
        })

    boxes.exit().remove();
}




ReactDOM.render(<DataFinderController />, rootElement);