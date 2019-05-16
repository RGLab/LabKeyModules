# Creates DF of all info needed to run CL version of runCreateMx()

# Helper
makeVarList <- function(sdy, wsID){
  print(paste(sdy, wsID))
  baseDir <- paste0("/share/files/Studies/",
                    sdy,
                    "/@files/rawdata/flow_cytometry/create-gatingset/",
                    wsID,
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

  labkey.url.base     <- jobInfo$value[ jobInfo$name == "baseUrl" ]
  labkey.url.path     <- jobInfo$value[ jobInfo$name == "containerPath" ]
  pipeline.root       <- jobInfo$value[ jobInfo$name == "pipeRoot" ]
  analysis.directory  <- jobInfo$value[ jobInfo$name == "analysisDirectory" ]
  data.directory      <- jobInfo$value[ jobInfo$name == "dataDirectory" ]
  protocol            <- jobInfo$value[ jobInfo$name == "protocol" ]


  res <- list(labkey.url.base = labkey.url.base,
              labkey.url.path = labkey.url.path,
              pipeline.root = pipeline.root,
              data.directory = data.directory,
              analysis.directory = analysis.directory,
              protocol = protocol)

  return(res)
}

