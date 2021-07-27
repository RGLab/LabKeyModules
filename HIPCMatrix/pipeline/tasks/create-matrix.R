#--------------------------------
# DEPENDENCIES
#--------------------------------
library(HIPCMatrix)
#--------------------------------
# PARAMS & EXECUTION
#--------------------------------

taskInfo <- "${pipeline, taskInfo}" # separated to make debugging locally easier

## taskInfo.tsv inputs
jobInfo <- read.table(taskInfo,
                      col.names = c("name", "value", "type"),
                      header = FALSE,
                      check.names = FALSE,
                      stringsAsFactors = FALSE,
                      sep = "\t",
                      quote = "",
                      fill = TRUE,
                      na.strings = "")


selectedBiosamples <- NULL # legacy from Renan ... why?

# From LABKEY.Pipeline.startAnalysis in views/CreateMatrix.html.
# Vars are interpreted in the create-matrix.R file generated in
# /share/files/Studies/SDY123/@files/rawdata/gene_expression/create-matrix/mxName/mxName.work
# This directory is removed once work is finished, hence need for
# outputting version within pipeline for reproducibility.
# You can often find this info though in the mxName.log file
# found in the .../create-matrix/mxName subdir.
fas_id <- "${assay run property, featureSet}"
taskOutputParams <- "${pipeline, taskOutputParams}"


labkey.url.base <- jobInfo$value[ jobInfo$name == "baseUrl"]
labkey.url.path <- jobInfo$value[ jobInfo$name == "containerPath"]
study <- gsub("/Studies/", "", labkey.url.path)
matrix_name <- jobInfo$value[ jobInfo$name == "protocol"]
base_dir <- jobInfo$value[ jobInfo$name == "pipeRoot"]
selected_biosamples <- "${selected-biosamples}"
output.tsv <- "${output.tsv}"


runCreateMx(study = study,
            matrix_name = matrix_name,
            selected_biosamples = selected_biosamples,
            fas_id = fas_id,
            labkey.url.base = labkey.url.base,
            base_dir = base_dir,
            # Need to write outputs to wd for pipeline module to correctly
            # read them. They will be moved to correct location as part of
            # pipeline.
            output_dir = normalizePath("."),
            taskOutputParams = taskOutputParams,
            verbose = TRUE,
            snapshot = TRUE
)

# Notes:
# for running at command line, use or look at runCM_allCL.R which
# generates variables from the matrices currently available instead
# of trying to parse logs and taskInfo tsv files.
