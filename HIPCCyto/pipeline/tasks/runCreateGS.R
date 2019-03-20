#---------------------------
# DEPENDENCIES
#----------------------------

library(Rlabkey)
library(ImmuneSpaceR)
library(flowWorkspace)
library(data.table)

#----------------------------
# FUNCTIONS
#----------------------------

.getGS <- function(ws, group_id_num = 1) {
    gs <- parseWorkspace(ws,
                         name = group_id_num,
                         keywords = c("DAY", "TREATMENT", "TUBE NAME"),
                         isNCdf = TRUE,
                         additional.sampleID = TRUE) # this is a hidden option not exposed in parseWorkspace docs
    pData(gs)$FILENAME <- basename(as.character(keyword(gs, "FILENAME")$FILENAME))
    pData(gs)$panel <- unlist(lapply(gs@data@frames, function(x){
                                     markers <- markernames(x)
                                     paste(markers[markers != "-"], collapse = "|")
    }))[rownames(pData(gs))]
    return(gs)
}

.updateGuid <- function(gs, guid) {
    gs@guid <- guid
    return(gs)
}

.runData <- function(gs, group_id, group_name, wsid, ws, sdy) {
    wsid <- wsid
    workspace <- ws@file
    gating_set <- gs@guid
    group_id <- as.character(group_id)
    group_name <- as.character(group_name)
    num_samples <- length(gs@data@phenoData@data$name)
    num_unique_days <- length(unique(pData(gs)$DAY))
    num_unique_trt <- length(unique(pData(gs)$TREATMENT))
    num_unique_tube <- length(unique(pData(gs)$`TUBE NAME`))
    panels <- paste(unique(pData(gs)$panel), collapse = "; ")
    fw_version <- as.character(packageVersion("flowWorkspace"))
    study <- sdy
    run <- data.table(gating_set, wsid, workspace, group_id, group_name,group_name, num_samples, num_unique_days,
                                      num_unique_trt, num_unique_tube, panels, fw_version, study)
    return(run)
}

.inputFiles <- function(gs, wsid, wsdir, labkey.url.base, labkey.url.path) {
    fcs <- pData(gs)$FILENAME
    input_files <- labkey.selectRows(baseUrl = labkey.url.base,
                                     folderPath = labkey.url.path,
                                     schemaName = "study",
                                     queryName = "fcs_sample_files",
                                     colNameOpt = "rname",
                                     colSelect = c("file_info_name", "ParticipantId", "biosample_accession", "expsample_accession", 
                                                   "study_accession"))
    input_files <- input_files[input_files$file_info_name %in% fcs, ]
    input_files$wsid <- wsid
    input_files$gsdir <- paste0(wsdir,"/",gs@guid)
    labkey.insertRows(baseUrl = labkey.url.base,
                      folderPath = labkey.url.path,
                      schemaName = "cytometry_processing",
                      queryName = "gatingSetInputFiles",
                      toInsert = input_files)
}


#--------------------------
# PIPELINE
#--------------------------

