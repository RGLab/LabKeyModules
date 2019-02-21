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
                         subset = 1:15,
                         name = group_id_num,
                         keywords = c("DAY", "TREATMENT", "TUBE NAME"),
                         isNCdf = TRUE)
    pData(gs)$FILENAME <- basename(as.character(keyword(gs, "FILENAME")$FILENAME))
    return(gs)
}

.runData <- function(gs, group_id, group_name, wsID, ws, sdy) {
    gs@guid <- paste0(sdy, "_", wsID, "_GS", group_id)
    wsID <- wsID
    workspace <- ws@file
    gating_set <- gs@guid
    group_id <- as.character(group_id)
    num_samples <- length(gs@data@phenoData@data$name)
    num_unique_days <- length(unique(pData(gs)$DAY))
    num_unique_trt <- length(unique(pData(gs)$TREATMENT))
    num_unique_tube <- length(unique(pData(gs)$`TUBE NAME`))
    fw_version <- as.character(packageVersion("flowWorkspace"))
    study <- sdy
    run <- data.frame(wsID, workspace, gating_set, group_id, group_name,group_name, num_samples, num_unique_days,
                                      num_unique_trt, num_unique_tube, fw_version, study,
                                      stringsAsFactors = FALSE)
    return(run)
}

.inputFiles <- function(gs, wsID, gsdir, labkey.url.base, labkey.url.path) {
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
    input_files$wsID <- wsID
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
                        output.tsv,
                        onCL = FALSE) {
    
    sdy <- gsub("/Studies/", "", labkey.url.path)
    wsID <- gsub(".tsv", "", output.tsv)

    ##----CHECK-FOR-FILES----##
    # check for workspace file in correct format
    
    ws_regex <- paste0(wsID, ".*xml$")
    ws_file <- list.files(data.directory, pattern = ws_regex, full.names = TRUE)

    if ( length(ws_file) == 0 ) {
        stop("No XML workspace files found")
    }
    
    if ( length(ws_file) > 1 ) {
        stop(paste0("More than one workspace found with ID: ", wsID))
    }

    # check that analysis directory exists
    if (!file.exists(analysis.directory)) {
        dir.create(analysis.directory, recursive = TRUE)
    }
    
    # create output directory
    outpath <- paste0(pipeline.root, "/analysis/gating_set/")    
    if (!file.exists(analysis.directory)) {
        dir.create(analysis.directory, recursive = TRUE)
    }

    ##----ACCESS-BASIC-WORKSPACE-INFO----##
    ws <- openWorkspace(ws_file)

    sample_groups <- getSampleGroups(ws)
    groups <- unique(sample_groups[, c("groupID", "groupName")])
    
    groups$groupNumber <- seq(1:nrow(groups))
    
    gsdir <- paste0(outpath, wsID)

    if ( nrow(groups) == 1 ) {
        gs <- .getGS(ws)
        run <- .runData(gs, groups$groupID, groups$groupName, wsID, ws, sdy)
        save_gs(gs,
                gsdir,
                cdf="copy")
        input <- .inputFiles(gs, gsdir, labkey.url.base, labkey.url.path)
        } else {
            # remove all samples
            groups <- subset(groups, groups$groupName != "All Samples")
            
            group_num <- groups$groupNumber
            group_id <- groups$groupID
            group_name <- groups$groupName

            gs_list <- lapply(group_num, function(num) {
                              .getGS(ws = ws, group_id_num = num)
            })

            run <- mapply(.runData, gs_list, group_id, group_name, MoreArgs= list(wsID, ws, sdy), SIMPLIFY = FALSE)
            run <- data.frame(do.call(rbind, run))

            save_gslist(GatingSetList(gs_list),
                        gsdir,
                        cdf = "copy")

            lapply(gs_list, function(gs) {
                   .inputFiles(gs, wsID, gsdir, labkey.url.base, labkey.url.path)
            })
        }

    # ${tsvout:tsvfile}
    write.table(run,
                file = output.tsv,
                sep="\t",
                row.names = FALSE)

#----COPY-OVER-SCRIPT-FILES----##
    file.copy(from = "/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/create-gatingset.R",
              to = paste0(analysis.directory, "/create-gatingset-snapshot.R"))
    file.copy(from = "/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R",
              to = paste0(analysis.directory, "/runGS-snapshot.R"))


}
