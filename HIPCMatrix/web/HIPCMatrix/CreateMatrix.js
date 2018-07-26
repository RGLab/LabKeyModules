/* CreateMatrix.js */

function createMatrixClick( dataRegion ) {

    var schemaName = dataRegion.schemaName;
    var queryName = dataRegion.queryName;
    var selectionKey = dataRegion.selectionKey;
    var containerPath = dataRegion.containerPath;

    // Everything must be in 'success' argument b/c async call
    function onSuccess(data){
        var cohorts = Ext.pluck( data.rows, "arm_name");
        var unique = cohorts.filter( function(el, i, arr){ return arr.indexOf(el) === i; } );
        if( unique.length > 1 ){
           Ext.Msg.alert("More than one cohort. Please select subjects for only one and retry");
        }else if( unique.length == 0 ){
           Ext.Msg.alert("Selected subjects do not map to a cohort. Please update and try again.");
        }else{
            window.location = LABKEY.ActionURL.buildURL("HIPCMatrix", "CreateMatrix.view", null, {
                schemaName: schemaName,
                queryName: queryName,
                selectionKey: selectionKey,
                returnUrl: window.location
            });
        }
    }

    function checkCohorts(){
        LABKEY.Query.selectRows({
            schemaName: schemaName,
            queryName: queryName,
            containerPath: containerPath,
            showRows: "selected", // must be set for selectionKey to be used
            selectionKey: selectionKey,
            columns: ["arm_name"],
            success: onSuccess
        });
    }

    function getRoles(userPermsInfo){
        var roles = Ext.pluck( userPermsInfo.container.groups, "name");
        if( LABKEY.adminOnlyMode != null && !roles.includes("Site Administrators") ){
            Ext.Msg.alert("Pipeline User does not have admin rights. Create Matrix request will error out if run in admin-only mode.");
        }
        checkCohorts();
    }

    function checkPipelineUser(){
        var usr = LABKEY.Security.currentUser;
        if(usr.isAdmin){
            LABKEY.Security.getUserPermissions({
                                        userId: 1125,
                                        success: getRoles
            });
        }else{
            checkCohorts();
        }
    }
    checkPipelineUser();
}
