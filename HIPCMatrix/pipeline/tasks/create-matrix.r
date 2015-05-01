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

# Change colnames to biosample_accession
# @param exprs A matrix
# @param pdata A data.table with biosample information
process_TSV_colnames <- function(exprs, pdata){
  # Get biosample_accession as column names
  if(length(grep("^SUB", colnames(exprs))) == ncol(exprs)){
    # One biosample per subject
    colnames(exprs) <- pdata[match(colnames(exprs), pdata$subject_accession), "biosample_accession"]
  } else if(length(grep("^BS", colnames(exprs))) == ncol(exprs)){
    # Produced by Renan: simply subset the expression matrix (will eventually use EXPSAMPLE)
    exprs <- exprs[, colnames(exprs) %in% pdata$biosample_accession]
  } else{
    # Assume it's Illumina samplenames
    biosamples_filter <- paste(unique(pdata$biosample_accession), collapse=";")
    
    dt_exp_2_bio <- data.table(labkey.selectRows(baseUrl = url, folderPath = containerPath,  schemaName = "immport", queryName = "biosample_2_expsample", colFilter = makeFilter(c("biosample_accession", "IN", biosamples_filter)), colNameOpt = "rname"))
    expsamples_acc_filter <- paste(dt_exp_2_bio$expsample_accession, collapse=";")
    
    dt_expsamples <- data.table(labkey.selectRows(baseUrl = url, folderPath = containerPath, schemaName = "immport", queryName = "expsample", colFilter = makeFilter(c("expsample_accession", "IN", expsamples_acc_filter)), colNameOpt = "rname"))    
    
    #add biosample to expsample descr
    dt_expsamples <- dt_expsamples[, biosample_accession:=dt_exp_2_bio[ match(dt_expsamples$expsample_accession, expsample_accession), biosample_accession]]
    #add expsample descr to phenodata
    expsample_descr <- dt_expsamples[match(pdata$biosample_accession, biosample_accession), description]
    cnames <- paste0(gsub(";.*=", "_", gsub(".*ChipID=", "", expsample_descr)))#, ".AVG_Signal")
    
    pdata$expr_col <-cnames
    exprs <- exprs[, pdata$expr_col]
    colnames(exprs) <- pdata[match(colnames(exprs), pdata$expr_col), "biosample_accession"]
    
  } 
  return(exprs)
}

# @value A matrix with feature_id as rownames and biosample_accession as columns
process_TSV <- function(con, pdata, inputFiles, selectedBiosamples){
  if(unique(pdata$file_info_purpose) == "RNA-Seq result"){
    #simply average counts accross genes for transcript mapping the same symbol
    norm_exprs <- fread(inputFiles)
    feature_id <- unlist(norm_exprs[, 1, with = FALSE], use.names = FALSE)
    norm_exprs <- norm_exprs[, grep("^BS", colnames(norm_exprs)), with = FALSE]
    norm_exprs <- as.matrix(norm_exprs)
    rownames(norm_exprs) <- feature_id
    norm_exprs <- process_TSV_colnames(norm_exprs, pdata)
  } else{
    raw_exprs <- fread(inputFiles)
    library(lumi)
    feature_id <- raw_exprs[, PROBE_ID]
    sigcols <- grep("Signal", colnames(raw_exprs), value=TRUE)
    if(length(sigcols) > 0){
      raw_exprs <- raw_exprs[, grep("Signal", colnames(raw_exprs), value=TRUE), with=FALSE]
      } else{
        raw_exprs[, c("PROBE_ID", "SYMBOL") := NULL]
      }
    setnames(raw_exprs, colnames(raw_exprs), gsub(".AVG.*$", "", colnames(raw_exprs)))
    norm_exprs <- as.matrix(raw_exprs)
    eset <- new("ExpressionSet", exprs = norm_exprs)
    eset <- lumiN(eset, method="quantile")
    norm_exprs <- log2(exprs(eset))
    rownames(norm_exprs) <- feature_id
    norm_exprs <- process_TSV_colnames(norm_exprs, pdata)
  }
}

process_CSV <- function(con, pdata, inputFiles, selectedBiosamples){
  library(lumi)
  raw_exprs <- fread(inputFiles)
  setnames(raw_exprs, tolower(gsub(" ", "_", colnames(raw_exprs))))
  raw_exprs <- raw_exprs[, c(grep("experiment_sample", colnames(raw_exprs), value = TRUE), "target_id", "raw_signal"), with = FALSE]
  setnames(raw_exprs, c("sample", "feature_id", "signal"))
  feature_id <- raw_exprs$feature_id
  norm_exprs <- acast(raw_exprs, formula("feature_id ~ sample"), value.var="signal")
  eset <- new("ExpressionSet", exprs = norm_exprs)
  eset <- lumiN(eset, method="quantile")
  norm_exprs <- log2(exprs(eset))
  #rownames(norm_exprs) <- feature_id

}

process_CEL <- function(con, pdata, inputFiles){
  library(affy)
  affybatch <- ReadAffy(filenames = inputFiles)
  eset <- rma(affybatch)
  norm_exprs <- exprs(eset)

  if(all(file_ext(colnames(norm_exprs)) == "CEL")){ #If filenames used as samplenames
    colnames(norm_exprs) <- pdata[ match(colnames(norm_exprs), pdata$file_info_name), biosample_accession]
  }
  return(norm_exprs)
}

# @value A data.table with a feature_id column and one column per biosample_accession
normalizeMatrix <- function(jobInfo, selectedBiosamples){
  labkey.url.base <- jobInfo$value[jobInfo$name == "baseUrl"]
  labkey.url.path <- jobInfo$value[jobInfo$name == "containerPath"]
  con <- CreateConnection()
  inputFiles <- jobInfo$value[ grep("input\\.", jobInfo$name)]
  inputFiles <- inputFiles[file.exists(inputFiles)]
  ext <- unique(file_ext(inputFiles))
  filter <- makeFilter(c("file_info_name", "IN", paste(basename(inputFiles), collapse=";")),
                       c("biosample_accession", "IN", gsub(",", ";", selectedBiosamples)))
  gef <- pdata <- con$getDataset("gene_expression_files", colFilter = filter, original_view = TRUE, reload = TRUE)
  cohort <<- unique(pdata$arm_name)
  #norm_exprs <- try(con$makeMatrix(gef))
  norm_exprs <- con$makeMatrix(gef)
  #if(inherits(norm_exprs, "try-error")){
  #  if(length(ext) > 1){
  #    stop(paste("There is more than one file extension:", paste(ext, collapse=",")))
  #  } else if(ext == "CEL"){
  #    norm_exprs <- process_CEL(con, pdata, inputFiles)
  #  } else if(ext %in% c("tsv", "txt")){
  #    norm_exprs <- process_TSV(con, pdata, inputFiles, selectedBiosamples)
  #  } else if(ext == "csv"){
  #    norm_exprs <- process_CSV(con)
  #  } else{
  #    stop(paste("The file extension", ext, "is not valid"))
  #  }
  #  if(!is(norm_exprs, "data.table")){
  #    norm_exprs <- data.table(norm_exprs, keep.rownames = TRUE)
  #    setnames(norm_exprs, "rn", "feature_id")
  #  }
  #}
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
