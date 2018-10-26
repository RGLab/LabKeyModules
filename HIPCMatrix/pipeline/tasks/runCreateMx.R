#-------------------------------
# DEPENDENCIES
#-------------------------------
library(data.table)
library(Rlabkey)
library(tools)
library(ImmuneSpaceR)
library(Biobase)
library(GEOquery)

#-------------------------------
# GEO HELPER FN
#-------------------------------
.getGeoRawFls <- function(study, gef, metaData){
  # Important that run specific directory is created to avoid overlap with previous runs.
  # This done with unique cell_type * arm_accession string (aka cohort_type)
  baseDir <- paste0("/share/files/Studies/",
                    study,
                    "/@files/rawdata/gene_expression/supp_files/",
                    paste0(unique(gef$type),
                           "_",
                           unique(gef$arm_accession)))
  dir.create(baseDir, recursive = TRUE)
  
  if (metaData$dataInGsm == TRUE) {
    tmp <- lapply(gef$geo_accession, function(x){
      obj <- getGEO(x)
      tbl <- obj@dataTable@table
      tbl <- tbl[ , colnames(tbl) %in% c("ID_REF", metaData$gsmTblVarNm[[study]]) ]
      colnames(tbl) <- c("feature_id", x)
      return(tbl)
    })
    exprs <- Reduce(f = function(x, y) {merge(x, y)}, tmp)
    colnames(exprs) <- gef$biosample_accession[ match(colnames(exprs), gef$geo_accession) ]
    colnames(exprs)[[1]] <- "feature_id"
    inputFiles <- file.path(baseDir, paste0(study, "_raw_expression.txt"))
    dmp <- write.table(exprs, file = inputFiles, sep = "\t", quote = FALSE, row.names = FALSE)
  } else {
    if (metaData$useGsmSuppFls == TRUE) {
      accList <- gef$geo_accession
    } else {
      accList <- unique(unlist(lapply(gef$geo_accession, function(x){
        gsm <- getGEO(x)
        gse <- gsm@header$series_id
      })))
    }
    tmp <- sapply(accList, getGEOSuppFiles, makeDirectory = FALSE, baseDir = baseDir)
    fls <- list.files(baseDir)
    targetFlTerms <- "non-normalized|corrected|raw|cel|pbmc|counts"
    rawFls <- fls[ grep(targetFlTerms, fls, ignore.case = TRUE) ]
    
    # Unzip any files if necessary - set `overwrite = TRUE` in case failure during processing.
    flPaths <- rawFls[ grep("gz", rawFls) ]
    if (length(flPaths) > 0) {
      tmp <- sapply(file.path(baseDir, flPaths), 
                    GEOquery::gunzip, overwrite = TRUE, remove = TRUE)
    }
    
    # find correct unzipped files with full paths
    fls <- file.path(baseDir, list.files(baseDir))
    fls <- fls[ grep(targetFlTerms, fls, ignore.case = TRUE)]
    inputFiles <- fls[ grep("gz|tar|RData", fls, invert = TRUE) ]
  }
  return(inputFiles)
}

.fixHeaders <- function(lf, study){
  if (study == "SDY224") {
    lf <- lapply(lf, function(x){
      setnames(x, as.character(x[1,]))
      x <- x[-(1:2),]
      colnames(x)[[1]] <- "ID_REF"
      return(x)
    })
  }else if (study == "SDY789") {
    lf <- lapply(lf, function(x){
      gsms <- x[3,]
      gsms[ gsms == "" ] <- NA
      gsms[[1]] <- "ID_REF"
      tmp <- x[5:nrow(x),]
      colnames(tmp) <- as.character(gsms)
      return(tmp)
    })
  }else if (study == "SDY400") {
    # First line in exprs says "GSM1445822-GSM1445949", however there
    # are only 120 samples not 126 as indicated.  In order to account for
    # missing ones, must use full gef which has the missing GSM removed.
    lf <- lapply(lf, function(x){
      nms <- grep("SAMPLE", as.character(x[2,]))
      bad <- grep("SAMPLE", as.character(x[2,]), invert = TRUE)
      badVals <- grep("SAMPLE", as.character(x[2,]), invert = TRUE, value = TRUE)
      x <- x[3:nrow(x),]
      tmp <- CreateConnection(study, onTest = grepl("test", labkey.url.base))
      tGef <- tmp$getDataset("gene_expression_files")
      acc <- tGef[ tGef$type == "PBMC", geo_accession ]
      setnames(x, nms, acc)
      setnames(x, bad, badVals)
      return(x)
    })   
  } else if(study == "SDY1325") {
    lf <- lapply(lf, function(x){
      setnames(x, as.character(x[5,]))
      x <- x[ -(1:5),]
    })
  }
  return(lf)
}

