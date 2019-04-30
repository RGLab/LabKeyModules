# Main CL script
source("/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/makeAllGSVarsDf.R")
source("/share/github/LabKeyModules/HIPCCyto/pipeline/tasks/runCreateGS.R") # dependencies sourced here

runGSFromCL <- function(studies = NULL, onTest = TRUE){

  con <- CreateConnection("", onTest = onTest)

  gs_list <- labkey.selectRows(baseUrl = con$config$labkey.url.base,
                               folderPath = "/Studies",
                               schemaName = "assay.General.gatingset",
                               queryName = "Data",
                               containerFilter = "CurrentAndSubfolders",
                               colNameOpt = "rname")
  
  if (!is.null(studies)) {
    gs_list <- gs_list[ gs_list$study %in% studies, ]
  }

  message("Generating matrix of argument values for runCreateGS() for all current workspaces\n")
  allLs <- mapply(makeVarList,
                  sdy = unique(gs_list$study), 
                  wsID = unique(gs_list$wsid),
                  MoreArgs = list(con = con))
  df <- data.frame(t(allLs), stringsAsFactors = FALSE)

  message("\nRunning all workspaces through runCreateGS()")
  res <- mapply(runCreateGS,
              labkey.url.base = df$labkey.url.base,
              labkey.url.path = df$labkey.url.path,
              pipeline.root = df$pipeline.root,
              analysis.directory = df$analysis.directory,
              output.tsv = df$output.tsv,
              MoreArgs = list(onCL = TRUE)
              )
  message("\nWork completed")
}
