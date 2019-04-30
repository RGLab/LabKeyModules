# Creates DF of all info needed to run CL version of runCreateMx()

# Helper
makeVarList <- function(sdy, wsID){
  print(paste(sdy, wsID))
  baseDir <- paste0("/share/files/Studies/",
                    sdy,
                    "/@files/rawdata/flow_cytometry/create-gatingset/",
                    wsID,
                    "/")
  fls <- list.files(baseDir)

  if(length(fls) != 0 ){
      taskInfo_path <- file.path(baseDir, fls[grep("-taskInfo.tsv", fls)])
  }
  
  jobInfo <- read.table(taskInfo_path,
                        header = FALSE,
                        sep = "\t",
                        stringsAsFactors = FALSE,
                        col.names = c("name", "value"))

  labkey.url.base     <- jobInfo$value[ jobInfo$name == "baseUrl" ]
  labkey.url.path     <- jobInfo$value[ jobInfo$name == "containerPath" ]
  pipeline.root       <- jobInfo$value[ jobInfo$name == "pipeRoot" ]
  analysis.directory  <- jobInfo$value[ jobInfo$name == "analysisDirectory" ]
  output.tsv          <- jobInfo$value[ jobInfo$name == "output.tsv" ]


  res <- list(labkey.url.base = labkey.url.base,
              labkey.url.path = labkey.url.path,
              pipeline.root = pipeline.root,
              analysis.directory = analysis.directory,
              output.tsv = output.tsv)

  return(res)
}

