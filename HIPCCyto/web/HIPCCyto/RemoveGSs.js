/* removeGSs.js
   Lauren Wolfe
   2019

  Tool to remove outputs from create-gating set run
    - cytometry.gatingSetMetaData
    - cytometry.gatingSetInputFiles
    - flowWorkspace::save_gs() files

  Invoked by Remove GS button in cytometry.gatingSetMetaData

  Opens a new window displaying paths of deleted/not deleted 
  HTML found in HIPCCyto/views
*/

function removeGSs(dataRegion) {
    
    // CHECK THAT FILES CAN BE REMOVED -------------------------------------------------------------
    function canDelete(gsObj, filteredInputFiles) {
        var fileSystem = new LABKEY.FileSystem.WebdavFileSystem({
            baseUrl: '/_webdav/Studies/' + gsObj['study'] + '/@files' + gsObj['path'] 
        });
        var folderRec = fileSystem.recordFromCache('');
        var folder = fileSystem.canDelete(folderRec);
        if(folder) {
            rmRunRows(gsObj, filteredInputFiles);
        } else {
            notAllowedPaths.push(gsObj['path']);
            doneCheck.update(1);
        }
    }
    
    // REMOVE ROWS FROM GATING SET META DATA -------------------------------------------------------
    function rmRunRows(gsObj, filteredInputFiles) {
        selRows.responseJSON.rows.forEach( function(rw) {
            if(gsObj['wsid'] == rw.wsid) {
                var path = containerPath != '/Studies' ? containerPath : containerPath + '/' + gsObj['study'];
                LABKEY.Query.deleteRows({
                    schemaName: schemaName,
                    queryName: queryName,
                    containerPath: path,
                    rows: [{ 'key' : rw.key }],
                    success: function(data) {
                        rmInputRows(gsObj, filteredInputFiles);
                    },
                    failure: function(errorInfo, options, responseObj) {
                        notDeletedNames.push(gsObj['wsid']);
                        doneCheck.update(1);
                    }
                });
            } 
        });
    }

    // REMOVE ROWS FROM GATING SET INPUT FILES -----------------------------------------------------
    function rmInputRows(gsObj, filteredInputFiles) {
        var path = containerPath != '/Studies' ? containerPath : containerPath + '/' + gsObj['study'];
        LABKEY.Query.deleteRows({
            schemaName: schemaName,
            queryName: 'gatingSetInputFiles',
            containerPath: path,
            rows: filteredInputFiles,
            success: function(data) {
                rmGSFiles(gsObj);
            },
            failure: function(errorInfo, options, responseObj) {
                notDeletedNames.push(gsObj['wsid']);
                doneCheck.update(1);
            }
        });
    }

    // REMOVE DIRECTORY W GATING SET OBJECT --------------------------------------------------------
    function rmFiles(fileSystem, rmPath) {
        fileSystem.deletePath({
            path: rmPath,
            isFile: false, // deleting the whole wsid directory
            success: function(fileSystem, path) {
                removedFiles.push(rmPath);
                doneCheck.update(3);
            },
            failure: function(response, options) {
                notRemovedFiles.push(rmPath);
                doneCheck.update(3);
            },
            scope: this
        });
    }

    function rmGSFiles(gsObj) {
        var fileSystem = new LABKEY.FileSystem.WebdavFileSystem({
            baseUrl:'/_webdav/Studies/' + gsObj['study'] + '/@files'
        });
        rmFiles(fileSystem, gsObj['path']); // rm analysis/gating_set/<wsID>
    }

    // GO TO VIEW AFTER DELETE ---------------------------------------------------------------------
    function goToView() {
        if(doneCheck['count'] / 3 == selRows.responseJSON.rowCount) {
            window.location = LABKEY.ActionURL.buildURL(
                    'HIPCCyto',
                    'RemoveGSs.view',
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
    
    // GLOBAL VARIABLES ----------------------------------------------------------------------------
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

    // MAIN FUNCTION -------------------------------------------------------------------------------
    // kicks off file check, file deletion, and row deletion
    // kicks off counter and opens new window
    function onSuccess(data) {
        var counter = 0;
        data.rows.forEach(function(rw) {
            var gsObj = {}; 
            gsObj['wsid'] = rw['wsid'];
            gsObj['study'] = rw['study'];
            gsObj['path'] = 'analysis/gating_set/' + rw['wsid'];
            
            // filter inputfiles by selected wsid
            var inputFilesArray = inputFiles.responseJSON.rows; 
            var filteredInputFiles = inputFilesArray.filter(function(item) {
                return [ gsObj['wsid'] ].indexOf(item.wsid) !== -1;
            });
            
            canDelete(gsObj, filteredInputFiles);
            counter++;
            if(counter === data.rows.length) {
                goToView();
            }   
        }); 
    }   

    // ---------------------------------------------------------------------------------------------
    var schemaName = LABKEY.ActionURL.getParameters()['schemaName'] // gatingSetMetaData
    var queryName = LABKEY.ActionURL.getParameters()['query.queryName'] // cytometry_processing
    var selectionKey = dataRegion.selectionKey; 
    var containerPath = LABKEY.ActionURL.getContainer(); // /Studies/SDYXXX
    
    // GET INPUTFILES --------------------------------------------------------------
    
    var inputFiles = LABKEY.Query.selectRows({
        schemaName: schemaName,
        queryName: 'gatingSetInputFiles',
        containerPath: containerPath,
        columns: ['container','file_info_name', 'wsid']
    });

    // GET ROWS THAT HAVE BEEN SELECTED IN THE UI TO DELETE ----------------------------------------- 
    var selRows = LABKEY.Query.selectRows({
        schemaName: schemaName,
        queryName: queryName,
        containerPath: containerPath,
        showRows: 'selected',
        columns: ['wsid', 'study', 'container', 'key'],
        selectionKey: selectionKey,
       success: onSuccess
    });

}

