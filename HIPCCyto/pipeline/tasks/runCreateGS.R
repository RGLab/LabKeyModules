#------------------------------------------------
# DEPENDENCIES
#------------------------------------------------

library(Rlabkey)
library(ImmuneSpaceR)
library(flowWorkspace)
library(CytoML)
library(data.table)

#------------------------------------------------
# HELPER FUNCTIONS
#------------------------------------------------

.getGS <- function(ws, groupIdNum = 1) {
    message(paste0("Parsing gating set\ngroupId: ", groupIdNum))
    gs <- tryCatch(parseWorkspace(ws,
                         name = groupIdNum,
#                         subset = 1:20,
                         keywords = c("DAY", "TREATMENT", "TUBE NAME"),
                         isNCdf = TRUE,
                         additional.sampleID = TRUE),
                  error = function(e) {
                     return(NA)
                  }
                 )
    pData(gs)$FILENAME <- basename(as.character(keyword(gs, "FILENAME")$FILENAME))
    pData(gs)$panel <- unlist(lapply(gs@data@frames, function(x){
                                     markers <- markernames(x)
                                     paste(markers[markers != "-"], collapse = "|")
    }))[rownames(pData(gs))]

    message(paste0("Parsing gating set\ngroupId: ", groupIdNum))
    return(gs)
}

.updateGuid <- function(gs, guid) {
    gs@guid <- guid
    return(gs)
}

.runData <- function(gs, groupId, groupName, wsid, ws, sdy, labkeyUrlBase, labkeyUrlPath) {

    run <- data.frame(gating_set = gs@guid,
                      workspace = ws@file,
                      wsid = wsid,
                      group_id = as.character(groupId),
                      group_name = as.character(groupName),
                      num_samples = length(gs@data@phenoData@data$name),
                      num_unique_days = length(unique(pData(gs)$DAY)),
                      num_unique_trt = length(unique(pData(gs)$TREATMENT)),
                      num_unique_tube = length(unique(pData(gs)$`TUBE NAME`)),
                      panels = paste(unique(pData(gs)$panel), collapse = "; "),
                      fw_version = as.character(packageVersion("flowWorkspace")),
                      study = sdy,
                      created = format(Sys.time(), "%b %d %X %Y"))

    labkey.insertRows(baseUrl = labkeyUrlBase,
                      folderPath = labkeyUrlPath,
                      schemaName = "cytometry_processing",
                      queryName = "gatingSetMetaData",
                      toInsert = run)
}

.inputFiles <- function(gs, wsid, wsdir, labkeyUrlBase, labkeyUrlPath) {
    message(gs@guid)
    fcs <- pData(gs)$FILENAME
    sample <- labkey.selectRows(baseUrl = labkeyUrlBase,
                               folderPath = labkeyUrlPath,
                               schemaName = "study",
                               queryName = "fcs_sample_files",
                               colNameOpt = "fieldname",
                               colSelect = c("file_info_name", "ParticipantId",
                                             "biosample_accession", "expsample_accession",
                                             "study_accession"))
    control <- labkey.selectRows(baseUrl = labkeyUrlBase,
                                 folderPath = labkeyUrlPath,
                                 schemaName = "study",
                                 queryName = "fcs_control_files",
                                 colNameOpt = "fieldname",
                                 colSelect = c("control_file", "ParticipantId",
                                               "biosample_accession", "expsample_accession",
                                               "study_accession"))
    names(control)[1] <- "file_info_name"
    input <- rbind(control, sample)
    input <- input[input$file_info_name %in% fcs, ]
    input$wsid <- wsid
    input$gating_set <- gs@guid
    input$gsdir <- paste0(wsdir,"/",gs@guid)
    labkey.insertRows(baseUrl = labkeyUrlBase,
                      folderPath = labkeyUrlPath,
                      schemaName = "cytometry_processing",
                      queryName = "gatingSetInputFiles",
                      toInsert = input)
}


#------------------------------------------------
# PIPELINE
#------------------------------------------------

