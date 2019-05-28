# Main CL script
source("/share/github/LabKeyModules/HIPCMatrix/pipeline/tasks/makeAllMxVarsDf.R")
source("/share/github/LabKeyModules/HIPCMatrix/pipeline/tasks/runCreateMx.R") # dependencies sourced here

runMxFromCL <- function(studies = NULL, onTest = TRUE){

  con <- CreateConnection("", onTest = onTest)
  mats <- con$cache$GE_matrices

  if (!is.null(studies)) {
    mats <- mats[ mats$folder %in% studies, ]
  }

  message("Generating matrix of argument values for runCreateMx() for all current matrices\n")
  allLs <- mapply(makeVarList,
                  sdy = mats$folder,
                  mx = mats$name,
                  MoreArgs = list(con = con))
  df <- data.frame(t(allLs), stringsAsFactors = FALSE)

  message("\nRunning all matrices through runCreateMx()")
  res <- mapply(runCreateMx,
              labkey.url.base = df$labkey.url.base,
              labkey.url.path = df$labkey.url.path,
              pipeline.root = df$pipeline.root,
              analysis.directory = df$analysis.directory,
              selectedBiosamples = df$selectedBiosamples,
              fasId = df$fasId,
              taskOutputParams = df$taskOutputParams,
              output.tsv = df$output.tsv,
              MoreArgs = list(onCL = TRUE)
              )
  message("\nWork completed")
}
