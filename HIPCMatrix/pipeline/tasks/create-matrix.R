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
library(Biobase)
library(tools)


#-------------------------------
# FUNCTIONS
#-------------------------------


#' makeMatrix
#'
#' Create a standard expression matrix from a given set of files or GEO
#' accession numbers.
#'
#' @param con An \code{ImmuneSpaceConnection}. The connection to the study that
#'  is processed.
#' @param gef A \code{data.table}. The gene_expression_files dataset, filtered
#'  for the selected cohort and relvant files or accession numbers.
#' @param isGEO A \code{logical}. Set to TRUE if the Matrix should be generated
#'  from GEO accession numbers instead of data on disk.
#'
#' @name makeMatrix
#' @importFrom tools file_ext
#' @importFrom GEOquery getGEO
#' @export
#'
makeMatrix <- function(con, gef, isGEO = FALSE){
  cohort <- unique(gef$arm_name)
  if(length(cohort) > 1){
    message("There are more than one cohort selected in this HIPCMatrix run")
  }
  if(isGEO){
    library(GEOquery)
    norm_exprs <- .process_GEO(gef)
  }else{
    inputFiles <- unique(gef$file_info_name)
    ext <- unique(file_ext(inputFiles))
    inputFiles <- file.path("/share/files/", con$config$labkey.url.path, "@files/rawdata/gene_expression", inputFiles)
    # Filetypes
    # After this step norm_exprs is a matrix with features as rownames and expsample as colnames
    if(length(ext) > 1){
      stop(paste("There is more than one file extension:", paste(ext, collapse = ",")))
    } else if(ext == "CEL"){
      library(affy)
      norm_exprs <- .process_CEL(con, gef, inputFiles)
    } else if(ext == "txt" | con$study %in% c("SDY162", "SDY180", "SDY212")){
      norm_exprs <- .process_others(gef, inputFiles)
    } else if(ext == "tsv"){
      library(preprocessCore)
      norm_exprs <- .process_TSV(gef, inputFiles)
    } else{
      stop("File extension not supported.")
    }
    if(!is(norm_exprs, "data.table")){
      norm_exprs <- data.table(norm_exprs, keep.rownames = TRUE)
      setnames(norm_exprs, "rn", "feature_id")
    }
    # This step should eventually be removed as we move from biosample to expsample
  }
  norm_exprs <- .es2bs(con, norm_exprs)
  return(norm_exprs)
}

# Process GEO accession
# Returns a data.table with a feature_id column and one column per expsample_accession
#' @importFrom Biobase exprs sampleNames
.process_GEO <- function(gef){
  gef <- gef[geo_accession != ""] #Make sure we only have rows with GEO.
  gsm <- getGEO(gef[1, geo_accession])
  gse <- gsm@header$series_id[1] #Assumes that the serie is the first one (SuperSeries with higher ID)
  es <- getGEO(gse)[[1]]
  es <- es[, sampleNames(es) %in% gef$geo_accession]
  if(all(gef$geo_accession %in% sampleNames(es))){ #All selected samples are in the series
    #sampleNames are GEO accession
    sampleNames(es) <- gef[match(sampleNames(es), geo_accession), expsample_accession] 
    cnames <- colnames(es)
    rnames <- rownames(es)
    exprs <- preprocessCore::normalize.quantiles(exprs(es))
    colnames(exprs) <- cnames
    rownames(exprs) <- rnames
    if(max(exprs) > 100){
      norm_exprs <- log2(pmax(exprs, 1))
    } else{
      norm_exprs <- pmax(exprs, 1)
    }
    norm_exprs <- data.table(norm_exprs)
    norm_exprs <- norm_exprs[, feature_id := featureNames(es)]
    setcolorder(norm_exprs, c("feature_id", cnames))
  } else{
    stop(paste0("Some of the selected gene_expression_files rows are not part of ",
               gse, ". Add code!"))
  }
  return(norm_exprs)
}

# Process CEL files
# @param gef A \code{data.table} the gene_expression_files table or a subset of
#  it.
# @param inputFiles A \code{character}. The filenames.
# @return A \code{matrix} with biosample_accession as cols and feature_id as rownames
#' @importFrom affy ReadAffy rma
.process_CEL <- function(con, gef, inputFiles){
  affybatch <- ReadAffy(filenames = inputFiles)
  eset <- rma(affybatch)
  norm_exprs <- exprs(eset)
  if (all(file_ext(colnames(norm_exprs)) == "CEL")) {#If filenames used as samplenames
    colnames(norm_exprs) <- gef[match(colnames(norm_exprs), gef$file_info_name), biosample_accession]
  }
  return(norm_exprs)
}

