import * as Cube from '../typings/Cube'

// Cube
const onRowsRequests = {
    getStudyCounts: { level: "[Study].[Name]", members: "members" },
    getStudyParticipantCounts: {
        operator: "UNION",
        arguments: [
            { level: "[Study].[Name]", members: "members" },
            { level: "[Subject].[Subject]", members: "members" }
        ]
    },
    getCubeData: {
        operator: "UNION",
        arguments: [
            { level: "[Subject.Race].[Race]" },
            { level: "[Subject.Age].[Age]" },
            { level: "[Subject.Gender].[Gender]" },
            { level: "[Subject.ExposureMaterial].[ExposureMaterial]" },
            { level: "[Subject.ExposureProcess].[ExposureProcess]" },
            { level: "[Subject.Species].[Species]" },
            { level: "[Study.Condition].[Condition]" },
            { level: "[Study.ResearchFocus].[ResearchFocus]" },
            { level: "[Data.Assay].[Assay]" },
            { level: "[Data.Assay].[Timepoint]" },
            { level: "[Data.Assay].[SampleType]" },
            { level: "[Data.Timepoint].[Timepoint]" },
            { level: "[Data.SampleType].[SampleType]" },
            { level: "[Data.SampleType].[Assay]" },
            { level: "[Study].[Name]"}
        ]
    },
    getTotalCounts_Study: {
        level: "[Study].[(All)]", members: "members"
    },
    getTotalCounts_Subject: {
        level: "[Subject].[(All)]", members: "members"
    }
}

export const mdx: Cube.CubeMdx = {
    query : config => {
        let cs;
        if (JSON.stringify(config.onRows) == JSON.stringify(onRowsRequests.getStudyCounts)) cs = "getStudyCounts cellSet";
        if (JSON.stringify(config.onRows) == JSON.stringify(onRowsRequests.getStudyParticipantCounts)) cs = "getStudyParticipantCounts cellSet";
        if (JSON.stringify(config.onRows) == JSON.stringify(onRowsRequests.getCubeData) && config.countDistinctLevel == "[Study].[Name]") cs = "getCubeData_Study cellSet"
        if (JSON.stringify(config.onRows) == JSON.stringify(onRowsRequests.getCubeData) && config.countDistinctLevel == "[Subject].[Subject]") cs = "getCubeData_Subject cellSet"
        if (JSON.stringify(config.onRows) == JSON.stringify(onRowsRequests.getTotalCounts_Study)) cs = "getTotalCounts_Study cellSet"
        if (JSON.stringify(config.onRows) == JSON.stringify(onRowsRequests.getTotalCounts_Subject)) cs = "getTotalCounts_Subject cellSet"
        
        config.success(cs, mdx, config)
    }
}

export const LABKEY = {}

/* TODO: This will add the ParticipantGroupAPI javascript helpers to the LABKEY global object for your tests. Specifically it
    will be added at LABKEY.Study.ParticipantGroup.  This will make the javascript helpers that wrap the API calls available
    to your test code.  You will still need to use the mock server to mock the API HTTP requests/responses. This will be
    hard coded to your project layout, so that would have to be consistent with whoever is running these tests */
require("../../../../../../modules/platform/api/webapp/clientapi/core/Ajax");
require("../../../../../../modules/immport/resources/web/immport/ParticipantGroupAPI");

// const saveJson = () => {
//     const string = JSON.stringify(cycle.decycle(cs))
//     const blob = new Blob([string],
//         { type: "text/plain;charset=utf-8" })
//     saveAs(blob, "cubeResponse_getCubeData" + (countLevel.match("Study")?"_Study":"_Subject")+".json")
// }