# For re-running matrices by hand to debug the runCreateMx.R script
# From the /share/files/Studies/<SDY>/@files/rawdata/gene_expression/create-matrix/<Run> dir

# To load libraries
source("~/LabKeyModules/HIPCMatrix/pipeline/tasks/runCreateMx.R")

# Get vars from table written out at time
varDf <- read.table("create-matrix-vars.tsv",
                    sep = "\t",
                    header = TRUE,
                    stringsAsFactors = FALSE)

labkey.url.base    <- varDf$labkey.url.base
labkey.url.path    <- varDf$labkey.url.path
pipeline.root      <- varDf$pipeline.root
analysis.directory <- varDf$analysis.directory
selectedBiosamples <- varDf$selectedBiosamples
fasId              <- varDf$fasId
taskOutputParams   <- varDf$taskOutputParams
output.tsv         <- varDf$output.tsv

# default Arg
onCL <- FALSE

# Notes: good idea to scan the runCreateMx.R-snapshot created at the
# time in case it has been changed since. When you get to `makeRawMatrix()`
# will need to also set study <- con$study.  Otherwise should run through.

# Start from within runCreateMx.R here ...
