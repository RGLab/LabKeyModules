# vim: sw=4:ts=4:nu:nospell:fdc=4
#
#  Copyright 2014 Fred Hutchinson Cancer Research Center
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

#' plot by prarent index
#' 
#' This API is mainly used for labkey module. It takes a parent index instead of the actual gate index.
#' When there is no gate associated with the x,y channel specified by user, it simply plots the \code{xyplot} 
#' or \code{densityplot} without the gate. 
#' 
#' @param x \code{character} x channel
#' @param y \code{character} y channel, if \code{NULL},then try to do \code{densityplot}
#' @export 
#' @importFrom BiocGenerics colnames

plotGate_labkey <- function(G,parentID,x,y,smooth=FALSE,cond=NULL,xlab=NULL,ylab=NULL, overlay = NULL, overlay.symbol = NULL, key = NULL, ...){
  #get all childrens
  
  cids <- getChildren(G[[1]], parentID, showHidden = FALSE, path = "auto")
  if(length(cids)>0)
  {
    #try to match to projections
    isMatched<-lapply(cids,function(cid){
          g<-getGate(G[[1]],cid)
          if(class(g)!="booleanFilter") 
          {
            prj<-parameters(g)
            if(length(prj)==1)#1d gate
            {
              return (prj%in%c(x,y))
              
            }else
            {
              #2d gate but y is absent
              if(is.null(y))
                return (FALSE)
              #try to match x,y to 2d gate
              revPrj<-rev(prj)
              if((x==prj[1]&&y==prj[2])||(x==revPrj[1]&&y==revPrj[2]))
                return (TRUE)
              else
                return (FALSE)	
            }
          }else
            return (FALSE)
        })
    
    ind<-which(unlist(isMatched))
    if(length(ind)>0)
      isPlotGate<-TRUE
    else
      isPlotGate<-FALSE
  }else
    isPlotGate<-FALSE
  formula1 <- flowWorkspace:::mkformula(c(y,x),isChar=TRUE)
  if(!is.null(cond))
    formula1<-paste(formula1,cond,sep="|")
  formula1 <- as.formula(formula1)
	
  type <- ifelse(is.null(y), "densityplot","xyplot")
  if(isPlotGate)
    plotGate(G,cids[ind],formula=formula1,smooth=smooth,xlab=xlab,ylab=ylab, type = type, overlay = overlay, ...)
  else
  {
    fs<-getData(G,parentID)
    axisObject <- flowWorkspace:::.formatAxis(x=G[[1]],data=fs[[1]],xParam=x,yParam=y,...)
    if(is.null(xlab)){
      xlab <- axisObject$xlab
    }
    if(is.null(ylab)){
      ylab <- axisObject$ylab
    }
    if(type == "xyplot"){
      if(!is.null(overlay)){
        if(is.null(overlay.symbol)){
          # set symbol color automatically if not given
          nOverlay <- length(overlay)
          overlay.fill <- RColorBrewer::brewer.pal(9,"Set1")[1:nOverlay]
          names(overlay.fill) <- overlay
          overlay.symbol <- sapply(overlay.fill, function(col)list(fill = col), simplify = FALSE)
        }
        #set legend automatically if it is not given
        if(is.null(key)){
          
          key = list(text = list(names(overlay.symbol), cex = 0.6)
              , points = list(col = sapply(overlay.symbol, "[[", "fill") 
                  , pch = 19
                  , cex = 0.5) 
              , columns = length(overlay.symbol)
              , between = 0.3
              , space = "bottom"
              , padding.text = 5)
        }
      overlay <- sapply(overlay, function(thisOverlay)getData(G,thisOverlay)[,c(y,x)])
    }
      xyplot(formula1
          ,fs
          ,smooth=smooth
          ,xlab=xlab
          ,ylab=ylab
          ,scales=axisObject$scales
          , overlay = overlay
          , overlay.symbol = overlay.symbol
          , key = key
          ,...
              )  
    }else{
      densityplot(formula1
          ,fs
          ,xlab=xlab
          ,scales=axisObject$scales
          ,...)
    }
  }
};

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

