/* CreateMatrix.js */

function createMatrixClick(dataRegion)
{
    var schemaName = dataRegion.schemaName;
    var queryName = dataRegion.queryName;
    var selectionKey = dataRegion.selectionKey;

    window.location = LABKEY.ActionURL.buildURL("ExpressionMatrix", "CreateMatrix.view", null, {
        schemaName: schemaName,
        queryName: queryName,
        selectionKey: selectionKey,
        returnUrl: window.location
    });
}

/*
function getDataIds(dr, schemaName, queryName, ids)
{
    if (ids.length == 0) {
        alert("At least one row must be selected");
        return;
    }

    alert("stop");

    // Show a loading message
    var timerId = function () {
        timerId = 0;
        dr.showLoadingMessage("Getting file data ids...");
    }.defer(500, this);


    // get data ids from selected items
    LABKEY.Query.selectRows({
        schemaName: schemaName,
        queryName: queryName,
        columns: ["CelFileId/RowId"],
        filterArray: [ LABKEY.Filter.create("RowId", ids.join(';'), LABKEY.Filter.Types.IN) ],
        success: function (data) {
            if (timerId > 0)
                clearTimeout(timerId);
            else
                dr.hideMessage();

            if (data.rows.length == 0) {
                alert("Error getting file ids for selected rows");
            } else {
                // Create array of the selected exp.data ids
                var fileIds = [];
                for (var i = 0; i < data.rows.length; i++) {
                    var fileId = data.rows[i]["CelFileId/RowId"];
                    fileIds.push(fileId);
                }

                // Go to CreateMatrix page
                // CONSIDER: POST the ids instead of passing them on the URL
                window.location = LABKEY.ActionURL.buildURL("ExpressionMatrix", "CreateMatrix.view", null, { fileIds: fileIds });
            }
        }
    });

}
*/

