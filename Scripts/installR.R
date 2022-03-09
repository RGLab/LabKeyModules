#!/usr/bin/env Rscript
args = commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  stop("Argument must be supplied (BUILD_TYPE)")
}

install.packages("Rserve", repos = "https://cran.rstudio.com/")

install.packages("BiocManager", repos = "https://cran.rstudio.com/")
BiocManager::install(c(
  "remotes",
  scan("listOfNeededRPackages", what = "character"),
  "rmarkdown"
))

remotes::install_github(c(
  paste0("RGLab/ImmuneSpaceR@", args[1]),
  "RGLab/ImmuneSignatures",
  paste0("RGLab/HIPCMatrix@", args[1]),
  "RGLab/HIPCCyto",
  "RGLab/AnalyteExplorer",
  "RGLab/ImmPortR"
), dependencies = TRUE)

# Install custom annotation packages
remotes::install_url(paste0("https://github.com/RGLab/HIPCMatrix/raw/", args[1], "/inst/FeatureAnnotationSetDev/hursta2a520709cdf.tar.gz"))
remotes::install_url(paste0("https://github.com/RGLab/HIPCMatrix/raw/", args[1], "/inst/FeatureAnnotationSetDev/huex10stv2cdf.tar.gz"))

remotes::install_url("https://cran.r-project.org/src/contrib/Archive/pheatmap/pheatmap_1.0.8.tar.gz")
remotes::install_url("https://www.bioconductor.org/packages//2.10/bioc/src/contrib/DESeq_1.8.3.tar.gz")
