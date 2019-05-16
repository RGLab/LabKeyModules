# Main CL script
source("/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/makeAllWsVarsDf.R")
source("/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R") # dependencies sourced here

runGSFromCL <- function(studies = NULL, onTest = TRUE) {
    
    con <- CreateConnection("", onTest = onTest)
    gsList <- labkey.selectRows(baseUrl = con$config$labkey.url.base,
                                folderPath = "/Studies/",
                                schemaName = "cytometry_processing",
                                queryName = "gatingSetMetaData",
                                containerFilter = "CurrentAndSubfolders",
                                colNameOpt = "fieldname")
  
    if (!is.null(studies)) {
        gsList <- gsList[ gsList$study %in% studies, ]
    }

    message("Generating matrix of argument values for runCreateGS() for all current workspaces\n")
    allVars <- mapply(makeVarList,
                      sdy = unique(gsList$study), 
                      wsID = unique(gsList$wsid))
                     # MoreArgs = list(con = con))
  
    df <- data.frame(t(allVars), stringsAsFactors = FALSE)

    message("\nRunning all workspaces through runCreateGS()")
    res <- mapply(runCreateGS,
                  labkey.url.base = df$labkey.url.base,
                  labkey.url.path = df$labkey.url.path,
                  pipeline.root = df$pipeline.root,
                  data.directory = df$data.directory,
                  analysis.directory = df$analysis.directory,
                  protocol = df$protocol,
                  MoreArgs = list(onCL = TRUE)
                  )
    message("\nWork completed")
}
