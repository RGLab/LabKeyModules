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
suppressMessages( library( RCurl ) );
suppressMessages( library( ImmuneSpaceR ) );

stopcheck <- function(data){
    stop(paste0(paste(capture.output(str(data)), collapse='\n'), '\nl.u.b: ',labkey.url.base, '\nl.u.p: ',labkey.url.path))
};

imageWidth  <- as.numeric(labkey.url.params$imageWidth)
imageHeight <- as.numeric(labkey.url.params$imageHeight)
CairoPNG(filename='${imgout:Plot.png}', width = imageWidth, height = imageHeight )

dataset             <- labkey.url.params$datasetName;
datasetDisplay      <- labkey.url.params$datasetLabel;
plotType            <- labkey.url.params$plotType;
normalize           <- as.logical( labkey.url.params$normalize );
filters             <- RJSONIO::fromJSON( labkey.url.params$filters );
textSize            <- as.numeric( labkey.url.params$textSize );
facet               <- tolower(labkey.url.params$facet);
legend              <- labkey.url.params$legend;
color               <- labkey.url.params$color;
shape               <- labkey.url.params$shape;
size                <- labkey.url.params$size;
alpha               <- labkey.url.params$alpha;
#stopcheck(labkey.url.params)


filter <- as.matrix( lapply( filters, function( e ){
    return( paste0( curlEscape( e['fieldKey'] ), '~', e['op'], '=', curlEscape( e['value'] ) ) );
}) );
if ( nrow( filter ) == 0 ){
  filter <- NULL;
}

if( color == '' )  color   <- NULL;
if( shape == '' )  shape   <- NULL;
if( size == '' )   size    <- NULL;
if( alpha == '' )  alpha   <- NULL;
if(legend == ""){
  legend <- NULL
} else{
  legend <- unlist(strsplit(legend, ","))
}


message <- ''; # default value needed
con <- CreateConnection()
m_out <- con$quick_plot(
    dataset,
    normalize_to_baseline   = normalize,
    type                    = plotType,
    filter                  = filter,
    facet                   = facet,
    text_size               = textSize,
    color                   = color,
    size                    = size,
    shape                   = shape,
    alpha                   = alpha,
    legend                  = legend
)
dev.off();

write( message, file='${txtout:textOutput}' );

