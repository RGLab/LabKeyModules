# Basic pipeline for processing flow workspaces
# Take in workspace, parse, and output gating sets for each group and summary info for that run

# to do
# add handling for multiple workspaces
# figure out how to convert .jo files to xml
# do gating sets need their own sub directory?

library(flowWorkspace)
library(dplyr)


##----GET-WS-FILE----##

sdy <- "SDY416"
fcs_dir <- file.path("/share","files", "Studies", sdy, "@files", "rawdata", "flow_cytometry")
fcs_names <- list.files(fcs_dir, pattern="*.fcs", full.names = TRUE)

# Will have to modify to include .jo
# FlowWorkspace cannot parse .jo -- will need to pull it and output xml??
ws_names <- list.files(fcs_dir, pattern="*.xml", full.names = TRUE)

print(paste0("There are ", length(ws_names), " workspace files for ", sdy))

##----OPEN-WS----##

ws <- openWorkspace(ws_names)

##----ACCESS-BASIC-WORKSPACE-INFO----##

sample_groups <- getSampleGroups(ws)
group_ids <- unique(sample_groups$groupID)

##----PARSE-WS----##

## CHANGE TO THIS DIRECTORY
gs_dir <- file.path("/share","files", "Studies", sdy, "@files", "rawdata", "gating_set")
gs_files <- list.files(gs_dir, pattern="*.rds", full.names = TRUE)

if (!file.exists(gs_dir)) {
  dir.create(gs_dir, recursive = TRUE)
}

run_data <- lapply(seq(length(group_ids)), FUN = function(group) {
  gs <- parseWorkspace(ws,
                       name = group,
                       isNCdf = TRUE)
  file_name <- paste0(sdy, "_gs", group, ".rda")
  workspace <-
  group_id <- group_ids[group]
  num_samples <- length(gs@data@phenoData@data$name)
  fw_version <- packageVersion("flowWorkspace")

  run_data <- data.frame(file_name, num_samples, group_id, fw_version)

  save_gs(gs, gs_dir)

  return(run_data)
})


##----WRITE-RUN-DATA-TO-TABLE----##

