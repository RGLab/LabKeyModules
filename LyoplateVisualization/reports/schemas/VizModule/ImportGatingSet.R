# vim: sw=4:ts=4:nu:nospell:fdc=4
#
#  Copyright 2014 Fred Hutchinson Cancer Research Center
#
#  Licensed under the Apache License, Version 2.0 (the 'License');
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an 'AS IS' BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

suppressMessages( library( flowWorkspace ) );
suppressMessages( library( Rlabkey ) );
co <- labkey.setCurlOptions( sslversion = 1, ssl_verifyhost = 2 );
suppressMessages( library( digest ) );
suppressMessages( library( Rlibstree ) );

importGatingSet <- function( addresses, folders, filesPaths, names, descriptions = NULL, verbose = F ){
    if ( length( names ) > 1 & length( addresses ) == 1 ){
        addresses <- rep( addresses, times = length( names ) );
    }
    if ( length( names ) > 1 & length( folders ) == 1 ){
        folders <- rep( folders, times = length( names ) );
    }

    toProcess <- list( addresses, folders, filesPaths, names );
    if ( ! is.null( descriptions ) ){
        toProcess <- c( toProcess, descriptions );
    }

    if ( var( unlist( lapply( toProcess, length ) ) ) > 0 ){
        stop( 'Exiting: the passed in vectors of file paths, analysis names and descriptions, if available, must be same length; the passed in vectors of server addresses and server paths each must either be the same length as above or of length one, if specifying a unified resource.' );
    }

    for ( i in 1:length( filesPaths ) ){
        labkey.url.base <- addresses[i];
        labkey.url.base <- gsub( 'http:', 'https:', labkey.url.base );
        if ( length( grep('^https://', labkey.url.base ) ) == 0 ){
            labkey.url.base <- paste0( 'https://', labkey.url.base );
        }
        labkey.url.path <- folders[i];
        path            <- filesPaths[i];
        analysisName    <- names[i];
        if ( ! is.null( descriptions ) ){
            analysisDescription <- descriptions[i];
        } else {
            analysisDescription <- NULL;
        } 

        if ( labkey.url.base == '' | is.null( labkey.url.base ) ){
            stop( 'The Labkey server address cannot be empty, exiting...' );
        }

        if ( labkey.url.path == '' | is.null( labkey.url.path ) ){
            stop( 'The Labkey server folder path cannot be empty, exiting...' );
        }

        if ( path == '' | is.null( path ) ){
            stop('Path cannot be empty, exiting...');
        } else {
            path <- normalizePath( path );
            if ( substr( path, nchar( path ), nchar( path ) ) == '/' ){
                path <- substr( path, 1, nchar( path ) - 1 );
            }
            if ( ! file.exists( path ) ){
                stop('The specified path is invalid, exiting...');
            }
        }

        if ( analysisName == '' | is.null( analysisName ) ){
            analysisName <- basename( path );
            message( paste0( 'Using the name of the specified gating set file for the analysis name: "', analysisName, '"' ) );
        }

        if ( is.null( analysisDescription ) ){
            analysisDescription <- '';
        }

        flagCdfMove <- F;

        tryCatch({
            sql <- "SELECT DISTINCT Runs.FilePathRoot AS Path FROM Runs WHERE Runs.FCSFileCount != 0 AND Runs.ProtocolStep = 'Keywords'";

            paths <-
                labkey.executeSql(
                    baseUrl     = labkey.url.base,
                    folderPath  = labkey.url.path,
                    schemaName  = 'flow',
                    sql         = sql
                )$Path;

            if ( length( paths ) == 0 ){
                stop( "No FCS files were found, check the 'Runs' table in the 'flow' schema, import FCS files first" );
            }

            rootPath <- getLongestCommonSubstring( paths );

            if ( substr( rootPath, nchar( rootPath ), nchar( rootPath ) ) == '/' ){
                rootPath <- substr( rootPath, 1, nchar( rootPath ) - 1 );
            } else {
                rootPath <- dirname( rootPath );
            }

            if ( length( list.dirs( path, recursive = F ) ) > 0 ){ # gating set list
                suppressMessages( G <- load_gslist( path ) );
            } else { # gating set
                suppressMessages( G <- load_gs( path ) );

                fs <- getData( G );
                if ( class( fs ) == 'flowSet' ){
                    flowData( G ) <- ncdfFlowSet( fs, ncdfFile = tempfile( pattern = 'ncfs', tmpdir = rootPath, fileext = '.nc' ) );
                    flagCdfMove <- T;
                }

                G <- GatingSetList( list( G ) );
            }


            meta        <- pData( G );
            colNames    <- colnames( meta );
            len         <- length( colNames );

            colNames[ which( colNames == 'name' ) ] <- 'Name';

            strngStudyVars <- '';

            if ( len > 1 ){
                strngStudyVars <- paste0( 'Sample/', colNames[ 2:len ] ); # 'Name' should be in position 1 now
                colNames <- c( colNames[1], strngStudyVars );
                strngStudyVars <- paste0( strngStudyVars, collapse = ',' );
            }

            oldColNames <- colnames( meta );

            filter <- array( 0, dim = c( 2 + len ), 1 );
            filter[ len + 1 ] <- paste0( URLencode( 'Run/ProtocolStep' ), '~eq=', URLencode( 'Keywords' ) );
            filter[ len + 2 ] <- paste0( URLencode( 'Run/FCSFileCount' ), '~neq=', URLencode( 0 ) );
            for ( i in 1:len ){
                filter[ i ] <- paste0( URLencode( colNames[i] ), '~in=', URLencode( paste( meta[ , oldColNames[i] ], collapse = ';' ) ) );
            }

            rowIds <- labkey.selectRows(
                baseUrl     = labkey.url.base,
                folderPath  = labkey.url.path,
                schema      = 'flow',
                query       = 'FCSFiles',
                colFilter   = filter,
                colNameOpt  = 'fieldname',
                colSelect   = c( 'Name' ),
                showHidden  = T
            );

            if ( nrow( rowIds ) != nrow( meta ) ){            
                write.csv( meta, file = paste0( file.path( rootPath, basename( path ) ), '.csv' ), row.names = F );
                cat( paste0( 'Now import the generated file, ', paste0( file.path( rootPath, basename( path ) ), '.csv' ), ', into Labkey via "Samples" menu and join to the imported FCS files, press ENTER when done to proceed.' ) );
                readline();
                rowIds <- labkey.selectRows(
                    baseUrl     = labkey.url.base,
                    folderPath  = labkey.url.path,
                    schema      = 'flow',
                    query       = 'FCSFiles',
                    colFilter   = filter,
                    colNameOpt  = 'fieldname',
                    colSelect   = c( 'Name' ),
                    showHidden  = T
                );
            }

            colnames( meta ) <- colNames;
            meta <- merge( meta, rowIds );

            strngWorkspacePaths <- sum( file.info( list.files( path, full.names = T ) )$size ); # file size

            strngSampleGroupNames <- paste0( getNodes( G[[1]], order = 'tsort', showHidden = T ), collapse = ',' ); # all of the populations' full paths in the gating hierarchy

            strngFilesIds <- paste0( sort( meta$RowId ), collapse = ';' );

            currentHashValue <- digest( paste0( strngWorkspacePaths, strngSampleGroupNames, strngFilesIds ) );

            strngWorkspacePaths <- paste0( path, ';', strngWorkspacePaths ); # path of the original data file together with the file size, not hashing on the path, though


            gatingSetPath <- file.path( rootPath, currentHashValue );

            colNames <- colnames( meta );
            inds <- which( colNames != 'RowId' );

            for ( i in 1:length( inds ) ){
                ind <- inds[i];
                meta[ , ind ] <- factor( meta[ , ind ] );
            }

            colNames[ which( colNames == 'Name' ) ]     <- 'name';
            colNames[ which( colNames == 'RowId' ) ]    <- 'fileid';

            colnames( meta ) <- colNames;
            rownames( meta ) <- meta[ , 'name' ];
            pData( G ) <- meta;

            if ( file.exists( gatingSetPath ) ){
                unlink( paste0( file.path( rootPath, basename( path ) ), '.csv' ), force = T, recursive = T );
                stop( paste0( 'File ', gatingSetPath, ' already exists!' ) );
            } else {
                if ( flagCdfMove ){
                    suppressMessages( G <- save_gslist_labkey( G, path = gatingSetPath, overwrite = T, cdf = 'move' ) );
                } else {
                    suppressMessages( save_gslist( G, path = gatingSetPath, overwrite = T, cdf = 'copy' ) );
                }
                file.create( file.path( gatingSetPath, 'FOLDER_LOCKED_TEMP' ) ); # create a 'lock' file
            }

            writeProjections <- function( G, gsid, ... ){
                gh <- G[[1]];
                popNames <- getNodes( gh, order = 'tsort', path = 'auto' ); # hidden nodes are not shown by default
                res <- lapply( 1:length( popNames ), function(i){
                    curPop <- popNames[i];
                    curChildren <- getChildren( gh, curPop, showHidden = F );
                    if ( length( curChildren ) > 0 ){
                        prjlist <- lapply( curChildren, function( curChild ){
                            if ( ! flowWorkspace:::.isBoolGate( gh, curChild ) ){
                                param <- parameters( getGate( gh, curChild ) );

                                if ( length( param ) == 1 ){
                                    if ( param != 'SSC-A' ){
                                        param <- c( param, 'SSC-A' );
                                    } else {
                                        param <- c( param, 'FSC-A' );
                                    }
                                }
                                return( param );
                            } else {
                                return( NULL );
                            }
                        });
                        prj <- do.call( rbind, prjlist );
                        prj <- unique( prj );
                    } else {
                        if ( curPop != 'root' & i != 1 ){
                            if ( ! flowWorkspace:::.isBoolGate( gh, curPop ) ){
                                prj <- as.list( c( ' ', ' ' ) );
                            }
                        }
                        
                    }
                    if ( exists('prj') ){
                        prj <- as.data.frame( prj );
                        colnames(prj) <- c('x_axis', 'y_axis');
                        cbind( index = i, path = curPop, prj, gsid = gsid );
                    }
                });

                toInsert <- do.call( rbind, res );

                map <- subset( pData( parameters( getData( gh ) ) )[ , 1:2 ], ! is.na(desc) );

                colnames(map)[1] <- 'x_axis';
                toInsert <- merge( toInsert, map, all.x = T );
                emptyInds <- is.na( toInsert$desc );
                toInsert$desc[ emptyInds ] <- '';
                toInsert$desc[ ! emptyInds ] <- paste( toInsert$desc[ ! emptyInds ], '' );
                toInsert$x_key <- toInsert$x_axis;
                toInsert$x_axis <- paste0( toInsert$desc, toInsert$x_axis );
                toInsert$desc <- NULL;

                colnames(map)[1] <- 'y_axis';
                toInsert <- merge( toInsert, map, all.x = T );
                emptyInds <- is.na( toInsert$desc );
                toInsert$desc[ emptyInds ] <- '';
                toInsert$desc[ ! emptyInds ] <- paste( toInsert$desc[ ! emptyInds ], '' );
                toInsert$y_key <- toInsert$y_axis;
                toInsert$y_axis <- paste0( toInsert$desc, toInsert$y_axis );
                toInsert$desc <- NULL;

                labkey.insertRows( queryName = 'projections', toInsert = toInsert, ... );
            };

            toInsert <- data.frame(
                  gsname            = analysisName
                , gspath            = gatingSetPath
                , gsdescription     = analysisDescription
                , xmlpaths          = strngWorkspacePaths
                , samplegroups      = strngSampleGroupNames
            );

            insertedRow <- labkey.insertRows(
                  toInsert      = toInsert
                , queryName     = 'gstbl'
                , schemaName    = 'lyoplate_visualization'
                , folderPath    = labkey.url.path
                , baseUrl       = labkey.url.base
            );

            gsid        <- insertedRow$rows[[1]]$gsid;
            container   <- insertedRow$rows[[1]]$container;

            writeProjections(
                G
                , gsid
                , schemaName    = 'lyoplate_visualization'
                , folderPath    = labkey.url.path
                , baseUrl       = labkey.url.base
            );

            if ( strngStudyVars != '' ){
                toInsert <- data.frame(
                    svname  = unlist( strsplit( strngStudyVars, split = ',' ) )
                    , gsid    = gsid
                );

                labkey.insertRows(
                      toInsert      = toInsert
                    , queryName     = 'study_vars'
                    , schemaName    = 'lyoplate_visualization'
                    , folderPath    = labkey.url.path
                    , baseUrl       = labkey.url.base
                );
            }

            if ( strngFilesIds != '' ){
                toInsert <- data.frame(
                    fileid    = unlist( strsplit( strngFilesIds, split = ';' ) )
                    , gsid      = gsid
                );

                labkey.insertRows(
                      toInsert      = toInsert
                    , queryName     = 'files'
                    , schemaName    = 'lyoplate_visualization'
                    , folderPath    = labkey.url.path
                    , baseUrl       = labkey.url.base
                );
            }

            unlink( paste0( file.path( rootPath, basename( path ) ), '.csv' ), force = T, recursive = T );
            unlink( file.path( gatingSetPath, 'FOLDER_LOCKED_TEMP' ), force = T, recursive = T );

            if ( verbose ){
                message( paste0( 'Added an analysis named ', analysisName ) );
            }

        }, error = function(e){

            if ( exists( 'gsid' ) & exists( 'container' ) ){
                if ( length( gsid ) & length( container ) ){
                    if ( ! is.na( gsid ) & ! is.na( container ) ){

                        deletedRows <- labkey.deleteRows(
                            toDelete        = data.frame(
                                                gsid        = gsid,
                                                container   = container
                                            )
                            , queryName     = 'gstbl'
                            , baseUrl       = labkey.url.base
                            , folderPath    = labkey.url.path
                            , schemaName    = 'lyoplate_visualization'
                        );

                    }
                }
            }

            unlink( paste0( file.path( rootPath, basename( path ) ), '.csv' ), force = T, recursive = T );
            unlink( paste0( rootPath, '/ncfs*.nc' ), force = T, recursive = T );

            if ( exists( 'gatingSetPath' ) ){
                if ( length( list.files( gatingSetPath, pattern = 'FOLDER_LOCKED_TEMP' ) ) == 1 ){
                    unlink( gatingSetPath, force = T, recursive = T );
                }
            }

            stop(e);
        });
    }
};

print( 'importGatingSet( addresses, folders, filesPaths, names, descriptions = NULL, verbose = F ) defined' );

