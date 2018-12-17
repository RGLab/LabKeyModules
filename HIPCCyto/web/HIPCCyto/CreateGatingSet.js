/* CreateMatrix.js */

function createMatrixClick( dataRegion ) {

    var schemaName = dataRegion.schemaName;
    var queryName = dataRegion.queryName;
    var selectionKey = dataRegion.selectionKey;
    var containerPath = dataRegion.containerPath;

    // Everything must be in 'success' argument b/c async call
    function onSuccess(data){
        var studies = Ext.pluck( data.rows, "study_accession");
        var unique = studies.filter( function(el, i, arr){ return arr.indexOf(el) === i; } );
        if( unique.length > 1 ){
           Ext.Msg.alert("More than one study. Please select subjects for only one and retry");
        }else if( unique.length == 0 ){
           Ext.Msg.alert("Selected study do not map to a cohort. Please update and try again.");
        }else{
            /* update to CreateGS.view*/
            window.location = LABKEY.ActionURL.buildURL("HIPCCyto", "CreateGatingSet.view", null, {
                schemaName: schemaName,
                queryName: queryName,
                selectionKey: selectionKey,
                returnUrl: window.location
            });
        }
    }

    function checkStudies(){
        LABKEY.Query.selectRows({
            schemaName: schemaName,
            queryName: queryName,
            containerPath: containerPath,
            showRows: "selected", // must be set for selectionKey to be used
            selectionKey: selectionKey,
            columns: ["study_accession"],
            success: onSuccess
        });
    }

    function getRoles(userPermsInfo){
        var roles = Ext.pluck( userPermsInfo.container.groups, "name");
        if( LABKEY.adminOnlyMode != null && !roles.includes("Site Administrators") ){
            Ext.Msg.alert("Pipeline User does not have admin rights. Create GatingSet request will error out if run in admin-only mode.");
        }i
        checkStudies();
    }

    function checkPipelineUser(){
        var usr = LABKEY.Security.currentUser;
        if(usr.isAdmin){
            LABKEY.Security.getUserPermissions({
                                        userId: 1125,
                                        success: getRoles
            });
        }else{
            checkStudies();
        }
    }
    checkPipelineUser();
}