# Most of these changes are for GEO-derived raw supplementary files.
.subsetToRaw <- function(lf){
  lf <- lapply(lf, function(x){
    x <- x[ , grep("Pval|MIN|MAX|ARRAY", colnames(x), invert = TRUE), with = FALSE ]
    if (any(grep("signal", colnames(x)))) {
      sigCols <- grep("signal|feature_id", colnames(exprs), ignore.case = TRUE)
      normCols <- grep("norm", colnames(exprs), ignore.case = TRUE)
      sigCols <- setdiff(sigCols, normCols)
      exprs <- exprs[ , sigCols, with = FALSE ]
      setnames(exprs, gsub("_(RAW|AVG).*$", "", colnames(exprs)))
    }
    return(x)
  })
}

# Standardize probe column name
.mapFeatureIdCol <- function(exprs){
  if (!any(grepl("feature_id", colnames(exprs)))) {
    
    # For Illumina, a number of possibilities exist
    prbCol <- grep("^(probe_id|v1|target_id|id_ref)$", 
                   colnames(exprs), 
                   ignore.case = TRUE)
    
    # If RNAseq then accept gene* col
    if (length(prbCol) == 0 ) {
      prbCol <- grep("gene", colnames(exprs), ignore.case = TRUE)
    }
    
    # In case of features in rownames
    if (length(prbCol) == 0 ) {
      prbCol <- "rn"
    }
    
    setnames(exprs, prbCol, "feature_id")
  }
  return(exprs)
}

# Create map of GSM accessions to study-given IDs from GEO
.makeIdToGsmMap <- function(gef, metaData, study){
  mp <- lapply(gef$geo_accession, function(x){
    tmp <- getGEO(x)
    nm <- tmp@header[[metaData$studyIdTerm]][[1]]
    if (study %in% names(metaData$smplGsubTerms)) {
      nm <- gsub(metaData$smplGsubTerms[[study]]$old,
                 metaData$smplGsubTerms[[study]]$new,
                 nm)
    }
    return(c(x, nm))
  })
  mp <- data.frame(do.call(rbind, mp), stringsAsFactors = FALSE)
  colnames(mp) <- c("gsm","id")
  rownames(mp) <- NULL
  return(mp)
}

# Map study-given ids or names from inputFiles to a GEF-accession
.mapNmsToAcc <- function(exprs, metaData, gef, study){
  if (metaData$isGeo == TRUE) {
    mp <- .makeIdToGsmMap(gef, metaData, study)
    exprs <- exprs[ , colnames(exprs) %in% c("feature_id", mp$id), with = FALSE ]
    nms <- grep("feature_id", colnames(exprs), invert = TRUE, value = TRUE)
    gsm <- mp$gsm[ match(nms, mp$id) ]
    setnames(exprs, nms, gsm)
  }
  return(exprs)
}

# Map experiment-sample or geo accessions to biosample accessions
.mapAccToBs <- function(exprs, gef){
  if (any(grepl("^(ES|GSM)\\d{6,7}$", colnames(exprs)))) {
    colToUse <- ifelse( any(grepl("ES", colnames(exprs))), 
                        "expsample_accession", 
                        "geo_accession")
  } else {
    colToUse <- "file_info_name"
  }
  nms <- grep("feature_id", colnames(exprs), value = TRUE, invert = TRUE)
  rep <- gef$biosample_accession[ match(nms, gef[[colToUse]]) ]
  setnames(exprs, nms, rep)
  return(exprs)
}

