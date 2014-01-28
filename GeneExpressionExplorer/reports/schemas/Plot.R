suppressMessages( library( Cairo ) );

CairoPNG( filename='${imgout:Plot.png}' );

cohorts             <- RJSONIO::fromJSON( labkey.url.params$cohorts );
timePoint           <- as.numeric( labkey.url.params$timePoint );
timePointDisplay    <- labkey.url.params$timePointDisplay;
arrayGenes          <- RJSONIO::fromJSON( labkey.url.params$genes );

plot( 1:10 );

dev.off();
