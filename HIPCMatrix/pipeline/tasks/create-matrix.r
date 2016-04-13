library(data.table)
library(Rlabkey)
library(tools)

# read the job info
#stop(paste("read: ", "${pipeline, taskInfo}", "| getwd: ", getwd()))
jobInfo <- read.table("${pipeline, taskInfo}",
                      col.names=c("name", "value", "type"),
                      header=FALSE, check.names=FALSE,
                      stringsAsFactors=FALSE, sep="\t", quote="",
                      fill=TRUE, na.strings="")
## Handle ALL inputs (useful for working locally on the code)
labkey.url.base <- jobInfo$value[jobInfo$name == "baseUrl"]
labkey.url.path <- jobInfo$value[jobInfo$name == "containerPath"]
pipeline.root   <- jobInfo$value[jobInfo$name == "pipeRoot"]
inputFiles      <- jobInfo$value[ grep("input\\.", jobInfo$name)]


selectedBiosamples <- selectedGEOs <- NULL
# From LABKEY.Pipeline.startAnalysis in views/CreateMatrix.html
selectedBiosamples <- "${selected-biosamples}"
selectedGEOs <- "${selected-GEOs}"

library(ImmuneSpaceR)


#-------------------------------
# FUNCTIONS
#-------------------------------


# @value A data.table with a feature_id column and one column per biosample_accession
normalizeMatrix <- function(labkey.url.base, labkey.url.path, inputFiles, selectedBiosamples, selectedGEOs){
  con <- CreateConnection()
  inputFiles <- inputFiles[file.exists(inputFiles)]
  GEOs <- unlist(strsplit(selectedGEOs, ","))
  filter <- makeFilter(c("biosample_accession", "IN", gsub(",", ";", selectedBiosamples)))
  gef <- con$getDataset("gene_expression_files", colFilter = filter, original_view = TRUE, reload = TRUE)
  gef <- gef[file_info_name %in% basename(inputFiles) | geo_accession %in% GEOs]
  # TEMPORARY list of studies where GEO should be avoided
  noGEO <- c("SDY224")
  # Decide whether we use GEO or the files
  if(all(GEOs %in% gef$geo_accession) & !con$study %in% noGEO){
    isGEO <- TRUE
  } else if(all(basename(inputFiles) %in% gef$file_info_name)){
    isGEO <- FALSE
  } else{
    stop("Could not decide between GEO and files. Check selected rows to make sure that all selected rows have a file or they all have a GEO accession number.")
  }

  cohort <<- unique(gef$cohort)
  norm_exprs <- con$makeMatrix(gef, isGEO)
  return(norm_exprs)
}

summarizeMatrix <- function(exprs, f2g){ 
  em <- data.table(exprs)
  em[, gene_symbol := f2g[match(em$feature_id, f2g$featureid), genesymbol]]     

  em <- em[!is.na(gene_symbol) & gene_symbol != "NA"]
  em <- em[,lapply(.SD, mean), by="gene_symbol", .SDcols = grep("^BS", colnames(em))]

  return(em)
}

writeMatrix <- function(pipeline.root, exprs, bygene){
  # - EM
  setnames(exprs, "feature_id", " ")
  write.table(exprs, file = file.path(pipeline.root, "analysis/exprs_matrices", "${output.tsv}"), sep = "\t", quote=FALSE, row.names=FALSE)
  # - summary EM
  write.table(bygene, file = file.path(pipeline.root, "analysis/exprs_matrices", paste0("${output.tsv}", ".summary")), sep = "\t", quote=FALSE, row.names=FALSE)
  # - EM used for pipeline (not moved to the right location)
  write.table(exprs, file = "${output.tsv}", sep = "\t", quote=FALSE, row.names=FALSE)
}

cohort <- NULL
#-------------------------------
# PIPELINE
#-------------------------------
co <- labkey.setCurlOptions(ssl.verifyhost = 2, sslversion=1)
FAS_filter <- makeFilter(c("FeatureAnnotationSetId/RowId", "IN", "${assay run property, featureSet}")) 
f2g <- data.table(labkey.selectRows(baseUrl = labkey.url.base,
                                    folderPath= "/Studies/",
                                    schemaName="Microarray",
                                    queryName="FeatureAnnotation",
                                    colFilter=FAS_filter,
                                    colNameOpt="rname", colSelect = c("featureid", "genesymbol")))
if(nrow(f2g) == 0){
  stop("The downloaded feature annotation set has 0 rows.")
}
exprs <- normalizeMatrix(labkey.url.base, labkey.url.path, inputFiles, selectedBiosamples, selectedGEOs)
bygene <- summarizeMatrix(exprs, f2g)


writeMatrix(pipeline.root, exprs, bygene)

outProps = file(description="${pipeline, taskOutputParams}", open="w")
cat(file=outProps, sep="", "name\tvalue\n")
cat(file=outProps, sep="", "assay run property, cohort\t", cohort, "\n")
flush(con=outProps)
close(con=outProps)
