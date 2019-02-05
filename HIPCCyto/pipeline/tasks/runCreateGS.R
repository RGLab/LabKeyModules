#---------------------
# DEPENDENCIES
#----------------------

library(Rlabkey)
library(ImmuneSpaceR)
library(flowWorkspace)
library(dplyr)

#----------------------
# FUNCTIONS
#----------------------

.getGS <- function(ws, group_id_num = 1) {
    gs <- parseWorkspace(ws,
                         subset = 1:2,
                         name = group_id_num,
                         keywords = c("DAY", "TREATMENT", "TUBE NAME"),
                         isNCdf = TRUE)
}

.runData <- function(sdy, ws, gs, group_id) {
    gating_set <- paste0(gs@guid, ".rds")
    workspace <- ws@file
    group_id <- as.character(group_id)
    num_samples <- length(gs@data@phenoData@data$name)
    fw_version <- as.character(packageVersion("flowWorkspace"))
    study <- sdy
    run <- data.frame(gating_set, workspace, group_id, num_samples, fw_version, study)

    return(run)
}

.inputFiles <- function(gs, gsdir, labkey.url.base, labkey.url.path) {
    fcs <- basename(as.character(flowWorkspace::keyword(gs, "FILENAME")$FILENAME))
    input_files <- labkey.selectRows(baseUrl = labkey.url.base,
                                     folderPath = labkey.url.path,
                                     schemaName = "study",
                                     queryName = "fcs_sample_files",
                                     colNameOpt = "rname",
                                     colSelect = c("file_info_name", "ParticipantId", "biosample_accession", "expsample_accession", 
                                                   "study_accession", "study_time_collected", "study_time_collected_unit"))
    input_files <- input_files[input_files$file_info_name %in% fcs, ]
    input_files$gs_dir <- gsdir
    return(input_files)
}


#--------------------
# PIPELINE
#--------------------

runCreateGS <- function(labkey.url.base,
                        labkey.url.path,
                        pipeline.root,
                        data.directory,
                        analysis.directory,
                        onCL = FALSE) {
    
    sdy <- gsub("/Studies/", "", labkey.url.path)

    ##----CHECK-FOR-FILES----##
    # check for workspace file in correct format

    ws_files <- list.files(data.directory, pattern = ".xml", full.names = TRUE)

    if (length(ws_files) == 0) {
        stop("No XML workspace files found")
    }

    # check that analysis directory exists
    if (!file.exists(analysis.directory)) {
        dir.create(analysis.directory, recursive = TRUE)
    }   

    # check for / generate outpath
    outpath <- file.path(pipeline.root, "analysis/gating_set")
    if (!file.exists(outpath)) {
        dir.create(outpath, recusive = TRUE)
    }

    ##----ACCESS-BASIC-WORKSPACE-INFO----##
    ws <- openWorkspace(ws_files)

    sample_groups <- getSampleGroups(ws)
    group_ids <- unique(sample_groups$groupID)

    if (length(ws_files) == 1) {

        if (length(group_ids) == 1) {
            gsdir <- file.path(outpath, paste0("WS1_GS", group_ids))
            gs <- .getGS(ws)
            gs@guid <- paste0(sdy, "_WS1_GS", group_ids)
            run <- .runData(sdy, ws, gs, group_ids)
            save_gs(gs,
                    gsdir,
                    cdf="skip")
            input <- .inputFiles(gs, gsdir, labkey.url.base, labkey.url.path)
        } else {
            stop("multiple group_ids") # add handling for multiple group ids
        }
    } else {
        stop("multiple_workspaces")
    }

    return( list(run = run, input = input))


    #write.table(input,
    #            file = paste0(analysis.directory, "/bleh/", sdy, "_input_files.csv"),
    #            sep=",",
    #            quote = FALSE,
    #            row.names = FALSE)

    ##----COPY-OVER-SCRIPT-FILES----##
    #file.copy(from = "/share/github/LabKeyModules/HIPCCytdo/pipeline/tasks/create-gatingset.R",
    #          to = paste0(analysis.directory, "/create-gatingset-snapshot.R"))
    #file.copy(from = "/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R",
    #          to = paste0(analysis.directory, "/runGS-snapshot.R"))

}