# This will work for files that follow the standards from immport
# Eventually, all tsv files should be rewritten to follow this standard.
# @return A matrix with biosample_accession as cols and feature_id as rownames
#' @importFrom preprocessCore normalize.quantiles
#' @importFrom reshape2 acast
.process_TSV <- function(gef, inputFiles){
  exprs <- fread(inputFiles, header = TRUE)
  if(min(exprs[, lapply(.SD, min), .SDcols = grep("^BS", names(exprs))]) == 0 &
     max(exprs[, lapply(.SD, max), .SDcols = grep("^BS", names(exprs))]) > 100){
    #RNA-Seq data. Assume it is already count base.
  } else{
    exprs <- .clean_colnames(exprs)
    if(!all(c("target_id", "raw_signal") %in% colnames(exprs))){
      stop("The file does not follow HIPC standards.")
    }
    try(setnames(exprs, "experiment_sample_accession", "expsample_accession"))
    try(setnames(exprs, "target_id", "feature_id"))
    if("expsample_accession" %in% colnames(exprs)){
      EorB <- "expsample_accession"
    } else if("biosample_accession" %in% colnames(exprs)){
      EorB <- "biosample_accession"
    } else{
      stop("The input file must contain either biosample_accession or expsample_accession")
    }
    exprs <- acast(exprs, formula = paste("feature_id ~", EorB), value.var = "raw_signal")
    cnames <- colnames(exprs)
    rnames <- rownames(exprs)
    exprs <- preprocessCore::normalize.quantiles(exprs)
    colnames(exprs) <- cnames
    rownames(exprs) <- rnames

    if(max(exprs) > 100){
      norm_exprs <- log2(pmax(exprs, 1))
    } else{
      norm_exprs <- pmax(exprs, 1)
    }
    norm_exprs <- norm_exprs[, c(colnames(norm_exprs) %in% gef[[EorB]])]
  }
  return(norm_exprs)
}

#biosample_accession as colnames
#Works for SDY212 & 162
#' @importFrom preprocessCore normalize.quantiles
.process_others <- function(gef, inputFiles){

  if(length(inputFiles) > 1){
    lf <- lapply(inputFiles, fread)
    names(lf) <- basename(inputFiles)
    exprs <- rbindlist(lf, idcol = TRUE)
    exprs <- .clean_colnames(exprs)
    try(setnames(exprs, "target_id", "probe_id"))
    try(setnames(exprs, "raw_signal", "expression_value"))
    file2sample <- unique(gef[, list(file_info_name, expsample_accession)])
    exprs[, sample := file2sample[match(.id, file_info_name), expsample_accession]]
    exprs <- exprs[, list(sample, probe_id, gene_symbol, expression_value)]

    exprs <- dcast.data.table(exprs, formula = "probe_id ~ sample", value.var="expression_value")
    rnames <- exprs[, probe_id]
    exprs <- exprs[, probe_id := NULL]
  } else{
    exprs <- fread(inputFiles, header = TRUE)
    sigcols <- grep("Signal", colnames(exprs), value = TRUE)
    rnames <- exprs[, PROBE_ID]
    if(length(sigcols) > 0){
      exprs <- exprs[, sigcols, with = FALSE]
      setnames(exprs, gsub(".AVG.*$", "", colnames(exprs)))
    } else if(all(gef$biosample_accession %in% colnames(exprs))){
      exprs <- exprs[, gef$biosample_accession, with = FALSE]
    } else{
      stop("Unknown format: check data and add code if needed.")
    }
  }

  cnames <- colnames(exprs)
  exprs <- as.matrix(exprs)
  exprs <- preprocessCore::normalize.quantiles(exprs)
  colnames(exprs) <- cnames
  rownames(exprs) <- rnames

  if(max(exprs) > 100){
    norm_exprs <- log2(pmax(exprs, 1))
  } else{
    norm_exprs <- pmax(exprs, 1)
  }
  norm_exprs <- norm_exprs[, c(colnames(norm_exprs) %in% gef$expsample_accession)]
  return(norm_exprs)
}

.clean_colnames <- function(table){
  setnames(table, tolower(chartr(" ", "_", names(table))))
}

# Change colnames from expsample_accession to biosample_accession
.es2bs <- function(con, table){
  ess <- grep("^ES", colnames(table), value = TRUE)
  if(length(ess) > 0){
    esFilter <- makeFilter(c("expsample_accession", "IN", paste0(ess, collapse = ";")))
    bs2es <- data.table(labkey.selectRows(con$config$labkey.url.base,
                                          con$config$labkey.url.path,
                                          "immport", "expsample_2_biosample",
                                          colFilter = esFilter,
                                          colNameOpt = "rname"))
    bss <- bs2es[match(ess, bs2es$expsample_accession), biosample_accession]
    setnames(table, ess, bss)
  }
  return(table)
}


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
  norm_exprs <- makeMatrix(con, gef, isGEO)
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
