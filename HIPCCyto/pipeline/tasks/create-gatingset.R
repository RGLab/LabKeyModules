#${input.txt}
#--------------------------------
# DEPENDENCIES
#--------------------------------

# NOTES:
# Wrapper function, separated for sourcing when running on CL
# running from UI.

source("/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R")

#--------------------------------
# PARAMS & EXECUTION
#--------------------------------

taskInfo <- "${pipeline, taskInfo}" # separated to make debugging locally easier

## taskInfo.tsv inputs
jobInfo <- read.table(taskInfo,
                      col.names = c("name", "value"),
                      header = FALSE,
                      check.names = FALSE,
                      stringsAsFactors = FALSE,
                      sep = "\t",
                      quote = "",
                      fill = TRUE,
                      na.strings = "")

pipe.root           <- jobInfo$value[ jobInfo$name == "pipeRoot" ]
labkey.url.path     <- jobInfo$value[ jobInfo$name == "containerPath" ]
labkey.url.base     <- jobInfo$value[ jobInfo$name == "baseUrl" ]
analysis.directory  <- jobInfo$value[ jobInfo$name == "analysisDirectory" ]
data.directory      <- jobInfo$value[ jobInfo$name == "dataDirectory" ]
output.tsv          <- jobInfo$value[ jobInfo$name == "output.tsv" ]

# From LABKEY.Pipeline.startAnalysis in views/CreateMatrix.html.
# Vars are interpreted in the create-gatingset.R file generated in
# /share/files/Studies/SDY123/@files/rawdata/flow_cytometry/create-gatingset/gatingset/gatingset.work
# This directory is removed once work is finished, hence need for
# outputting version within pipeline for reproducibility.
# You can often find this info though in the gatingset.log file
# found in the .../create-gatingset/gatingset subdir.

runCreateGS(labkey.url.base = labkey.url.base,
            labkey.url.path = labkey.url.path,
            pipeline.root = pipe.root,
            data.directory = data.directory,
            analysis.directory = analysis.directory,
            output.tsv = output.tsv,
            onCL = FALSE)

# Notes:
# for running at command line, use or look at runCGS_allCL.R which
# generates variables from the matrices currently available instead
# of trying to parse logs and taskInfo tsv files.

