args = commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {

	  stop("Argument must be supplied (BUILD_TYPE)")

}

if (length(args) == 1) {

	  stop("Argumant must be supplied GITHUB_PAT")

}

BiocManager::install("patchwork")


BiocManager::install("ComplexHeatmap")

# re-install preprocessCore to avoid issue with openblas >= 0.3.5
# https://support.bioconductor.org/p/122925/
BiocManager::install("preprocessCore", configure.args="--disable-threading", force=TRUE)

devtools::install_github("dleelab/pvca", ref = "master")
devtools::install_github("stefanavey/titer", ref = "master")
devtools::install_github("LBMC/RAPToR", ref = "master")

devtools::install_github("RGLab/ImmuneSignatures2", ref = "dev", auth_token = args[2])
