# Creates DF of all info needed to run CL version of runCreateMx()

# Helper
makeVarList <- function(sdy, ws, con){
  print(paste(sdy, mx))
  baseDir <- paste0("/share/files/Studies/",
                    sdy,
                    "/@files/rawdata/flow_cytometry/create-gatingset/",
                    ws,
                    "/")
  fls <- list.files(baseDir)

  if(length(fls) != 0 ){
    taskInfo <- paste0(baseDir, fls[grep("-taskInfo.tsv", fls)])
    base <- gsub("-taskInfo.tsv", "", taskInfo)
    taskOutputParams <- paste0(base, ".params-out.tsv")
  }else{
    taskOutputParams <- "notAvailable"
  }

  labkey.url.path     <- paste0("/Studies/", sdy)
  analysis.directory  <- paste0(pipeline.root, "/rawdata/gene_expression/create-matrix/", mx)
  output.tsv          <- paste0(mx, ".tsv")


  res <- list(labkey.url.base = labkey.url.base,
              analysis.directory = analysis.directory,
              taskOutputParams = taskOutputParams,
              output.tsv = output.tsv)

  return(res)
}

