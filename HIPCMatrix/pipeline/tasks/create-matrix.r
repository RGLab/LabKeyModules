library(data.table)
library(Rlabkey)
library(tools)

# NOTE: Affy will implicitly try to load bioc packages "hthgu133pluspmcdf" and "AnnotationDbi"
# but that won't work in an RServe enviornment if they haven't been installed yet.
# So we try to load the library early so they will fail if not installed.
#library(hthgu133pluspmcdf)
#library(AnnotationDbi)

# read the job info
#stop(paste("read: ", "${pipeline, taskInfo}", "| getwd: ", getwd()))
jobInfo <- read.table("${pipeline, taskInfo}",
                      col.names=c("name", "value", "type"),
                      header=FALSE, check.names=FALSE,
                      stringsAsFactors=FALSE, sep="\t", quote="",
                      fill=TRUE, na.strings="")

selectedLsids <- "${selected-lsids}"
selectedSubjects <- "${selected-subjects}"
selectedBiosamples <- "${selected-biosamples}"

# selected input file paths
# Test for valid input files:
inputFiles <- jobInfo$value[ grep("input\\.", jobInfo$name)]
inputFiles <- inputFiles[file.exists(inputFiles)]
ext <- unique(file_ext(inputFiles))
if(length(ext) > 1){
  stop(paste("There is more than one file extension:", paste(ext, collapse=",")))
} else if(ext == "CEL"){
  library(affy)
  affybatch <- ReadAffy(filenames = inputFiles)
  eset <- rma(affybatch)
  norm_exprs <- exprs(eset)
} else if(ext == "txt"){
  library(lumi)
  raw_exprs <- fread(inputFiles)
  raw_exprs <- raw_exprs[, c("PROBE_ID", "SYMBOL", grep("Signal", colnames(raw_exprs), value=TRUE)), with=FALSE]
  setnames(raw_exprs, colnames(raw_exprs), gsub(".AVG.*$", "", colnames(raw_exprs)))
  setnames(raw_exprs, c("PROBE_ID", "SYMBOL"), c("feature_id", "gene_symbol"))

  norm_exprs <- as.matrix(raw_exprs[,3:ncol(raw_exprs), with=FALSE])
  eset <- new("ExpressionSet", exprs = norm_exprs)
  eset <- lumiN(eset, method="quantile")
  norm_exprs <- log2(exprs(eset))
  norm_exprs <- cbind(raw_exprs[, feature_id], norm_exprs)
  colnames(norm_exprs)[1] <- "feature_id"
} else{
  stop(paste("The file extension", ext, "is not valid"))
}

baseUrl <- jobInfo$value[jobInfo$name == "baseUrl"]
contextPath <- jobInfo$value[jobInfo$name == "contextPath"]
url <- if(is.na(contextPath)) baseUrl else paste0(baseUrl, contextPath)
containerPath <- jobInfo$value[jobInfo$name == "containerPath"]
filter <- makeFilter(c("file_info_name", "IN", paste(basename(inputFiles), collapse=";")))
pdata <- labkey.selectRows(baseUrl=url,
                           folderPath=containerPath,
                           schemaName="study",
                           queryName="gene_expression_files",
                           colSelect=c("file_info_name", "subject_accession", "biosample_accession"),
                           colFilter=filter,
                           colNameOpt="rname")
BScols <- pdata[match(colnames(norm_exprs), pdata$subject_accession), "biosample_accession"]
BScols[1] <- "feature_id"
colnames(norm_exprs) <- BScols

write.table(norm_exprs, file = file.path(jobInfo$value[jobInfo$name == "pipeRoot"], "analysis/exprs_matrices", "${output.tsv}"), sep = "\t", quote=FALSE, row.names=FALSE)
write.table(norm_exprs, file = "${output.tsv}", sep = "\t", quote=FALSE, row.names=FALSE)

#inputFiles <- jobInfo$value[jobInfo$name == "input.CEL"]
#
## get sample information based on the input files
#baseUrl <- jobInfo$value[jobInfo$name == "baseUrl"]
#contextPath <- jobInfo$value[jobInfo$name == "contextPath"]
#url <- if(is.na(contextPath)) baseUrl else paste0(baseUrl, contextPath)
#containerPath <- jobInfo$value[jobInfo$name == "containerPath"]
#filter <- makeFilter(c("file_info_name", "IN", paste(basename(inputFiles), collapse=";")))
#pdata <- labkey.selectRows(baseUrl=url,
#                           folderPath=containerPath,
#                           schemaName="study",
#                           queryName="gene_expression_files",
#                           colSelect=c("file_info_name", "biosample_accession"),
#                           colFilter=filter,
#                           colNameOpt="rname")
#
## Reading
#affybatch <- ReadAffy(filenames = inputFiles)
#
## Normalisation
#eset <- rma(affybatch)
#ematrix <- exprs(eset)
#
## Rename columns
#colnames(ematrix) <- pdata[match(colnames(ematrix), pdata$file_info_name), "biosample_accession"]
#ematrix <- cbind(rownames(ematrix), ematrix)
#
## BUGBUG: Figure out how to write a column header for the ID_REF column
#write.table(ematrix, file = "${output.tsv}", sep = "\t", quote=FALSE, row.names=FALSE)
