#${input.txt}
#--------------------------------
# DEPENDENCIES
#--------------------------------

# NOTES:
# Wrapper function, separated for sourcing when running on CL
# running from UI.

source("~/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R")

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

pipelineRoot        <- jobInfo$value[ jobInfo$name == "pipeRoot" ]
labkeyUrlPath       <- jobInfo$value[ jobInfo$name == "containerPath" ]
labkeyUrlBase       <- jobInfo$value[ jobInfo$name == "baseUrl" ]
analysisDirectory   <- jobInfo$value[ jobInfo$name == "analysisDirectory" ]
dataDirectory       <- jobInfo$value[ jobInfo$name == "dataDirectory" ]
protocol            <- jobInfo$value[ jobInfo$name == "protocol" ]

# From LABKEY.Pipeline.startAnalysis in views/CreateMatrix.html.
# Vars are interpreted in the create-gatingset.R file generated in
# /share/files/Studies/SDY123/@files/rawdata/flow_cytometry/create-gatingset/gatingset/gatingset.work
# This directory is removed once work is finished, hence need for
# outputting version within pipeline for reproducibility.
# You can often find this info though in the gatingset.log file
# found in the .../create-gatingset/gatingset subdir.

runCreateGS(labkeyUrlBase = labkeyUrlBase,
            labkeyUrlPath = labkeyUrlPath,
            pipelineRoot = pipelineRoot,
            dataDirectory = dataDirectory,
            analysisDirectory = analysisDirectory,
            protocol = protocol,
            onCl = FALSE)

# Notes:
# for running at command line, use command line function  which
# generates variables from the matrices currently available instead
# of trying to parse logs and taskInfo tsv files.

