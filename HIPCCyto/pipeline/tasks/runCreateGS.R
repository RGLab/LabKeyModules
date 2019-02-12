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
                         subset = 1:50,
                         name = group_id_num,
                         keywords = c("DAY", "TREATMENT", "TUBE NAME"),
                         isNCdf = TRUE)
    pData(gs)$FILENAME <- basename(as.character(keyword(gs, "FILENAME")$FILENAME))
    return(gs)
}

.runData <- function(sdy, ws, gs, group_id) {
    gating_set <- gs@guid
    workspace <- ws@file
    group_id <- as.character(group_id)
    num_samples <- length(gs@data@phenoData@data$name)
    num_unique_days <- length(unique(pData(gs)$DAY))
    num_unique_trt <- length(unique(pData(gs)$TREATMENT))
    num_unique_tube <- length(unique(pData(gs)$`TUBE NAME`))
    fw_version <- as.character(packageVersion("flowWorkspace"))
    study <- sdy
    run <- data.frame(gating_set, workspace, group_id, num_samples, num_unique_days,
                                      num_unique_trt, num_unique_tube, fw_version, study)
    return(run)
}

.inputFiles <- function(gs, gsdir, labkey.url.base, labkey.url.path) {
    fcs <- pData(gs)$FILENAME
    input_files <- labkey.selectRows(baseUrl = labkey.url.base,
                                     folderPath = labkey.url.path,
                                     schemaName = "study",
                                     queryName = "fcs_sample_files",
                                     colNameOpt = "rname",
                                     colSelect = c("file_info_name", "ParticipantId", "biosample_accession", "expsample_accession", 
                                                   "study_accession"))
    input_files <- input_files[input_files$file_info_name %in% fcs, ]
    input_files$gsdir <- gsdir
    labkey.insertRows(baseUrl = labkey.url.base,
                      folderPath = labkey.url.path,
                      schemaName = "cytometry_processing",
                      queryName = "gatingSetInputFiles",
                      toInsert = input_files)
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
                    cdf="copy")
            input <- .inputFiles(gs, gsdir, labkey.url.base, labkey.url.path)
        } else {
            stop("multiple group_ids") # add handling for multiple group ids
        }
    } else {
        stop("multiple_workspaces")
    }

    # ${tsvout:tsvfile}
    write.table(run,
                file = paste0(outpath, "/runs.tsv"),
                sep="\t",
                row.names = FALSE)

#----COPY-OVER-SCRIPT-FILES----##
    file.copy(from = "/share/github/LabKeyModules/HIPCCytdo/pipeline/tasks/create-gatingset.R",
              to = paste0(analysis.directory, "/create-gatingset-snapshot.R"))
    file.copy(from = "/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R",
              to = paste0(analysis.directory, "/runGS-snapshot.R"))

    #return( list(run = run, input = input))

}
