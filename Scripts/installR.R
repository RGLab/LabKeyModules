#!/usr/bin/env Rscript
args = commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  stop('Argument must be supplied (BUILD_TYPE)')
}

source('https://bioconductor.org/biocLite.R')
biocLite(c(
  scan('listOfNeededRPackages', what = 'character'),
  'rmarkdown'
))

library(devtools)
install_github(c(
  paste0('RGLab/ImmuneSpaceR@', args[1]),
  'RGLab/UpdateAnno',
  'RGLab/ImmuneSignatures'
))

