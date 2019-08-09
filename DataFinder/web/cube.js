var dfcube = LABKEY.query.olap.CubeManager.getCube({
    configId: 'DataFinder:/DataFinderCube',
    schemaName: 'immport',
    name: 'DataFinderCube',
    deferLoad: false,
    memberExclusionFields:["[Subject].[Subject]"]
});
var heatmapData;
var countFilter = [
    {
        level: "[Study].[Name]",
        membersQuery: {level: "[Data.Assay].[SampleType]", members: ["[Data.Assay].[Gene Expression].[0].[B cell]", "[Data.Assay].[Gene Expression].[0].[PBMC]"]}
    },
    {
        level: "[Study].[Name]",
        membersQuery: {level: "[Data.Assay].[Timepoint]", members: ["[Data.Assay].[HAI].[28]"]}
    },
    {
        level: "[Study].[Name]",
        membersQuery: {level: "[Subject.Age].[Age]", members: ["[Subject.Age].[> 70]"]}
    },

    {
        level: "[Study].[Name]",
        membersQuery: {level: "[Study].[Name]", members: ["[Study].[SDY1092]", "[Study].[SDY1119]", "[Study].[SDY1291]", "[Study].[SDY903]", "[Study].[SDY28]", "[Study].[SDY514]", "[Study].[SDY387]", "[Study].[SDY34]", "[Study].[SDY1370]", "[Study].[SDY1373]", "[Study].[SDY789]", "[Study].[SDY1260]", "[Study].[SDY1264]", "[Study].[SDY1276]", "[Study].[SDY1328]", "[Study].[SDY296]", "[Study].[SDY301]", "[Study].[SDY63]", "[Study].[SDY74]", "[Study].[SDY312]", "[Study].[SDY314]", "[Study].[SDY315]", "[Study].[SDY478]", "[Study].[SDY113]", "[Study].[SDY305]", "[Study].[SDY472]", "[Study].[SDY395]", "[Study].[SDY406]", "[Study].[SDY460]", "[Study].[SDY773]", "[Study].[SDY421]", "[Study].[SDY461]", "[Study].[SDY675]", "[Study].[SDY400]", "[Study].[SDY404]", "[Study].[SDY614]", "[Study].[SDY112]", "[Study].[SDY888]", "[Study].[SDY1109]", "[Study].[SDY67]", "[Study].[SDY61]", "[Study].[SDY508]", "[Study].[SDY517]", "[Study].[SDY520]", "[Study].[SDY640]", "[Study].[SDY144]", "[Study].[SDY162]", "[Study].[SDY167]", "[Study].[SDY18]", "[Study].[SDY180]", "[Study].[SDY207]", "[Study].[SDY820]", "[Study].[SDY887]", "[Study].[SDY269]", "[Study].[SDY1289]", "[Study].[SDY1293]", "[Study].[SDY1324]", "[Study].[SDY984]", "[Study].[SDY522]", "[Study].[SDY753]", "[Study].[SDY56]", "[Study].[SDY278]", "[Study].[SDY1294]", "[Study].[SDY1325]", "[Study].[SDY1364]", "[Study].[SDY1368]", "[Study].[SDY80]", "[Study].[SDY270]", "[Study].[SDY515]", "[Study].[SDY422]", "[Study].[SDY506]", "[Study].[SDY523]", "[Study].[SDY756]", "[Study].[SDY299]", "[Study].[SDY300]", "[Study].[SDY364]", "[Study].[SDY368]", "[Study].[SDY369]", "[Study].[SDY372]", "[Study].[SDY376]", "[Study].[SDY645]", "[Study].[SDY416]", "[Study].[SDY597]", "[Study].[SDY667]", "[Study].[SDY87]", "[Study].[SDY89]", "[Study].[SDY690]", "[Study].[SDY212]", "[Study].[SDY215]", "[Study].[SDY519]", "[Study].[SDY224]", "[Study].[SDY232]", "[Study].[SDY241]", "[Study].[SDY1041]", "[Study].[SDY1097]"]}
    }]

