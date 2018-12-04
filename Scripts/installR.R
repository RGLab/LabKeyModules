#!/usr/bin/env Rscript
args = commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  stop("Argument must be supplied (BUILD_TYPE)")
}

source("https://bioconductor.org/biocLite.R")
biocLite(c(
  scan("listOfNeededRPackages", what = "character"),
  "rmarkdown"
))

library(devtools)
install_github(c(
  paste0("RGLab/ImmuneSpaceR@", args[1]),
  paste0("RGLab/UpdateAnno@", args[1]),
  "RGLab/ImmuneSignatures"
))

# Install custom annotation packages
install_url(paste0("https://github.com/RGLab/UpdateAnno/raw/", args[1], "/FeatureAnnotationSetDev/hursta2a520709cdf.tar.gz"))
install_url(paste0("https://github.com/RGLab/UpdateAnno/raw/", args[1], "/FeatureAnnotationSetDev/huex10stv2cdf.tar.gz"))

