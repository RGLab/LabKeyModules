# Basic pipeline for processing flow workspaces
# Take in workspace, parse, and output gating sets for each group and summary info for that run

# to do
# add handling for multiple workspaces
# figure out how to convert .jo files to xml
# do gating sets need their own sub directory?

library(flowWorkspace)
library(dplyr)

##----FUNCTIONS----##

.getGS <- function(ws, group_id_num = 1) {
    gs <- parseWorkspace(ws,
                         name = group_id_num,
                         isNCdf = TRUE)
}

.runData <- function(sdy, ws, gs, group_id) {
    file_name <- paste0(sdy, "_GS_", group_id, ".rda")
    workspace <- ws@file
    num_samples <- length(gs@data@phenoData@data$name)
    fw_version <- as.character(packageVersion("flowWorkspace"))

    run <- data.frame(file_name, workspace, num_samples, fw_version, stringAsFactors = FALSE)

    return(run)
}



##----PARSE-TASK-INFO----##

taskInfo <- "${pipeline, taskInfo}"

jobInfo <- read.table(taskInfo,
                      colnames = c("name", "value", "type"),
                      header = FALSE,
                      check.names = FALSE,
                      stringsAsFactors = FALSE,
                      sep = "\t",
                      quote = "",
                      fill = TRUE,
                      na.strings = "")

labkey.url.path <- jobInfo$value[ jobInfo$name == "containerPath"]

sdy <- gsub("/Studies/", "", labkey.url.path)

##----CHECK-FOR-FILES----##
# check for workspace file in correct format
fcs_dir <- file.path("/share", "files", "Studies", sdy, "@files", "rawdata", "flow_cytometry")
ws_files <- list.files(fcs_dir, pattern = ".xml", full.names = TRUE)

if (length(ws_files) == 0) {
    stop("No XML workspace files found")
}

gs_dir <- file.path("/share", "files", "Studies", sdy, "@files", "rawdata", "gating_set")

if (!file.exists(gs_dir)) {
    dir.create(gs_dir, recursive = TRUE)
}

ws <- openWorkspace(ws_names)

##----ACCESS-BASIC-WORKSPACE-INFO----##

sample_groups <- getSampleGroups(ws)
group_ids <- unique(sample_groups$groupID)

if (length(group_ids) == 1) {
    gs <- .getGS(ws)
    run <- .runData(sdy, ws, gs, group_ids)
    save_gs(gs, gs_dir)
}
# still working on handilng of multiple group id output
else {
    stop("multiple group_ids")
}

##----WRITE-RUN-DATA-TO-TABLE----##

write.table(run, paste0(gs_dir, "/runs.tsv"), sep = "\t")