runCreateGS <- function(labkeyUrlBase,
                        labkeyUrlPath,
                        pipelineRoot,
                        dataDirectory,
                        analysisDirectory,
                        protocol,
                        onCl = FALSE) {

    sdy <- gsub("/Studies/", "", labkeyUrlPath)
    wsid <- protocol

    ## CHECK-FOR-FILES-------------------------------------------------------------------------------------------------

    # check for workspace file in correct format (xml)
    wsRegex <- paste0(wsid, ".*xml$")
    wsFile <- list.files(dataDirectory, pattern = wsRegex, full.names = TRUE)

    if ( length(wsFile) == 0 ) {
        stop("No XML workspace files found")
    }

    # check the wsid is unique to a single workspace file
    if ( length(wsFile) > 1 ) {
        stop(paste0("More than one workspace found with ID: ", wsid))
    }

    # check that analysis directory exists
    if (!file.exists(analysisDirectory)) {
        dir.create(analysisDirectory, recursive = TRUE)
    }

    # create output directory
    outpath <- paste0(pipelineRoot, "/analysis/gating_set/")
    if (!file.exists(outpath)) {
        dir.create(outpath, recursive = TRUE)
    }

    # create gating set directory path
    # don't create directory yet...
    # for studies outputting gs using save_gslist wsdir should not exist
    # for studies outputting gs using save_gs wsdir must exist
    wsdir <- paste0(outpath, wsid)

    ## HARDCODED-METADATA----------------------------------------------------------------------------------------------
    # Manually curate a list to avoid hardcoding throughout
    # See Notion > Documentation > Flow Cytometry > MetaData for more info
    metaData <- list()

    #*** RmGroup ***#
    # If a workspace requires a group to be removed add the logic here and log why
    # the group has been removed.
    # sdy = TRUE : remove groups

    # SDY113 - Group Number 3 - 885 controls
    # For this study controls were put in their own group as well as the other corrosponding
    # plate # group. Gating sets should not have overlapping samples. We remove Group 3 to handle this.

    # SDY301 Group Numbers 34-42
    # These groups were all missing fcs files (documented in Notion card `SDY301`).
    # While we investigate this we will parse the gating sets that run without error.

    rmGroup <- sdy %in% c("SDY113", "SDY301")

    if (sdy == "SDY113") {
        group <- 3
    } else if (sdy == "SDY301") {
        group <- c(34:42)
    } else {
        group <- NA
    }

    metaData$rmGroup <- data.table(rmGroup = rmGroup, group = group)

    #*** xmlMod ***#
    # Some workspaces appear to have been generated by an uncommon version
    # of FlowJo. The prefix/suffix used in the xml need to be modified to
    # be compliant with parseWorkspace.
    # xmlMod = TRUE : modify the xml and use that instead of original

    metaData$xmlMod <- sdy %in% c("SDY372", "SDY301")

    #*** gsList ***#
    # Workspaces that contain multiple groups with overlapping samples cannot be saved out
    # as a gatingSetList object. These must be saved out as multiple individual gatingSet objects
    # gsList = TRUE : use lapply(save_gs) instead of save_gsList

    metaData$gsList <- sdy %in% c("SDY301")

    ## MODIFY-WORKSPACE-XML--------------------------------------------------------------------------------------------

    if (metaData$xmlMod) {
        con <- file(wsFile, "r")
        xml <- readLines(con = con)
        # remove prefix/suffix
        xml <- gsub("prefix=\"&lt;\" suffix=\"&gt;\"", "", xml)
        xml <- gsub("&lt;", "", xml)
        xml <- gsub("&gt;", "", xml)

        # write out modified xml
        modXmlPath <- paste0(wsFile, ".mod")
        writeLines(xml, modXmlPath)

        # change ws_file variable to the modified xml
        wsFile <- modXmlPath
    }

    ## COMMAND-LINE-RUN-TASKS------------------------------------------------------------------------------------------
    # if the ws is being rerun via the command line the rows in cytometry_processing.GatingSetInputFiles
    # and cytometry_processing.gatingSetMetaData need to be removed and repopulated. Also need to remove gating sets.

    if (onCl) {
        # delete inputfiles
        # get inputFiles row keys
        inputKeys <- labkey.selectRows(baseUrl = labkeyUrlBase,
                                       folderPath = labkeyUrlPath,
                                       schemaName = "cytometry_processing",
                                       queryName = "gatingSetInputFiles",
                                       showHidden = TRUE,
                                       colNameOpt = "fieldname")

        # only delete selected wsids
        inputKeysToDelete <- inputKeys[grepl(wsid, inputKeys$wsid), ]

        # delete InputFile rows
        inputKeysDeleted <- labkey.deleteRows(baseUrl = labkeyUrlBase,
                            folderPath = labkeyUrlPath,
                            schemaName = "cytometry_processing",
                            queryName = "gatingSetInputFiles",
                            toDelete = inputKeysToDelete)

        # delete gatingSets from previous run
        unlink(wsdir, recursive = TRUE)

        # get metaData rows to delete
        gsMetaData <- labkey.selectRows(baseUrl = labkeyUrlBase,
                                        folderPath = labkeyUrlPath,
                                        schemaName = "cytometry_processing",
                                        queryName = "gatingSetMetaData",
                                        colNameOpt = "fieldname",
                                        showHidden = TRUE)

        # only delete selected wsid
        metaDataToDelete <- gsMetaData[grepl(wsid, gsMetaData$wsid), ]

        # only remove rows from current wsid
        metaDataDeleted <- labkey.deleteRows(baseUrl = labkeyUrlBase,
                                             folderPath = labkeyUrlPath,
                                             schemaName = "cytometry_processing",
                                             queryName = "gatingSetMetaData",
                                             toDelete = metaDataToDelete)
    }



    ## ACCESS-BASIC-WORKSPACE-INFO-------------------------------------------------------------------------------------
    ws <- openWorkspace(wsFile)

    sampleGroups <- getSampleGroups(ws)
    groups <- unique(sampleGroups[, c("groupID", "groupName")])

    # assign group #
    groups$groupNumber <- seq(1:nrow(groups))

    # remove groups as needed
    if ( all(metaData$rmGroup$rmGroup) ) {
       groups <-  groups[!(groups$groupNumber %in% metaData$rmGroup$group), ]

    }

    ## PARSE-WS-AND-OUTPUT-GS------------------------------------------------------------------------------------------
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

        run <- .runData(gs, groups$groupID, groups$groupName, wsid, ws, sdy, labkeyUrlBase, labkeyUrlPath)
        save_gs(gs,
                gsdir,
                cdf="copy")
        input <- .inputFiles(gs, wsid, gsdir, labkeyUrlBase, labkeyUrlPath)
        } else {
            # remove all samples
            groups <- subset(groups, groups$groupName != "All Samples")

            groupNum <- groups$groupNumber
            groupId <- groups$groupID
            groupName <- groups$groupName

            gsList <- lapply(groupNum, function(num) {
                             .getGS(ws = ws, groupIdNum = num)
            })
            guids <- paste0(sdy, "_", wsid, "_GS", groupId)
            gsList <- mapply(.updateGuid, gsList, guids)

            mapply(.runData, gsList, groupId, groupName,
                   MoreArgs= list(wsid, ws, sdy, labkeyUrlBase, labkeyUrlPath),
                   SIMPLIFY = FALSE)

            if (metaData$gsList) {
                dir.create(wsdir, recursive = TRUE)
                lapply(gsList, function(gs) {
                       gsdir <- paste0(wsdir, "/", gs@guid)
                       save_gs(gs,
                               gsdir,
                               cdf = "copy")
                          })
            } else {
                save_gslist(GatingSetList(gsList),
                            wsdir,
                            cdf="copy")
            }

            lapply(gsList, function(gs) {
                   .inputFiles(gs, wsid, wsdir,  labkeyUrlBase, labkeyUrlPath)
            })

        }

    ## COPY-OVER-SCRIPT-FILES------------------------------------------------------------------------------------------
    # only overwrite if onCl = T
    # otherwise no file should be present
    file.copy(from = "~/LabKeyModules/HIPCCyto/pipeline/tasks/create-gatingset.R",
              to = paste0(analysisDirectory, "/create-gatingset-snapshot.R"),
              overwrite = onCl)
    file.copy(from = "~/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R",
              to = paste0(analysisDirectory, "/runGS-snapshot.R"),
              overwrite = onCl)


}
