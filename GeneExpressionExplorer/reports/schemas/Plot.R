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

suppressMessages( library( Cairo ) );
suppressMessages( library( RJSONIO ) );

CairoPNG( filename='${imgout:Plot.png}' );

arrayCohorts        <- RJSONIO::fromJSON( labkey.url.params$cohorts );
timePoint           <- as.numeric( labkey.url.params$timePoint );
timePointDisplay    <- labkey.url.params$timePointDisplay;
arrayGenes          <- RJSONIO::fromJSON( labkey.url.params$genes );

print( plot( 1:10 ) );

dev.off();