runCreateGS <- function(labkey.url.base,
                        labkey.url.path,
                        pipeline.root,
                        data.directory,
                        analysis.directory,
                        output.tsv,
                        onCL = FALSE) {
    
    sdy <- gsub("/Studies/", "", labkey.url.path)
    wsid <- gsub(".tsv", "", output.tsv)

    ##---------------CHECK-FOR-FILES---------------##
    
    # check for workspace file in correct format (xml)
    ws_regex <- paste0(wsid, ".*xml$")
    ws_file <- list.files(data.directory, pattern = ws_regex, full.names = TRUE)

    if ( length(ws_file) == 0 ) {
        stop("No XML workspace files found")
    }
    
    # check the wsid is unique to a single workspace file
    if ( length(ws_file) > 1 ) {
        stop(paste0("More than one workspace found with ID: ", wsid))
    }

    # check that analysis directory exists
    if (!file.exists(analysis.directory)) {
        dir.create(analysis.directory, recursive = TRUE)
    }
    
    # create output directory
    outpath <- paste0(pipeline.root, "/analysis/gating_set/")    
    if (!file.exists(outpath)) {
        dir.create(outpath, recursive = TRUE)
    }
    
    # create gating set directory path
    # don't create directory yet...
    # for studies outputting gs using save_gslist wsdir should not exist
    # for studies outputting gs using save_gs wsdire must exist
    wsdir <- paste0(outpath, wsid) 
    
    ##---------------HARDCODED-METADATA---------------##
    # Manually curate a list to avoid hardcoding throughout
    metaData <- list()

    # **RmGrp**
    # If a workspace requires a group to be removed add the logic here and log why
    # the group has been removed.

    # SDY113 - Group 3 - 885 controls
    # For this study controls were put in their own group as well as the other corrosponding
    # plate # group. Gating sets should not have overlapping samples. We remove Group 3 to handle this.

    rmGroup <- sdy %in% c("SDY113")

    if ( rmGroup ){
        if ( sdy == "SDY113"){
            group <- 3
        }
    } else { group <- NA }
    metaData$rmGrp <- data.table(rmGroup = rmGroup, group = group)
        
    ##---------------ACCESS-BASIC-WORKSPACE-INFO---------------##
    ws <- openWorkspace(ws_file)

    sample_groups <- getSampleGroups(ws)
    groups <- unique(sample_groups[, c("groupID", "groupName")])
    
    # assign group #
    groups$groupNumber <- seq(1:nrow(groups))
    
    # remove groups as needed
    if ( metaData$rmGrp$rmGroup ){
        groups <- groups[ -(metaData$rmGrp$group), ]
    }

    ##---------------PARSE-WS-AND-OUTPUT-GS---------------##
    if ( nrow(groups) == 1 ) {
        gs <- .getGS(ws)
        gs@guid <- paste0(sdy, "_", wsid, "_GS", groups$groupID)
        
        # check directories for save_gs to run
        if (!file.exists(wsdir)) {
            dir.create(wsdir, recursive = TRUE)
        }
        
        gsdir <- paste0(wsdir, "/", gs@guid)
        if (file.exists(gsdir)) {
            stop('gsdir exists -- must delete before proceeding')
        }
        
        
        run <- .runData(gs, groups$groupID, groups$groupName, wsid, ws, sdy)
        save_gs(gs,
                gsdir,
                cdf="copy")
        input <- .inputFiles(gs, wsid, gsdir, labkey.url.base, labkey.url.path)
        } else {
            # remove all samples
            groups <- subset(groups, groups$groupName != "All Samples")
            
            group_num <- groups$groupNumber
            group_id <- groups$groupID
            group_name <- groups$groupName

            gs_list <- lapply(group_num, function(num) {
                              .getGS(ws = ws, group_id_num = num)
            })

            guids <- paste0(sdy, "_", wsid, "_GS", group_id)
            gs_list <- mapply(.updateGuid, gs_list, guids)


            run <- mapply(.runData, gs_list, group_id, group_name, MoreArgs= list(wsid, ws, sdy), SIMPLIFY = FALSE)
            run <- data.table(do.call(rbind, run))
            
            save_gslist(GatingSetList(gs_list),
                        wsdir,
                        cdf="copy")            
            
            lapply(gs_list, function(gs) {
                   .inputFiles(gs, wsid, wsdir,  labkey.url.base, labkey.url.path)
            })

        }

    # ${tsvout:tsvfile}
    write.table(run,
                file = output.tsv,
                sep="\t",
                row.names = FALSE)

    #--------------COPY-OVER-SCRIPT-FILES--------------##
    file.copy(from = "/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/create-gatingset.R",
              to = paste0(analysis.directory, "/create-gatingset-snapshot.R"))
    file.copy(from = "/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R",
              to = paste0(analysis.directory, "/runGS-snapshot.R"))


}
