# Creates DF of all info needed to run CL version of runCreateMx()

# Helper
makeVarList <- function(sdy, mx, con){
  print(paste(sdy, mx))
  baseDir <- paste0("/share/files/Studies/",
                    sdy,
                    "/@files/rawdata/gene_expression/create-matrix/",
                    mx,
                    "/")
  fls <- list.files(baseDir)

  if(length(fls) != 0 ){
    taskInfo <- paste0(baseDir, fls[grep("-taskInfo.tsv", fls)])
    base <- gsub("-taskInfo.tsv", "", taskInfo)
    taskOutputParams <- paste0(base, ".params-out.tsv")
  }else{
    taskOutputParams <- "notAvailable"
  }

  labkey.url.base     <- con$config$labkey.url.base
  labkey.url.path     <- paste0("/Studies/", sdy)
  pipeline.root       <- paste0("/share/files", labkey.url.path, "/@files")
  analysis.directory  <- paste0(pipeline.root, "/rawdata/gene_expression/create-matrix/", mx)
  output.tsv          <- paste0(mx, ".tsv")

  EM <- con$getGEMatrix(mx, outputType = "normalized")
  selectedBiosamples <- colnames(Biobase::exprs(EM))
  fasId <- con$cache$GE_matrices$featureset[ con$cache$GE_matrices$name == mx ]

  res <- list(labkey.url.base = labkey.url.base,
              labkey.url.path = labkey.url.path,
              pipeline.root = pipeline.root,
              analysis.directory = analysis.directory,
              selectedBiosamples = paste(selectedBiosamples, collapse = ","),
              fasId = fasId,
              taskOutputParams = taskOutputParams,
              output.tsv = output.tsv)

  return(res)
}