var cellSetHelper = {
    getRowPositions: function(cellSet) {
        return cellSet.axes[1].positions;
    },
    
    getRowPositionsOneLevel: function(cellSet) {
        var positions = cellSet.axes[1].positions;
        if (positions.length > 0 && positions[0].length > 1) {
        console.log("warning: rows have nested members");
        throw "illegal state";
        }
        return positions.map(function(inner) {
        return inner[0];
        });
    },
    
    getData: function(cellSet, defaultValue) {
        var cells = cellSet.cells;
        var ret;
        ret = cells.map(function(row) {
        return row.map(function(col) {
            return col.value ? col.value : defaultValue;
        });
        });
        return ret;
    },
    
    getDataOneColumn: function(cellSet, defaultValue) {
        var cells = cellSet.cells;
        if (cells.length > 0 && cells[0].length > 1) {
        console.log("warning cellSet has more than one column");
        throw "illegal state";
        }
        var ret;
        ret = cells.map(function(row) {
        return row[0].value ? row[0].value : defaultValue;
        });
        return ret;
    },

    getDataMapOneColumn: function(cellSet, defaultValue) {
        var cells=cellSet.cells;
        if (cells.length > 0 && cells[0].length > 1) {
            console.log("warning cellSet has more than one column");
            throw "illegal state";
            }
        var positions=this.getRowPositionsOneLevel(cellSet);
        var dataMap = new Object;
        cells.forEach((e, i) => {
            dataMap[positions[i].uniqueName] = e[0].value ? e[0].value : defaultValue
        });
        return dataMap
    }
};




dfcube.onReady(function(mdx){
    getHeatmapData(mdx, countFilter)
})


function getHeatmapData(mdx, countFilter) {
    var studyCells;
    var participantCells;
    mdx.query({
        "sql": true,
        configId: "DataFinder:/DataFinderCube",
        schemaName: 'immport',
        success: function(cs, mdx, config) {
            participantCells = cs; 
            mdx.query({
                "sql": true,
                configId: "DataFinder:/DataFinderCube",
                schemaName: 'immport',
                success: function(cs, mdx, config) {
                    studyCells = cs; 
                    heatmapData = formatHeatmapData(participantCells, studyCells);
                    console.log("About to render the heatmap!")
                    ReactDOM.render(
                        <div>
                            <AssayTpHeatmap data = {heatmapData} />
                        </div>,
                        document.getElementById("heatmap")
                    );
                },
                name: 'DataFinderCube',
                onRows: {level: "[Data.Assay].[Timepoint]", members: "members"},
                countFilter: countFilter,
                countDistinctLevel: "[Study].[Name]"
            })
        },
        name: 'DataFinderCube',
        onRows: {level: "[Data.Assay].[Timepoint]", members: "members"},
        countFilter: countFilter,
        countDistinctLevel: "[Subject].[Subject]"
    });
    function formatHeatmapData(participantCells, studyCells) {
        var hmd = new Array(participantCells.cells.length);
        var studyData = cellSetHelper.getDataMapOneColumn(studyCells, 0);
        var cells = participantCells.cells;
        cells.forEach((e, i) => {
            var uniqueName = e[0].positions[1][0].uniqueName;
            var levelInfo = dataAssayNameToInfo(uniqueName);
            hmd[i] = {
                studyCount : studyData[uniqueName],
                participantCount: e[0].value,
                timepoint: levelInfo.timepoint,
                assay: levelInfo.assay,
                sampleType: levelInfo.sampleType
            }
        })
        console.log("got the data")
        return(hmd)
    }
}

// map uniqueName to assay, timepoint, cell type
function dataAssayNameToInfo(name){
    var s = name.slice(13).split(/\./g).map(s => s.replace(/[\[\]]/g, ""))
    return (
        {assay: s[0], timepoint: s[1], sampleType: s[2]}
    )
}

