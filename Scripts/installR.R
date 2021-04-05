#!/usr/bin/env Rscript
args = commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  stop("Argument must be supplied (BUILD_TYPE)")
}

install.packages("Rserve", , "http://cran.fhcrc.org") # install.packages("Rserve", , "http://www.rforge.net/")

install.packages("BiocManager", , "http://cran.fhcrc.org")
BiocManager::install(c(
  "remotes",
  scan("listOfNeededRPackages", what = "character"),
  "rmarkdown"
))

remotes::install_github(c(
  paste0("RGLab/ImmuneSpaceR@", args[1]),
  paste0("RGLab/UpdateAnno@", args[1]),
  "RGLab/ImmuneSignatures"
))

# Install custom annotation packages
remotes::install_url(paste0("https://github.com/RGLab/UpdateAnno/raw/", args[1], "/FeatureAnnotationSetDev/hursta2a520709cdf.tar.gz"))
remotes::install_url(paste0("https://github.com/RGLab/UpdateAnno/raw/", args[1], "/FeatureAnnotationSetDev/huex10stv2cdf.tar.gz"))

