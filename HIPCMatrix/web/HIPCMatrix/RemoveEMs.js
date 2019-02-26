/* removeEMs.js */

function removeEMs( dataRegion ) {

    // HELPER FN -----------------------------------------------------
    /* Not sure why, but following needs to be done for this to work:
    1. .listFiles() must be called first to populate "grid" - per M.Bellew
    2. API rec of .on('ready', fn) was tripping things up so not using
    3. Must save to a global var via setter because returning a var will happen
    before success or failure is finished ... even when embedded in success
    or failure. */

    // can no longer use checkRm b/c run accurately links to filepath. Must delete run first!
    /*
    function checkRm( emObj ){
        var fileSystem = new LABKEY.FileSystem.WebdavFileSystem({
                baseUrl: "/_webdav/Studies/" + emObj["folder"] + "/@files"
            });

        fileSystem.listFiles({
            path: '/analysis/exprs_matrices',
            success: function( fileSystem, path, records ){
                var tsvRec = fileSystem.recordFromCache( emObj["path"] );
                var tsv = fileSystem.canDelete( tsvRec );
                var sumRec = fileSystem.recordFromCache( emObj["path"] + ".summary" );
                var sum = fileSystem.canDelete( sumRec );
                var rawRec = fileSystem.recordFromCache( emObj["path"] + ".raw" );
                var raw = fileSystem.canDelete( rawRec );
                var origRec = fileSystem.recordFromCache( emObj["path"] + ".summary.orig");
                if( origRec == null){
                    alert("No .summary.orig version for " + emObj["path"] +". Still delete row?");
                    var orig = true; // to allow passing thru below
                }else{
                    var orig = fileSystem.canDelete( origRec);
                }
                var orig = true;
                if( tsv & sum & raw & orig){
                    rmLKrow(emObj);
                } else {
                    notAllowedPaths.push(emObj["path"]);
                    doneCheck.update(4);
                }

            },
            failure: function( response, options ){
                notAllowedPaths.push(emObj["path"]);
                doneCheck.update(4);
            },
            scope: this
        }, this);
    }
    */

    /* Only need Primary Key = "RowId", but must update containerPath with folder
    name. Default view in selectRows for this query is currentAndSubfolders, which
    is why it's not needed there. */
    function rmLKrow( emObj ) {
        selRows.responseJSON.rows.forEach( function(rw) {
            if( emObj["name"] == rw.Name){
                var path = containerPath != "/Studies" ? containerPath : containerPath + "/" + emObj["folder"];
                LABKEY.Query.deleteRows({
                    "schemaName": schemaName,
                    "queryName": queryName,
                    "containerPath": path,
                    "rows": [ { "RowId" : rw.RowId } ],
                    success: function ( data ) {
                        rmLkFiles(emObj);
                    },
                    failure: function( errorInfo, options, responseObj ) {
                        notDeletedNames.push ( emObj["name"] );
                        doneCheck.update(4);
                    }
                });
            }
        });
    }

    // Rm .summary.orig files may fail if they are not present b/c update
    // has not occured yet via UpdateAnno::UpdateAnno().
    function fileRm( fileSystem, rmPath){
        fileSystem.deletePath({
                    path: rmPath,
                    isFile: true,
                    success: function(fileSystem, path){
                        removedFiles.push( rmPath );
                        doneCheck.update(1);
                    },
                    failure: function(response, options){
                        notRemovedFiles.push( rmPath );
                        doneCheck.update(1);
                    },
                    scope: this
                });
    }

    function rmLkFiles(emObj){
        var fileSystem = new LABKEY.FileSystem.WebdavFileSystem({
            baseUrl: "/_webdav/Studies/" + emObj["folder"] + "/@files"
        });

        fileSystem.listFiles({
            path: '/analysis/exprs_matrices',
            success: function(fileSys, path, records){
                fileRm(fileSystem, emObj["path"]); // rm tsv
                fileRm(fileSystem, emObj["path"] + ".summary"); // rm summary
                fileRm(fileSystem, emObj["path"] + ".summary.orig"); // rm orig
                fileRm(fileSystem, emObj["path"] + ".raw"); //rm raw
            },
            scope: this
        }, this);
    }

    function goToView(){
        if( doneCheck["count"] / 4 == selRows.responseJSON.rowCount ){
            window.location = LABKEY.ActionURL.buildURL("HIPCMatrix",
                                                        "RemoveEMs.view",
                                                        null,
                                                        {
                                                        dbNotRemoved: notDeletedDb,
                                                        rmFail: notRemovedFiles,
                                                        rmSuccess: removedFiles,
                                                        returnUrl: window.location
                                                        });
        }
        setTimeout(goToView, 1000)
    }


    // global vars
    var notDeletedNames = [];
    var notDeletedDb = [];
    var notRemovedFiles = [];
    var removedFiles = [];
    var doneCheck = {
        count: 0,
        update: function(num){
            this["count"] = this["count"] + num;
        }
    }

    // MAIN FN -----------------------------------------------------------
    function onSuccess( data ) {
        var counter = 0;
        data.rows.forEach( function(rw){
            var emObj = {};
            emObj["name"] = rw['Name'];
            emObj["folder"] = rw['Folder/Name'].match(/SDY\d{2,4}/)[0];
            emObj["path"] = "/analysis/exprs_matrices/" +
                                    rw['Name'] + ".tsv";
            rmLKrow( emObj );
            counter++;
            if(counter === data.rows.length){
                goToView();
            }
        });
    }

    // get Selected Rows and try to remove -------------------------------
    var schemaName = "assay.ExpressionMatrix.matrix";
    var queryName = "Runs";
    var selectionKey = dataRegion.selectionKey;
    var containerPath = LABKEY.ActionURL.getContainer();

    var selRows = LABKEY.Query.selectRows({
        schemaName: schemaName,
        queryName: queryName,
        containerPath: containerPath,
        showRows: "selected", // must be set for selectionKey to be used"
        selectionKey: selectionKey,
        success: onSuccess
    });
}
