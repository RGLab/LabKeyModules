#--------------------------------
# DEPENDENCIES
#--------------------------------

# NOTES:
# 1. Wrapper function, separated for sourcing when running on CL
# 2. other libraries loaded in createMatrixWrapper.R
# 3. Using full path because script is copied to study-specific directory for 
# running from UI.
source("/share/github/LabKeyModules/HIPCMatrix/pipeline/tasks/runCreateMx.R")

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

labkey.url.base     <- jobInfo$value[ jobInfo$name == "baseUrl"]
labkey.url.path     <- jobInfo$value[ jobInfo$name == "containerPath"]
pipeline.root       <- jobInfo$value[ jobInfo$name == "pipeRoot"]
analysis.directory  <- jobInfo$value[ jobInfo$name == "analysisDirectory"]
output.tsv          <- jobInfo$value[ jobInfo$name == "output.tsv"]

selectedBiosamples <- NULL # legacy from Renan ... why?

# From LABKEY.Pipeline.startAnalysis in views/CreateMatrix.html.
# Vars are interpreted in the create-matrix.R file generated in
# /share/files/Studies/SDY123/@files/rawdata/gene_expression/create-matrix/mxName/mxName.work
# This directory is removed once work is finished, hence need for
# outputting version within pipeline for reproducibility.
# You can often find this info though in the mxName.log file
# found in the .../create-matrix/mxName subdir.
selectedBiosamples <- "${selected-biosamples}"
fasId              <- "${assay run property, featureSet}"
taskOutputParams   <- "${pipeline, taskOutputParams}"

runCreateMx(labkey.url.base = labkey.url.base,
            labkey.url.path = labkey.url.path,
            pipeline.root = pipeline.root,
            analysis.directory = analysis.directory,
            output.tsv = output.tsv,
            selectedBiosamples = selectedBiosamples,
            fasId = fasId,
            taskOutputParams = taskOutputParams
)

# Notes:
# for running at command line, use or look at runCM_allCL.R which
# generates variables from the matrices currently available instead
# of trying to parse logs and taskInfo tsv files.
