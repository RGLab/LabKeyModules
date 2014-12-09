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

print( 'LOADING LIBRARIES ETC.' );
ptm <- proc.time();

suppressMessages( library( Cairo ) );
suppressMessages( library( flowIncubator ) );
suppressMessages( library( flowViz ) );
suppressMessages( library( Rlabkey ) );
suppressMessages( library( gdata ) );
suppressMessages( library( RJSONIO ) );

print( proc.time() - ptm ); # LOADING LIBRARIES ETC.

filesNames  <- RJSONIO::fromJSON( labkey.url.params$filesNames );
studyVars   <- RJSONIO::fromJSON( labkey.url.params$studyVars );
imageWidth  <- as.numeric(labkey.url.params$imageWidth);
imageHeight <- as.numeric(labkey.url.params$imageHeight);
bin         <- as.numeric(labkey.url.params$xbin);
xAxis       <- labkey.url.params$xAxis;
yAxis       <- labkey.url.params$yAxis;
gsPath      <- labkey.url.params$gsPath;
population  <- labkey.url.params$population;
separator   <- labkey.url.params$groupingSeparator;
scale       <- as.numeric(labkey.url.params$scale);

CairoPNG( filename='${imgout:Graph.png}', width = imageWidth, height = imageHeight );

studyVarsLength <- length( studyVars );

if ( ! exists('G') ){
    print('LOADING DATA');
    ptm <- proc.time();

    suppressMessages( library( ncdfFlow ) );

    G <- suppressMessages( load_gslist( gsPath ) );
    currentGsPath <- gsPath;

    print( proc.time() - ptm );
} else {
    if ( gsPath != currentGsPath ){

        print('LOADING DATA');
        ptm <- proc.time();

        G <- suppressMessages( load_gslist( gsPath ) );
        currentGsPath <- gsPath;

        print( proc.time() - ptm );
    }
}

subG <- G[ filesNames ];

print('PLOTTING ETC.');
ptm <- proc.time();

subpd <- pData( subG );

dim <- ceiling( sqrt( nrow( subpd ) ) );

if ( studyVarsLength != 0 ){
    if ( separator == "+" & studyVarsLength > 1 ){
        dim <- nlevels( drop.levels( subpd[ , studyVars[ 1 ] ] ) );
        if ( dim == 0 ){ # FAIL SAFE?
            dim <- ceiling( sqrt( nrow( subpd ) ) );
        }
    }

    studyVars <- paste0('`', studyVars, '`' );

    cond <- '';
    cond <- paste0( cond, paste( studyVars, collapse = separator ) );

} else {
    cond <- NULL;
}

layoutArg <- c( dim, NA, 1 );

overlay <- NULL;

if ( yAxis == '' ){
    yAxis <- NULL;
}

#DEBUG STRING GENERATION
strngFilesNames <- paste0('c(', paste0( "'", paste( filesNames, collapse="','" ), "'" ), ')');
tempOverlay <- 'NULL';
if ( is.null( cond ) ){
    tempCond <- 'NULL';
    if ( is.null( yAxis ) ){
        tempYAxis <- 'NULL';
    } else {
        tempYAxis <- paste0( "'", yAxis, "'" );
    }
} else {
    tempCond <- paste0( "'", cond, "'" );
    if ( is.null( yAxis ) ){
        tempYAxis <- 'NULL';
    } else {
        tempYAxis <- paste0( "'", yAxis, "'" );
    }
}
debugString <- paste0( "flowIncubator:::plotGate_labkey( ",
    "G[ ", strngFilesNames, " ], ",
    "parentID = '", population, "', ",
    "x = '", xAxis, "', ",
    "y = ", tempYAxis, ", ",
    "xlab = '", labkey.url.params$xLab, "', ",
    "ylab = '", labkey.url.params$yLab, "', ",
    "margin = T, ",
    "xbin = ", bin, ", ",
    "layout = c(", dim, ", NA, 1 ), ",
    "cond = ", tempCond, ", ",
    "overlay = ", tempOverlay, ", ",
    "stack = F, ",
    "par.settings = list( ",
        "par.xlab.text = list( cex = ", scale, " ), ",
        "par.ylab.text = list( cex = ", scale, " ), ",
        "axis.text = list( cex = ", scale, " ) ",
    "), ",
    "par.strip.text = list( cex = ", scale, " )",
" )" );

#stop( paste0( gsPath, "|", debugString ) );

sink('/dev/null');

print(
    flowIncubator:::plotGate_labkey(
        G               = subG,
        parentID        = population,
        x               = xAxis,
        y               = yAxis,
        xlab            = labkey.url.params$xLab,
        ylab            = labkey.url.params$yLab,
        margin          = T,
        xbin            = bin,
        layout          = layoutArg,
        cond            = cond,
        overlay         = overlay,
        stack           = F,
        par.settings    = list(
            par.xlab.text   = list( cex = scale ),
            par.ylab.text   = list( cex = scale ),
            axis.text       = list( cex = scale ) 
        ),
        par.strip.text  = list( cex = scale )
    )
);

sink();

print( proc.time() - ptm ); # PLOTTING

dev.off();

Sys.sleep( 3 );

