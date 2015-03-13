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


selectedLsids <- "${selected-lsids}"
selectedSubjects <- "${selected-subjects}"
selectedBiosamples <- "${selected-biosamples}"

#} else{
#  # Create the file
#  FAS_file <- "./analysis/FAS/HGU133_new.tsv"
#  # Link the FAS to the current run
#  outputParams <- data.frame(name=c("assay run property, featureSet"), value=c("./analysis/FAS/HGU133_new.tsv"))
#  write.table(outputParams, file = "${pipeline, taskOutputParams}", sep = "\t", quote=FALSE, col.names=TRUE, row.names=FALSE)
#  f2g <- fread(FAS_file)
#}
###### Normalization
###if(length(ext) > 1){
###  stop(paste("There is more than one file extension:", paste(ext, collapse=",")))
###} else if(ext == "CEL"){
###} else if(ext %in% c("tsv", "txt")){
###} else if(ext == "csv"){ #Assume RNA-Seq
###  #simply average counts accross genes for transcript mapping the same symbol
###  norm_exprs <- read.csv(inputFiles)
###  feature_id <- norm_exprs[, 1]
###  rownames(norm_exprs) <- feature_id
###  norm_exprs <- norm_exprs[, grep("^BS", colnames(norm_exprs))]
###} else{
###  stop(paste("The file extension", ext, "is not valid"))
###}
###
###
# Summarize by gene
  em <- data.table(norm_exprs)
  em[, featureid := rownames(norm_exprs)]
  em[, gene_symbol := f2g[match(em$featureid, f2g$featureid), genesymbol]]
  
  ssem <- strsplit(em$gene_symbol, " /// ")
  nreps <- sapply(ssem, length)
  em <- em[rep(1:nrow(em), nreps)]
  em <- em[, gene_symbol := unlist(ssem)]
  em <- em[!is.na(gene_symbol) & gene_symbol != "NA"]
  em <- em[, lapply(.SD, mean), by = "gene_symbol", .SDcols = 1:(ncol(em)-2)]
#####
#####
#temp
norm_exprs <- as.data.frame(norm_exprs)
norm_exprs <- cbind(feature_id, norm_exprs)
colnames(norm_exprs)[1] <- " "
# Write outputs
# - EM to be used
write.table(norm_exprs, file = file.path(jobInfo$value[jobInfo$name == "pipeRoot"], "analysis/exprs_matrices", "${output.tsv}"), sep = "\t", quote=FALSE, row.names=FALSE)
# - summary EM
write.table(em, file = file.path(jobInfo$value[jobInfo$name == "pipeRoot"], "analysis/exprs_matrices", paste0("${output.tsv}", ".summary")), sep = "\t", quote=FALSE, row.names=FALSE)
# - EM used for pipeline (not moved to the right location)
write.table(norm_exprs, file = "${output.tsv}", sep = "\t", quote=FALSE, row.names=FALSE)

