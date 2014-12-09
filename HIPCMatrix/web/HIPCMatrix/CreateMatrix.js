/* CreateMatrix.js */

function createMatrixClick(dataRegion)
{
    var schemaName = dataRegion.schemaName;
    var queryName = dataRegion.queryName;
    var selectionKey = dataRegion.selectionKey;

    window.location = LABKEY.ActionURL.buildURL("HIPCMatrix", "CreateMatrix.view", null, {
        schemaName: schemaName,
        queryName: queryName,
        selectionKey: selectionKey,
        returnUrl: window.location
    });
}