# If annotation library is not already on rsT, will need to manually install
# via biocLite() due to permissions.
.processAffy <- function(inputFiles, gef, metaData){
  # Libraries loaded here in order to get picked up by Scripts/getRpkgs.sh.
  # Only one is used at a time by the `affy::justRMA()` call.
  library(hugene10stv1cdf)
  library(primeviewcdf)
  library(hgu133plus2cdf)
  library(hthgu133pluspmcdf) 
  
  tmp <- getwd()
  setwd("/") # b/c filepaths are absolute and justRMA prepends wd
  eset <- affy::justRMA(filenames = inputFiles, normalize = FALSE)
  setwd(tmp)
  exprs <- data.table(exprs(eset), keep.rownames = TRUE)
  setnames(exprs, "rn", "feature_id")
  
  # Names come from inputFiles. In case of isGeo, these are not exact
  # matches but usually have the gsm accession in them.
  if (any(grep("GSM", colnames(exprs)))) {
    nms <- grep("feature_id", colnames(exprs), invert = TRUE, value = TRUE)
    gsms <- regmatches(nms, regexpr("GSM\\d{6,7}", nms))
    setnames(exprs, nms, gsms)
  } 
  
  return(exprs)
}

#-------------------------------
# CREATE MATRIX FN
#-------------------------------

# @value A data.table with a feature_id column and one column per biosample_accession
makeRawMatrix <- function(metaData, gef, study, inputFiles){
  
  # Get raw files from GEO if needed
  if (metaData$isGeo == TRUE) {
    inputFiles <- .getGeoRawFls(study, gef, metaData)
  }
  
  if (metaData$platform == "Affymetrix" ) {
    exprs <- .processAffy(inputFiles, gef, metaData)
  } else {
    # read in files with header = "auto" and do custom fixing
    lf <- lapply(inputFiles, fread)
    names(lf) <- basename(inputFiles)
    
    # Fix headers to have either GSM, ES, or filename ids
    lf <- .fixHeaders(lf, study)
    
    # Remove columns that are not raw data, usually p-values
    lf <- .subsetToRaw(lf)
    
    # Create single matrix for all samples in inputFiles
    exprs <- data.table(Reduce(f = function(x, y) {merge(x, y, all = TRUE)}, lf))
    
    # Ensure probe col is named 'feature_id'
    exprs <- .mapFeatureIdCol(exprs)
    
    # Ensure all probes have names. Not a problem for most studies.
    # Note that values can still be NA here and may be due to a handful
    # of samples having problems (e.g. SDY224 / SDY212).  These NA values
    # are removed during normalization.
    exprs <- exprs[ !is.na(feature_id) & feature_id != "" ]
    
    # Map study-given ids to an expsample or geo accession if necessary
    exprs <- .mapNmsToAcc(exprs, metaData, gef, study)
  }
  
  # Map expsample or geo accession to biosample accession
  exprs <- .mapAccToBs(exprs, gef)
  
  # Subset to biosamples in selectedBiosamples from UI
  exprs <- exprs[ , colnames(exprs) %in% c("feature_id", gef$biosample_accession), 
                  with = FALSE ]
  
  # Ensure colOrder
  smpls <- grep("feature_id", names(exprs), invert = TRUE)
  fid <- grep("feature_id", names(exprs))
  setcolorder(exprs, c(fid, smpls))
  
  return(exprs)
}

