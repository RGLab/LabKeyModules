# vim: sw=4:ts=4:nu:nospell:fdc=4
#
#  Copyright 2013 Fred Hutchinson Cancer Research Center
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

suppressMessages( library( Rlabkey ) );
suppressMessages( library( RJSONIO ) );

gspaths     <- RJSONIO::fromJSON( labkey.url.params$gspaths );
gsids       <- RJSONIO::fromJSON( labkey.url.params$gsids );
container   <- labkey.url.params$container;

for ( i in 1:length( gsids ) ){

    gsid    <- gsids[[i]];
    gspath  <- gspaths[[i]];

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

    txt <- 'Analyses removed';

    gsTbl <- labkey.selectRows(
          queryName     = 'gstbl',
        , schemaName    = 'lyoplate_visualization'
        , baseUrl       = labkey.url.base
        , folderPath    = labkey.url.path
        , colFilter     = makeFilter( c( 'gspath', 'EQUALS', gspath ) )
    );

    tryCatch(
        {
            if ( nrow( gsTbl ) == 0 ) {
                res <- unlink( gspath, force = T, recursive = T );

                if ( res != 0 ){
                    insertedRow <- labkey.insertRows(
                          toInsert      = do.call( rbind, lapply( deletedRows$rows, data.frame ) )
                        , queryName     = 'gstbl'
                        , schemaName    = 'lyoplate_visualization'
                        , folderPath    = labkey.url.path
                        , baseUrl       = labkey.url.base
                    )
                    stop( 'Removal of the analysis from the file system failed: should have reinserted the removed database row' );
                }
            }
        },
        error = function(e){
            stop( e );
        }
    )
};

write( txt, file='${txtout:textOutput}' );

Sys.sleep( 15 );

