# vim: sw=4:ts=4:nu:nospell:fdc=4
#
#  Copyright 2013 Fred Hutchinson Cancer Research Center
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

gsPath <- labkey.url.params$gsPath;

ptm <- proc.time();
print( 'LOADING LIBRARIES ETC.' );

suppressMessages( library( flowWorkspace ) );
suppressMessages( library( ncdfFlow ) );

print( proc.time() - ptm ); # LOADING LIBRARIES ETC.

if ( gsPath == '' ){
    stop('The path to the analysis data was not properly specified.');
} else {
    print('LOADING DATA');
    ptm <- proc.time();

    G <- suppressMessages( load_gslist( gsPath ) );
    currentGsPath <- gsPath;

    txt <- 'gating set loaded';

    print( proc.time() - ptm );
}

write(txt, file='${txtout:textOutput}');

