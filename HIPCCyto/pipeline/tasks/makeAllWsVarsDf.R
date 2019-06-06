# Creates DF of all info needed to run CL version of runCreateMx()

# Helper
makeVarList <- function(sdy, wsid){
  print(paste(sdy, wsid))
  baseDir <- paste0("/share/files/Studies/",
                    sdy,
                    "/@files/rawdata/flow_cytometry/create-gatingset/",
                    wsid,
                    "/")
  files <- list.files(baseDir, full.names = TRUE)

  if(length(files) != 0 ) { 
      taskInfoPath <- files[grepl("taskInfo.tsv", files)]
  }
  
  jobInfo <- read.table(taskInfoPath,
                        header = FALSE,
                        sep = "\t",
                        stringsAsFactors = FALSE,
                        col.names = c("name", "value"))

  labkeyUrlBase     <- jobInfo$value[ jobInfo$name == "baseUrl" ]
  labkeyUrlPath     <- jobInfo$value[ jobInfo$name == "containerPath" ]
  pipelineRoot      <- jobInfo$value[ jobInfo$name == "pipeRoot" ]
  analysisDirectory <- jobInfo$value[ jobInfo$name == "analysisDirectory" ]
  dataDirectory     <- jobInfo$value[ jobInfo$name == "dataDirectory" ]
  protocol          <- jobInfo$value[ jobInfo$name == "protocol" ]


  res <- list(labkeyUrlBase = labkeyUrlBase,
              labkeyUrlPath = labkeyUrlPath,
              pipelineRoot = pipelineRoot,
              dataDirectory = dataDirectory,
              analysisDirectory = analysisDirectory,
              protocol = protocol)

  return(res)
}