#' @importFrom preprocessCore normalize.quantiles
#' @import DESeq
normalizeMatrix <- function(exprs, study, metaData){
  # data.table so MUST COPY to prevent changes in later work
  em <- copy(exprs)
  
  # Oct 2018 - following studies have some NA values.
  # SDY212 - Known issue and documented in ImmPort Jira
  # SDY1289 - Due to single cohort having multiple batches with different anno.
  # SDY224 - Controls
  em <- em[ complete.cases(em), ]
  
  # already processed and raw FASTQ data only in SRA, no raw count matrix easily available
  if (metaData$noRaw == TRUE) {
    return(em)
  } 
  
  rnames <- em[ , feature_id ]
  em[ , feature_id := NULL ]
  
  # Must ensure numeric values as conversion back to character can happen with
  # casting as matrix.
  em <- as.matrix(apply(em, 2, as.numeric))
  
  # no platform  == isRNASeq
  if (metaData$platform == "NA") {
    library(DESeq)
    cds <- newCountDataSet(countData = em, conditions = colnames(em))
    cds <- estimateSizeFactors(cds)
    cdsBlind <- estimateDispersions(cds, method = "blind" )
    vsd <- varianceStabilizingTransformation(cdsBlind)
    norm_exprs <- exprs(vsd)
  } else {
    cnames <- colnames(em)
    norm_exprs <- preprocessCore::normalize.quantiles(em)
    colnames(norm_exprs) <- cnames
    norm_exprs <- pmax(norm_exprs, 1)
    if (max(norm_exprs) > 100) {
      norm_exprs <- log2(norm_exprs)
    }
  }
  
  norm_exprs <- data.table(norm_exprs)
  norm_exprs[ , feature_id := rnames ]
  
  smpls <- grep("feature_id", names(norm_exprs), invert = TRUE)
  fid <- grep("feature_id", names(norm_exprs))
  setcolorder(norm_exprs, c(fid, smpls))
  
  return(norm_exprs)
}

summarizeMatrix <- function(norm_exprs, f2g){
  em <- copy(norm_exprs)
  em[ , gene_symbol := f2g[match(em$feature_id, f2g$featureid), genesymbol] ]
  em <- em[ !is.na(gene_symbol) & gene_symbol != "NA" ]
  sum_exprs <- em[ , lapply(.SD, mean), 
                   by = "gene_symbol", 
                   .SDcols = grep("^BS", colnames(em)) ]
}

writeMatrix <- function(pipeline.root, output.tsv, exprs, norm_exprs, sum_exprs, onCL){
  
  .writeTbl <- function(df, onCL, baseNm){
    dir <- ifelse(onCL == TRUE, paste0(pipeline.root, "/analysis/exprs_matrices/"), "")
    write.table(df,
                file = paste0(dir, baseNm),
                sep = "\t",
                quote = FALSE,
                row.names = FALSE)
  }
  
  # Raw EM
  .writeTbl(exprs, onCL, paste0(output.tsv, ".raw"))
  
  # Normalized EM
  .writeTbl(norm_exprs, onCL, output.tsv)
  
  # summary EM
  .writeTbl(sum_exprs, onCL, paste0(output.tsv, ".summary"))
  
  # original summary EM if through UI
  if (onCL == FALSE) {
    .writeTbl(sum_exprs, onCL, paste0(output.tsv, ".summary.orig"))
  }
  
}

#-------------------------------
# PIPELINE WRAPPER
#-------------------------------

