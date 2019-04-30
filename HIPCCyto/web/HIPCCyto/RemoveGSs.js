/* removeGSs.js */

/* Lauren Wolfe
   2019 
*/

function removeGSs( dataRegion ) {
    
    // CHECK THAT FILES CAN BE REMOVED -----------------------------
    function canDelete( gsObj ){
        var fileSystem = new LABKEY.FileSystem.WebdavFileSystem({
            baseUrl: '/_webdav/Studies/' + gsObj['study'] + '/@files' + gsObj['path'] 
        });

        fileSystem.listFiles({
            path: '',
            success: function( fileSystem, path, records ){
                var folderRec = fileSystem.recordFromCache('');
                var folder = fileSystem.canDelete( folderRec );
                if( folder ){
                    rmRunRows(gsObj);
                } else {
                    notAllowedPaths.push(gsObj['path']);
                    doneCheck.update(4);
                }
            },
            failure: function( response, options ){
                notAllowedPaths.push(gsObj['path']);
                doneCheck.update(4);
            },
            scope: this
        }, this);
    }
    
    // REMOVE ROWS FROM ASSAY.GENERAL.GATINGSET.DATA ------------------
    // If canDelete returns TRUE delete rows in assay.General.gatingset.Data 
    // and cytometry_processing.gatingSetInputFiles where wsid = gsObj[wsid]
    
    function rmRunRows( gsObj ) {
        selRows.responseJSON.rows.forEach( function(rw) {
            if ( gsObj['wsid'] == rw.wsid ){
                var path = containerPath != "/Studies" ? containerPath : containerPath + "/" + gsObj['study'];
                LABKEY.Query.deleteRows({
                    "schemaName": schemaName,
                    "queryName": queryName,
                    "containerPath": path,
                    "rows": [ { "RowId" : rw.RowId } ],
                    success: function ( data ) {
                        rmInputRows(gsObj);
                    },
                    failure: function( errorInfo, options, responseObj ) {
                        notDeletedNames.push ( gsObj["wsid"] );
                        done.Check.update(4);
                    }
                });
            } 
        });
    }

    // REMOVE ROWS FROM GATING SET INPUT FILES --------------------
    function rmInputRows ( gsObj ) {
        var inputRows = LABKEY.query.selectRows({
            schemaName: "cytometry_processing",
            queryName: "gatingSetInputFiles",
            containerPath: containerPath
            // OnSuccess???
        });
        
        inputRows.responseJSON.rows.forEach( function(rw) {
            if ( gsObj['wsid'] == rw.wsid ){
                var path = containerPath != "/Studies" ? containerPath : containerPath + "/" + gsObj['study'];
                LABKEY.Query.deleteRows({
                    "schemaName": "cytometry_processing",
                    "queryName": "gatingSetInputFiles",
                    "containerPath": path,
                    "rows": [ { "RowsId" : rw.RowId } ],
                    success: function( data ) {
                        rmGSFiles(gsObj);
                    },
                    failure: function( errorInfo, options, responseObj ) {
                        notDeletedNames.push ( gsObj['wsid'] );
                        doneCheck.update(4);
                    }
                });
            }
        });
    }


    // REMOVE DIRECTORY W GATING SET OBJECT ----------------------
    function rmFiles ( fileSystem, rmPath ) {
        fileSystem.deletePath({
            path: rmPath,
            isFile: false, // deleting the whole wsid directory
            success: function(fileSystem, path) {
                removedFiles.push( rmPath );
                doneCheck.update(1);
            },
            failure: function(resposne, options){
                notRemovedFiles.push( rmPath );
                doneCheck.update(1);
            },
            scope: this
        });
    }

    function rmGSFiles ( gsObj ){
        var fileSystem = new LABKEY.FileSystem.WebdavFileSystem({
            baseUrl:"/_webdav/Studies/" + gsObj["study"] + "/@files"
        });

        fileSystem.listFiles({
            path: "/analysis/gating_set",
            success: function( fileSystem, path, records ){
                fileRm(fileSystem, gsObj["path"]); // rm analysis/gating_set/<wsID>
            },
            scope: this
        }, this);
    }

    // GO TO VIEW AFTER DELETE ------------------------------------
    function goToView() {
        if( doneCheck["count"] / 4 == selRows.responseJSON.rowCount ){
            window.location = LABKEY.ActionURL.buildURL(
                    "HIPCCyto",
                    "RemoveGSs.view",
                    null,
                    {
                        notAllowed: notAllowedPaths,
                        dbNotRemoved: notDeletedDb,
                        rmFail: notRemovedFiles,
                        rmSuccess: removedFiles,
                        returnUrl: window.location
                    });
        }
        setTimeout(goToView, 1000)
    }


    // GLOBAL VARIABLES -------------------------------------------
    var notDeletedNames = [];
    var notAllowedPaths = [];
    var notDeletedDb = []; 
    var notRemovedFiles = [];
    var removedFiles = [];
    var doneCheck = {
        count: 0,
        update: function(num){
            this['count'] = this['count'] + num;
        }
    }

    // MAIN FUNCTION ----------------------------------------------
    function onSuccess( data ) {
        var counter = 0;
        data.rows.forEach( function(rw){
            var gsObj = {};
            gsObj['wsid'] = rw['wsid'];
            gsObj['study'] = rw['study'];
            gsObj['path'] = 'analysis/gating_set/' + rw['wsid'];

            canDelete( gsObj );
            counter++;
            if(counter === data.rows.length){
                goToView();
            }
        });
    }

    // get Selected Rows and try to remove content -----------------
    
    var schemaName = LABKEY.ActionURL.getParameters()['schemaName'] //assay.General.gatingset
    var queryName = LABKEY.ActionURL.getParameters()['query.queryName'] // Data
    var selectionKey = dataRegion.selectionKey; // ??
    var containerPath = LABKEY.ActionURL.getContainer(); // /Studies/SDYXXX
    
    // select rows that have been selected in the UI ---------------
    var selRows = LABKEY.Query.selectRows({
        schemaName: schemaName,
        queryName: queryName,
        containerPath: containerPath,
        showRows: "selected",
        selectionKey: selectionKey,
        success: onSuccess
    });

}

