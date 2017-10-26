#!/usr/bin/env Rscript
args = commandArgs( trailingOnly = TRUE )

if ( length( args ) == 0 ){
    stop( 'Argument must be supplied (BUILD_TYPE)' )
} else {
    if ( args[1] == 'master' ){
        branch = 'trunk'
    } else {
        branch = 'master' # args[1] should be 'release'
    }
}

source( 'https://bioconductor.org/biocLite.R' )
biocLite( c( scan('listOfNeededRPackages', what = 'character' ), 'rmarkdown' ) )

library( devtools )
install_github(
    paste0( 'RGLab/ImmuneSpaceR@', branch ),
    'RGLab/UpdateAnno',
    'RGLab/ImmuneSignatures'
)