# onCL means onCommandLine and avoids writing out extra
runCreateMx <- function(labkey.url.base,
                        labkey.url.path,
                        pipeline.root,
                        analysis.directory,
                        output.tsv,
                        selectedBiosamples,
                        fasId,
                        taskOutputParams,
                        onCL = FALSE){
  
  # -------------------------------- RETRIEVE INPUTS ----------------------------------
  # For printing and con
  study <- gsub("/Studies/", "", labkey.url.path)
  mx <- gsub(".tsv", "", output.tsv)
  
  if (onCL == TRUE) {
    print(paste(study, mx))
  }
  
  # Check that output filepath exists before starting run
  outPath <- file.path(pipeline.root, "analysis/exprs_matrices")
  if (!dir.exists(outPath)) {
    dir.create(outPath)
  }
  
  # Check that feature2gene mapping is available prior to doing work
  co <- labkey.setCurlOptions(ssl_verifyhost = 2, sslversion = 1)
  
  FAS_filter <- makeFilter(c("FeatureAnnotationSetId/RowId",
                             "IN",
                             fasId))
  
  f2g <- data.table(labkey.selectRows(baseUrl = labkey.url.base,
                                      folderPath = "/Studies/",
                                      schemaName = "Microarray",
                                      queryName = "FeatureAnnotation",
                                      colFilter = FAS_filter,
                                      colNameOpt = "rname",
                                      colSelect = c("featureid","genesymbol")))
  
  if (nrow(f2g) == 0) {
    stop("The downloaded feature annotation set has 0 rows.")
  }
  
  # Specifying study and onTest so that code can be used in either module / pipeline,
  # which currently pulls lub and lup from javascript calls, or CL work.
  onTest <- labkey.url.base == "https://test.immunespace.org"
  con <- CreateConnection(study = study, onTest = onTest)
  
  # Create GEF
  bs_filter <- makeFilter(c("biosample_accession", "IN", gsub(",", ";", selectedBiosamples)))
  gef <- con$getDataset("gene_expression_files",
                        colFilter = bs_filter,
                        original_view = TRUE,
                        reload = TRUE)
  
  # ensure single cohort for processing
  if (length(unique(gef$arm_name)) > 1) {
    stop("There are more than one cohort selected in this HIPCMatrix run.")
  }
  
  # ensure each expsample has unique biosample, otherwise summarization is thrown off
  if (length(gef$biosample_accession) != length(gef$expsample_accession)) {
    stop("Experiment samples do not have unique biosample accessions.")
  }
  
  # --------------------------- HARDCODED META-DATA -----------------------------------
  
  # Manually curate list object to avoid hardcoding elsewhere
  metaData <- list()
  
  # **isGeo**: Preference is to use GEO when selectedBiosamples have both gsm and 
  # flat files because there is often info in GEO about whether files are raw
  # or normalized that is not available in ImmPort. However, there are exceptions
  # and those are handled here - e.g. SDY212 where we know from ImmSig1 that the 
  # available flat file is truly non-normalized data.
  dontUseGeo <- study %in% c("SDY212","SDY224")
  metaData$isGeo <- any(!is.na(gef$geo_accession)) & !dontUseGeo
  
  # **dataInGsm**: means that the raw data is kept in the eset provided by getGEO()
  metaData$dataInGsm <- study %in% c("SDY1289", "SDY180")
  
  # **useGsmSuppFls**: Usually refers to Affymetrix studies that have the CEL.gz files
  # loaded into GEO as a supplementary file to the single GSM accession as opposed to 
  # the Illumina that often have a single tsv.gz file in the series accession (GSE)
  metaData$useGsmSuppFls <- study %in% c("SDY80", "SDY113", "SDY269", "SDY406", 
                                         "SDY984", "SDY1260", "SDY1264", "SDY1293",
                                         "SDY270")
  
  # **studyIdTerm**: For extracting sample id from getGEO(gsm) object
  useDescription <- study %in% c("SDY144","SDY1373","SDY1364","SDY1325")
  metaData$studyIdTerm <- ifelse(useDescription, "description", "title")
  
  # **smplGsubTerms**: Custom gsub terms for allowing the mapping of study-given ids
  # from the supplementary files to the ids found in GEO in the header object.
  metaData$smplGsubTerms <- list(
    SDY1276 = list(old = "WholeBloodRNA_", new = ""),
    SDY224  = list(old = " \\[PBMC\\]", new = ""),
    SDY63   = list(old = "^101", new = "10"),
    SDY888  = list(old = "( |)_(N|n)egative|(S|s)econdary", new = "_RNASeq"),
    SDY1373 = list(old = "Sample name: ", new = ""),
    SDY1364 = list(old = "$", new = "\\.AVG_Signal"),
    SDY1325 = list(old = "$", new = "\\.AVG_Signal")
  )
  
  # **gsmTblVarNm**: Custom list of raw values column name for gsm-based data
  metaData$gsmTblVarNm <- list(
    SDY1289 = "AVERAGE_SIGNAL",
    SDY180  = "VALUE",
    SDY1293 = "VALUE"
  )
  
  # **noRaw**: No raw data available in GEO or ImmPort
  metaData$noRaw <- study %in% c("SDY1324")
  
  # **platform**: sequencing platform (Affymetrix, Illumina, or 'NA', aka RNAseq)
  fas <- data.table(labkey.selectRows(baseUrl = labkey.url.base,
                                      folderPath = "/Studies/",
                                      schemaName = "Microarray",
                                      queryName = "FeatureAnnotationSet",
                                      colNameOpt = "rname",
                                      showHidden = T))
  metaData$platform <- fas$vendor[ fas$rowid == fasId ]
  
  # ----------------------------- PROCESSING -------------------------------------
  
  # Identify correct inputFiles
  if (metaData$isGeo == FALSE & study != "SDY224") {
    inputFiles <- gef$file_info_name[ grep("cel$|txt$|tsv$|csv$",
                                           gef$file_info_name,
                                           ignore.case = TRUE)]
    inputFiles <- paste0(pipeline.root, "/rawdata/gene_expression/", inputFiles)
    inputFiles <- unique(inputFiles[ file.exists(inputFiles) ])
  } else if (study == "SDY224") {
    rawDir <- "/share/files/Studies/SDY224/@files/rawdata/gene_expression/raw_counts/"
    inputFiles <- paste0(rawDir, list.files(rawDir))
  } else {
    inputFiles <- NA
    gef <- gef[ !is.na(gef$geo_accession), ]
  }
  
  # Create three versions of matrix
  exprs <- makeRawMatrix(metaData = metaData,
                         gef = gef,
                         study = study,
                         inputFiles = inputFiles)
  
  norm_exprs <- normalizeMatrix(exprs, study, metaData)
  
  sum_exprs <- summarizeMatrix(norm_exprs, f2g)
  
  # ------------------------------ OUTPUT ------------------------------------------
  writeMatrix(pipeline.root, output.tsv, exprs, norm_exprs, sum_exprs, onCL)
  
  # This file gets cleaned up anyway, so not worrying about it onCL
  if (onCL == FALSE) {
    outProps = file(description = taskOutputParams, open = "w")
    cat(file = outProps, sep="", "name\tvalue\n")
    cat(file = outProps, sep="", "assay run property, cohort\t", unique(gef$cohort), "\n")
    flush(con = outProps)
    close(con = outProps)
  }
  
  # create copy of CM.R script from run time, after checking to be sure analysis
  # directory is in place. It is missing from some studies for some reason.
  if (!dir.exists(analysis.directory)) {
    dir.create(analysis.directory, recursive = TRUE)
  }
  
  file.copy(from = "/share/github/LabKeyModules/HIPCMatrix/pipeline/tasks/create-matrix.R",
            to = paste0(analysis.directory, "/", output.tsv, "-create-matrix-snapshot.R"))
  
  file.copy(from = "/share/github/LabKeyModules/HIPCMatrix/pipeline/tasks/runCreateMx.R",
            to = paste0(analysis.directory, "/", output.tsv, "-runCM-snapshot.R"))
  
  # write out tsv of vars to make later replication of results easier
  varDf <- data.frame(labkey.url.base = labkey.url.base,
                      labkey.url.path = labkey.url.path,
                      pipeline.root = pipeline.root,
                      analysis.directory = analysis.directory,
                      selectedBiosamples = selectedBiosamples,
                      fasId = fasId,
                      taskOutputParams = taskOutputParams,
                      output.tsv = output.tsv,
                      stringsAsFactors = FALSE
  )
  
  write.table(varDf,
              file = paste0(analysis.directory, "/create-matrix-vars.tsv"),
              sep = "\t",
              quote = FALSE,
              row.names = FALSE)
}
