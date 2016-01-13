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


selectedBiosamples <- "${selected-biosamples}"

library(ImmuneSpaceR)


#-------------------------------
# FUNCTIONS
#-------------------------------


# @value A data.table with a feature_id column and one column per biosample_accession
normalizeMatrix <- function(jobInfo, selectedBiosamples){
  labkey.url.base <- jobInfo$value[jobInfo$name == "baseUrl"]
  labkey.url.path <- jobInfo$value[jobInfo$name == "containerPath"]
  con <- CreateConnection()
  inputFiles <- jobInfo$value[ grep("input\\.", jobInfo$name)]

  inputFiles <- inputFiles[file.exists(inputFiles)]
  filter <- makeFilter(c("file_info_name", "IN", paste(basename(inputFiles), collapse=";")),
                       c("biosample_accession", "IN", gsub(",", ";", selectedBiosamples)))
  gef <- con$getDataset("gene_expression_files", colFilter = filter, original_view = TRUE, reload = TRUE)

  gef <- gef[file_info_name %in% basename(inputFiles) | file_info_purpose == 'GEO link']
  cohort <<- unique(gef$cohort)
  norm_exprs <- con$makeMatrix(gef)
  return(norm_exprs)
}

summarizeMatrix <- function(exprs, f2g){ 
  em <- data.table(exprs)
  em[, gene_symbol := f2g[match(em$feature_id, f2g$featureid), genesymbol]]     

  em <- em[!is.na(gene_symbol) & gene_symbol != "NA"]
  em <- em[,lapply(.SD, mean), by="gene_symbol", .SDcols = grep("^BS", colnames(em))]

  return(em)
}

writeMatrix <- function(exprs, bygene){
  # - EM
  setnames(exprs, "feature_id", " ")
  write.table(exprs, file = file.path(jobInfo$value[jobInfo$name == "pipeRoot"], "analysis/exprs_matrices", "${output.tsv}"), sep = "\t", quote=FALSE, row.names=FALSE)
  # - summary EM
  write.table(bygene, file = file.path(jobInfo$value[jobInfo$name == "pipeRoot"], "analysis/exprs_matrices", paste0("${output.tsv}", ".summary")), sep = "\t", quote=FALSE, row.names=FALSE)
  # - EM used for pipeline (not moved to the right location)
  write.table(exprs, file = "${output.tsv}", sep = "\t", quote=FALSE, row.names=FALSE)
}



cohort <- NULL
#-------------------------------
# PIPELINE
#-------------------------------
co <- labkey.setCurlOptions(ssl.verifyhost = 2, sslversion=1)
labkey.url.base <- jobInfo$value[jobInfo$name == "baseUrl"]
labkey.url.path <- jobInfo$value[jobInfo$name == "containerPath"]
FAS_filter <- makeFilter(c("FeatureAnnotationSetId", "IN", "${assay run property, featureSet}")) 
f2g <- data.table(labkey.selectRows(baseUrl = labkey.url.base,
                                    folderPath= labkey.url.path,
                                    schemaName="Microarray",
                                    queryName="FeatureAnnotation",
                                    colFilter=FAS_filter,
                                    colNameOpt="rname", colSelect = c("featureid", "genesymbol")))
exprs <- normalizeMatrix(jobInfo, selectedBiosamples)
bygene <- summarizeMatrix(exprs, f2g)

#exprs <- as.data.frame(exprs)
#exprs <- cbind(feature_id, exprs)
#colnames(exprs)[1] <- " "

writeMatrix(exprs, bygene)

outProps = file(description="${pipeline, taskOutputParams}", open="w")
cat(file=outProps, sep="", "name\tvalue\n")
cat(file=outProps, sep="", "assay run property, cohort\t", cohort, "\n")
flush(con=outProps)
close(con=outProps)
#cohort_out <- paste0("assay run property, cohort\t", cohort, "\n")
#write(cohort_out, file="${pipeline,taskOutputParams}")
