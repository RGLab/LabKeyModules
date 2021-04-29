#-------------------------------
# DEPENDENCIES
#-------------------------------
library(data.table)
library(Rlabkey)
library(tools)
library(ImmuneSpaceR)
library(Biobase)
library(GEOquery)
library(limma)
library(illuminaio)

#######################################
###         FILE RETRIEVAL          ###
#######################################
# Important that run specific directory is created to avoid overlap with previous runs.
# This done with unique cell_type * arm_accession string (aka cohort_type)
.getBaseDir <- function(study, gef){
  baseDir <- paste0("/share/files/Studies/",
                    study,
                    "/@files/rawdata/gene_expression/supp_files/",
                    paste0(unique(gef$type),
                           "_",
                           unique(gef$arm_accession)))
  dir.create(baseDir, recursive = TRUE)
  return(baseDir)
}

# Reduce list of matrices to single matrix and write to txt
.writeSingleMx <- function(em, baseDir, study){
  inputFiles <- file.path(baseDir, paste0(study, "_raw_expression.txt"))
  dmp <- write.table(em, file = inputFiles, sep = "\t", quote = FALSE, row.names = FALSE)
  return(inputFiles)
}

# Download, unzip, and return correct paths for GEO supplementary files
.dlSuppFls <- function(accList, baseDir, study){
  tmp <- sapply(accList, getGEOSuppFiles, makeDirectory = FALSE, baseDir = baseDir)
  fls <- list.files(baseDir)
  targetFlTerms <- "non-normalized|corrected|raw|cel|pbmc|count"
  rawFls <- fls[ grep(targetFlTerms, fls, ignore.case = TRUE) ]

  # Unzip any files if necessary - set `overwrite = TRUE` in case of processing fail
  flPaths <- rawFls[ grep("gz", rawFls) ]
  if (length(flPaths) > 0) {
    tmp <- sapply(file.path(baseDir, flPaths),
                  GEOquery::gunzip, overwrite = TRUE, remove = TRUE)
  }

  # find correct unzipped files with full paths
  # Do not include attempted intermediate file that may have been created if
  # run failed at a later point.
  fls <- file.path(baseDir, list.files(baseDir))
  fls <- fls[ grep(targetFlTerms, fls, ignore.case = TRUE)]
  inputFiles <- fls[ grep("gz|tar|RData", fls, invert = TRUE) ]
  inputFiles <- inputFiles[ grep(paste0(study, "_raw_expression"), inputFiles, invert = TRUE) ]
}

.subsetIlluminaEM <- function(em){
  badTerms <- c("bead", "array", "min", "max",
                "norm", "search", "gene", "target_id_type",
                "definition", "chromosome", "synonyms", "symbol",
                "probeid", "V([2-9]|\\d{2,3})") # allow V1
  em <- em[ , grep(paste(badTerms, collapse = "|"), colnames(em), ignore.case = TRUE, invert = TRUE), with = FALSE ]
}

# For read.ilmn() to work correctly the signal cols need format <smpl>.<exprValTerm>
# with the expression-value term being something like "AVG_Signal" or "SAMPLE". Then the
# detection p-value cols must have format <smpl>.Detection Pval. This way the
# rawElist creates the $E and $other$Detection matrices with same colnames of <smpl>.
# Since in this script the read.ilmn(file, exprs = "AVG_Signal", probeid = "ID_REF) is
# hardcoded. The vars are substituted here for other viable versions, e.g. SAMPLE and PROBE_ID.
.prepIlluminaHeaders <- function(em){
  detLoc <- grep("Detection", colnames(em), ignore.case = TRUE)
  detVals <- colnames(em)[detLoc]
  nmsLoc <- grep("Detection|ID_REF|PROBE_ID|TARGET_ID|GENE_SYMBOL",
                 colnames(em), invert = TRUE, ignore.case = TRUE)
  nmsVals <- colnames(em)[nmsLoc]
  chgDet <- (all(detVals == "Detection Pval") | all(grepl("P_VALUE|PVAL", detVals))) &
    length(detVals) > 0
  chgNms <- !all(grepl("AVG_Signal", nmsVals)) & !all(grepl("^ES\\d{6,7}$", nmsVals))
  chgPrb <- !any(grepl("ID_REF", colnames(em)))

  if (chgDet) {
    if (all(detVals == "Detection Pval")) {
      detVals <- paste0(nmsVals, ".", detVals)
    }
    detVals <- gsub("DETECTION_(PVAL|P_VALUE)", "Detection Pval", detVals)
    setnames(em, detLoc, detVals)
  }

  if (chgNms) {
    if ( any(grepl("RAW", nmsVals))) {
      nmsVals <- gsub("RAW_SIGNAL", "AVG_Signal", nmsVals)
    } else if (!any(grepl("SAMPLE", nmsVals))) {
      nmsVals <- paste0(nmsVals, ".AVG_Signal")
    } else if (all(grepl("^SAMPLE", nmsVals))){
      nmsVals <- paste0(nmsVals, ".AVG_Signal")
    } else {
      nmsVals <- gsub("AVG_Signal", "SAMPLE", nmsVals)
    }
    nmsVals <- gsub("SIGNAL", "Signal", nmsVals)
    setnames(em, nmsLoc, nmsVals)
  }

  if (chgPrb) {
    prb <- grep("PROBE_ID|V1|TARGET_ID", colnames(em))
    setnames(em, prb, "ID_REF")
  }

  return(em)
}

# Create map of GSM accessions to study-given IDs from GEO
.makeIdToGsmMap <- function(gef, metaData, study){
  mp <- lapply(gef$geo_accession, function(x){
    tmp <- getGEO(x)
    nm <- tmp@header[[metaData$studyIdTerm]][[metaData$gsmMapIndex]]
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

.fixHeaders <- function(mxList, study){
  if (study == "SDY224") {
    mxList <- lapply(mxList, function(x){
      setnames(x, as.character(x[1,]))
      x <- x[-(1:2),]
      colnames(x)[[1]] <- "ID_REF"
      return(x)
    })
  } else if (study == "SDY400") {
    # Using mapping file provided by Hailong Meng at Yale, Dec 2018
    # since note in header of file is misleading due to gsm swaps made
    # later based on knowledge of switched samples.
    mxList <- lapply(mxList, function(x){
      mp <- fread("/share/files/Studies/SDY400/@files/rawdata/gene_expression/SDY400_HeaderMapping.csv")
      setnames(x, colnames(x), as.character(x[2,]))
      x <- x[-(1:2),]
      smpls <- grep("SAMPLE", colnames(x), value = T)
      titles <- mp$Title[ match(smpls, mp$Sample) ]
      setnames(x, smpls, titles)
      return(x)
    })
  } else if (study == "SDY1325") {
    mxList <- lapply(mxList, function(x){
      setnames(x, colnames(x), as.character(x[5,]))
      x <- x[6:nrow(x),]
      return(x)
    })
  } else if (study == "SDY1324") {
    # Custom header mapping provided by authors via P.Dunn Dec 2018.
    mxList <- lapply(mxList, function(x){
      mp <- fread("/share/files/Studies/SDY1324/@files/rawdata/gene_expression/raw_counts/SDY1324_Header_Mapping.csv")
      accs <- grep("V1", colnames(x), invert = TRUE, value = TRUE)
      esNms <- mp$experimentAccession[ match(accs, mp$AuthorGivenId) ]
      setnames(x, accs, esNms)
      return(x)
    })
  } else if (study == "SDY787") {
    # Fist number is unique id
    mxList <- lapply(mxList, function(x) {
      # Remove first "_" and everything following
      setnames(x, colnames(x), gsub("_.*$", "", colnames(x)))
    })
  }
  return(mxList)
}


# Download Gsm supplementary files, unzip and return path
.getGsmSuppFiles <- function(gsm, baseDir){
  info <- getGEOSuppFiles(gsm, makeDirectory = FALSE, baseDir = baseDir)
  GEOquery::gunzip(rownames(info), overwrite = TRUE, remove = TRUE)
  return( gsub("\\.gz", "", rownames(info)) )
}

# mxList to flat file
.mxListToFlatFile <- function(mxList, baseDir, study){
  em <- Reduce(f = function(x, y) {merge(x, y)}, mxList)
  inputFiles <- .writeSingleMx(em, baseDir, study)
}


# Generate flat files that are ready for processing from GEO "raw" data.
# Warning! Raw data is highly variable for gse supplementary files
.prepGeoFls <- function(study, gef, metaData, inputFiles){
  baseDir <- .getBaseDir(study, gef)

  # Case 1: raw data is in object returned by getGEO(gsm)
  # Only Illumina as of DR28
  if (metaData$dataInGsm == TRUE) {
    mxList <- lapply(gef$geo_accession, function(x){
      obj <- getGEO(x)
      tbl <- obj@dataTable@table
      tbl <- tbl[ , colnames(tbl) %in% c("ID_REF", metaData$gsmTblVarNm[[study]]) ]
      colnames(tbl)[[2]] <- x
      return(tbl)
    })
    inputFiles <- .mxListToFlatFile(mxList, baseDir, study)

  } else {
    if (metaData$useGsmSuppFls == TRUE) {
      # Case 2: raw data in gsm supp files - Illumina
      if (metaData$platform == "Illumina") {
        mxList <- lapply(gef$geo_accession, function(gsm){
          path <- .getGsmSuppFiles(gsm, baseDir)

          if (study %in% names(metaData$illuminaManifestFile)) {
            res <- read.idat(idatfiles = path,
                             bgxfile = metaData$illuminaManifestFile[[study]])
            em <- res$E
            pvals <- detectionPValues(res)
            em <- data.table(gsm = em[,1], pvals = pvals[,1], ID_REF = res$genes$Probe_Id)
            em <- em[ !duplicated(em$ID_REF) ] # dups b/c single probe assigned to multiple array_ids
            setnames(em, "gsm", paste0(gsm, ".AVG_Signal"))
            setnames(em, "pvals", paste0(gsm, ".Detection Pval"))
          } else {
            em <- fread(path)
            em <- .subsetIlluminaEM(em)
            em <- .prepIlluminaHeaders(em)
            smplFormats <- "\\d{10}_[A-Z]"
            smplId <- regmatches(colnames(em)[[2]], regexpr(smplFormats, colnames(em)[[2]]))
            colnames(em) <- gsub(smplId, gsm, colnames(em))
          }
          return(em)
        })

        # Case 3: raw data in gsm supp files - Affymetrix
      } else if (metaData$platform == "Affymetrix") {
        inputFiles <- .dlSuppFls(accList = gef$geo_accession, baseDir, study)

        # Case 4: raw data in gsm supp files - Stanford custom HEEBO
      } else if (grepl("Stanford", metaData$platform)) {
        mxList <- lapply(gef$geo_accession, function(gsm){
          path <- .getGsmSuppFiles(gsm, baseDir)
          # Because of two colors, do background correction and processing here
          # to generate single expression value per probe
          em <- .processTwoColorArray(path)
          setnames(em, "gsm", gsm)
          return(em)
        })

        # Case 5: raw data in gsm supp files - RNAseq
      } else if (metaData$platform == "NA"){
        mxList <- lapply(gef$geo_accession, function(gsm){
          path <- .getGsmSuppFiles(gsm, baseDir)
          em <- fread(path)
          setnames(em, "V2", gsm) # ensemblId as 'V1'
          return(em)
        })
      }

      if (metaData$platform != "Affymetrix"){
        inputFiles <- .mxListToFlatFile(mxList, baseDir, study)
      }

    } else {
      # Cases 6 and 7: raw data in gse supp files - Illumina / RNAseq
      # temp handling for specialCase
      if(!metaData$useCustomRawFile){
        accList <- unique(unlist(lapply(gef$geo_accession, function(x){
          gsm <- getGEO(x)
          gse <- gsm@header$series_id
        })))
        inputFiles <- .dlSuppFls(accList, baseDir, study)
      }
      mxList <- lapply(inputFiles, fread)
      mxList <- .fixHeaders(mxList, study)

      # Case 6: Illumina raw data in gse supp files
      # Because multiple raw files need to be combined, must
      # address header issues prior to combination otherwise
      # untreated "Detection Pval" cols will cause dup error
      # during merge. Note: SDY400 handled in fixHeaders
      if (metaData$platform == "Illumina") {
        needMap <- study %in% names(metaData$smplGsubTerms) | metaData$gseNeedsMap
        if (needMap == TRUE) {
          mp <- .makeIdToGsmMap(gef, metaData, study)
        }

        mxList <- lapply(mxList, function(em){
          em <- .subsetIlluminaEM(em)
          em <- .prepIlluminaHeaders(em)
          if (needMap == TRUE) {
            # Fixed b/c some ids have escape char (e.g. ".")
            # Paste0 with "^" b/c some ids are numeric and confusable (e.g. "2.1" and "12.1")
            # lookahead to ensure full id before sep and not partial (e.g "PBMC_1" and "PBMC_12")
            # perl = TRUE for lookahead
            for (i in 1:nrow(mp)) {
              fixedId <- paste0("^", gsub(".", "\\.", mp$id[[i]], fixed = T), "(?=(\\.|_|$))")
              colnames(em) <- gsub(fixedId, mp$gsm[[i]], colnames(em), perl = TRUE)
            }
          }
          em <- em[ , grep("GSM|ID_REF", colnames(em)), with = FALSE]
        })
      }

      em <- Reduce(f = function(x, y) {merge(x, y)}, mxList)

      # Case 7: RNAseq in gse supp files
      # Header mapping assumes that names are in getGEO(gsm) object.
      # Need to check on a per study basis and tweak if need be.
      if (metaData$platform == "NA") {
        mp <- .makeIdToGsmMap(gef, metaData, study)
        em <- em[ , colnames(em) %in% c("GENES","V1", mp$id), with = FALSE ]
        nms <- grep("GENES|V1", colnames(em), invert = TRUE, value = TRUE)
        gsm <- mp$gsm[ match(nms, mp$id) ]
        setnames(em, nms, gsm)
      }

      inputFiles <- .writeSingleMx(em, baseDir, study)
    }
  }
  return(inputFiles)
}

.prepImmportFls <- function(study, gef, metaData, inputFiles){
  baseDir <- .getBaseDir(study, gef)
  if( metaData$platform == "Illumina") {
    mxList <- lapply(inputFiles, function(path){
      em <- fread(path)
      em <- .subsetIlluminaEM(em)
      em <- .prepIlluminaHeaders(em)
    })
  } else if (metaData$platform == "NA") {
    mxList <- lapply(inputFiles, fread)
    mxList <- .fixHeaders(mxList, study)
  }

  inputFiles <- .mxListToFlatFile(mxList, baseDir, study)
  return(inputFiles)
}

#######################################
###           PROCESSING            ###
#######################################

# If annotation library is not already on rsT, will need to manually install
# via biocLite() due to permissions.
.processAffy <- function(inputFiles, gef, metaData){
  # Libraries loaded here in order to get picked up by Scripts/getRpkgs.sh.
  # Only one is used at a time by the `affy::justRMA()` call.
  library(hugene10stv1cdf)
  library(primeviewcdf)
  library(hgu133plus2cdf)
  library(hgu133a2cdf)
  library(hthgu133pluspmcdf)
  library(huex10stv2cdf) # customCDF loaded from UpdateAnno Pkg
  library(hursta2a520709cdf) # customCDF loaded from UpdateAnno Pkg - SDY1328
  library(affy)

  # Background Correction Notes:
  # 'background' = TRUE performs function similar to normexp.fit.control and normexp.signal
  # from limma package.
  tmp <- getwd()
  setwd("/") # b/c filepaths are absolute and justRMA prepends wd
  eset <- affy::justRMA(filenames = inputFiles, normalize = FALSE, background = TRUE)
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

# For Illumina, correct background using nec() which
# calls normexp.fit.control and normexp.signal to use
# negative controls as identified by detection p-values
# to remove noise.
.processIllumina <- function(rawFl){
  em <- fread(rawFl)

  # check for known issues that would hinder background correction
  # 1. Subjects with no fluorescence measurements
  badSubs <- apply(em, 2, function(x){ all( x == 0 ) })
  if (any(badSubs)) {
    nms <- names(badSubs[ badSubs == TRUE ])
    es <- regmatches(nms, regexpr("(ES|GSM)\\d{6,7}", nms))
    em <- em[ , grep(es, colnames(em), invert = TRUE), with = FALSE]
  }

  # 2. Control or misnamed probes (not unique) - e.g. "NEGATIVE"
  em <- em[ grep("ILMN", em$ID_REF) ]
  write.table(em, rawFl, sep = "\t", row.names = FALSE, quote = FALSE)

  # Can only background correct using detection pvals.
  # Immport-derived files may already have this done in some cases.
  if (any(grepl("Detection", colnames(em)))){
    esList <- read.ilmn(rawFl,
                        expr = "AVG_Signal",
                        probeid = "ID_REF")
    em <- data.table(nec(esList)$E, keep.rownames = TRUE)
  }

  # Fix names for future mapping if necessary as read.ilmn()
  # leaves a suffix on `<smpl>_AVG_Signal` to be `<smpl>_`
  tags <- "BS|GSM|ES"
  if (any(grepl(tags, colnames(em)))) {
    nmsVals <- grep(tags, colnames(em), value = TRUE)
    rep  <- gsub("_", "", nmsVals) # SDY162
    setnames(em, nmsVals, rep)
  }

  return(em)
}

# Somewhat redundant in case of GEO files as there is no actual processing
# of raw counts files ...
.processRnaSeq <- function(inputFiles, study){
  lf <- lapply(inputFiles, fread)
  exprs <- data.table(Reduce(f = function(x, y) {merge(x, y, all = TRUE)}, lf))
}

# Two color array processing using limma and assuming genepix files.
# bc.method is the background correction method and normexp is used to match
# work with Illumina and Affymetrix.
.processTwoColorArray <- function(path){
  RG <- read.maimages(files = path, source = "genepix")
  MA <- normalizeWithinArrays(RG, bc.method = "normexp", method = "none")
  em <- data.table(feature_id = MA$genes$ID, gsm = MA$A[,1])

  # RM dup probes due to multiple probes per spot
  # RM NA vals possibly from background correction issues
  em <- em[ !duplicated(feature_id) & !is.na(gsm) ]

  # RM unmappable feature_ids
  em <- em[ grep("EMPTY|bsid", feature_id, invert = TRUE) ]
}

#######################################
###            MAPPING              ###
#######################################
# Standardize probe column name
.mapFeatureIdCol <- function(exprs){
  if (!any(grepl("feature_id", colnames(exprs)))) {

    # If Illumina from Immport
    prbCol <- grep("id_ref", colnames(exprs), ignore.case = TRUE)

    # If RNAseq then accept gene* or V1 col
    if (length(prbCol) == 0) {
      prbCol <- grep("gene|^V1$", colnames(exprs), ignore.case = TRUE)
    }

    # In case of features in rownames, e.g. from GEO
    if (length(prbCol) == 0) {
      prbCol <- "rn"
    }

    setnames(exprs, prbCol, "feature_id")
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

  # remove samples without matching biosample accession
  nms <- nms[!is.na(rep)]
  rep <- rep[!is.na(rep)]

  setnames(exprs, nms, rep)
  return(exprs)
}
#-------------------------------
# CREATE MATRIX FN
#-------------------------------

# @value A data.table with a feature_id column and one column per biosample_accession
makeRawMatrix <- function(metaData, gef, study, inputFiles){

  # Get raw files from GEO or prepare ImmPort flat files
  # At end of this step, there should be a single "cohort_type_raw_expression.txt"
  # file for non-affymetrix studies
  if (metaData$isGeo == TRUE) {
    inputFiles <- .prepGeoFls(study, gef, metaData, inputFiles)
  } else {
    inputFiles <- .prepImmportFls(study, gef, metaData, inputFiles)
  }

  # Generate background corrected raw matrices for affy and illumina
  # For RNAseq pass through raw counts file.
  if (metaData$platform == "Affymetrix" ) {
    exprs <- .processAffy(inputFiles, gef, metaData)
  } else {
    if (metaData$platform == "Illumina") {
      exprs <- .processIllumina(inputFiles)
    } else if (metaData$platform == "NA"){
      exprs <- .processRnaSeq(inputFiles, study)
    } else {
      exprs <- fread(inputFiles)
    }

    # Ensure probe col is named 'feature_id'
    exprs <- .mapFeatureIdCol(exprs)

    # Ensure all probes have names. Not a problem for most studies.
    # Note that values can still be NA here and may be due to a handful
    # of samples having problems (e.g. SDY224 / SDY212).  These NA values
    # are removed during normalization.
    exprs <- exprs[ !is.na(feature_id) & feature_id != "" ]
  }

  # Map expsample or geo accession to biosample accession
  exprs <- .mapAccToBs(exprs, gef)

  # Subset to biosamples in selectedBiosamples from UI
  exprs <- exprs[ , colnames(exprs) %in% c("feature_id", gef$biosample_accession),
                  with = FALSE ]

  # Check that all gef samples are in the matrix - may not be the case if some
  # were removed for QC issues.  User should re-run matrix with these samples
  # removed.
  if (!all(gef$biosample_accession %in% colnames(exprs))) {
    stop("Some selected biosamples are not found in raw-matrix. These may have been removed for QC issues. Please check and re-run")
  }

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
    # newCountDataSet does not take duplicated column names, so assign temporary unique names
    orginal_colnames <- colnames(em)
    colnames(em) <- seq_len(ncol(em))

    cds <- newCountDataSet(countData = em, conditions = colnames(em))
    cds <- estimateSizeFactors(cds)
    cdsBlind <- estimateDispersions(cds, method = "blind" )
    vsd <- varianceStabilizingTransformation(cdsBlind)
    norm_exprs <- exprs(vsd)
    colnames(norm_exprs) <- orginal_colnames
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

  # original summary EM assuming run created with _orig FasId
  .writeTbl(sum_exprs, onCL, paste0(output.tsv, ".summary.orig"))

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
  dontUseGeo <- study %in% c("SDY224")
  metaData$isGeo <- any(!is.na(gef$geo_accession)) & !dontUseGeo

  # **dataInGsm**: means that the raw data is kept in the eset provided by getGEO()
  metaData$dataInGsm <- study %in% c("SDY1289")

  # **useGsmSuppFls**: Usually refers to Affymetrix studies that have the CEL.gz files
  # loaded into GEO as a supplementary file to the single GSM accession as opposed to
  # the Illumina that often have a single tsv.gz file in the series accession (GSE)
  metaData$useGsmSuppFls <- study %in% c("SDY80", "SDY113", "SDY180", "SDY269",
                                         "SDY406", "SDY984", "SDY1260", "SDY1264",
                                         "SDY1293", "SDY270", "SDY1291", "SDY212",
                                         "SDY315", "SDY305", "SDY1328", "SDY1368",
                                         "SDY1370", "SDY1119", "SDY1294", "SDY1256",
                                         "SDY1412", "SDY1267", "SDY1086")

  #**illuminaManifestFile**: for studies with Illumina idat files that need bgx
  # manifest files.  These are found through the Illumina website and stored in
  # the UpdateAnno package. Below creates a temp file to store this data.
  # TODO: assign file based on fasId
  metaData$illuminaManifestFile <- list(
    SDY1368 = "HumanHT-12_V4_0_R2_15002873_B.bgx"
  )

  if (study %in% names(metaData$illuminaManifestFile)){
    manifestUrl <- paste0("https://github.com/RGLab/UpdateAnno/raw/main/CreateMatrixAssets/IlluminaManifests/", metaData$illuminaManifestFile[[study]])
    tmpFl <- tempfile()
    download.file(url = manifestUrl, destfile = tmpFl, quiet = TRUE)
    metaData$illuminaManifestFile[[study]] <- tmpFl
  }

  # **studyIdTerm**: For extracting sample id from getGEO(gsm) object
  useDescription <- study %in% c("SDY144", "SDY180", "SDY522", "SDY1373", "SDY1364",
                                 "SDY1325", "SDY640", "SDY520")
  metaData$studyIdTerm <- ifelse(useDescription, "description", "title")

  # **smplGsubTerms**: Custom gsub terms for allowing the mapping of study-given ids
  # from the supplementary files to the ids found in GEO in the header object.
  metaData$smplGsubTerms <- list(
    SDY1276 = list(old = "WholeBloodRNA_", new = ""),
    SDY224  = list(old = " \\[PBMC\\]", new = ""),
    SDY63   = list(old = "^101", new = "10"),
    SDY888  = list(old = "( |)_((N|n)egative|(S|s)econdary)", new = "_RNASeq"),
    SDY1373 = list(old = "Sample name: ", new = ""),
    SDY180  = list(old = "([0-9])([A-Z])", new = "\\1_\\2"),
    SDY787  = list(old = "\\D", new = "") # Replace all non-digits
  )

  # **gseNeedsMap**: Studies that need id-to-gsm mapping from gse supp files
  # without special gsub terms
  metaData$gseNeedsMap <- study %in% c("SDY404", "SDY522", "SDY1325", "SDY1364", "SDY144",
                                       "SDY400", "SDY640", "SDY520", "SDY1529")

  # **gsmMapIndex**: Index of samplename in vector from getGEO()
  useSecond <- c("SDY180", "SDY640", "SDY520")
  metaData$gsmMapIndex <- ifelse( study %in% useSecond, 2, 1)

  # **gsmTblVarNm**: Custom list of raw values column name for gsm-based data
  metaData$gsmTblVarNm <- list(
    SDY1289 = "AVERAGE_SIGNAL",
    SDY1293 = "VALUE"
  )

  # **noRaw**: No raw data available in GEO, ImmPort, or customRawFile
  metaData$noRaw <- study %in% c()

  # **platform**: sequencing platform (Affymetrix, Illumina, or 'NA', aka RNAseq)
  fas <- data.table(labkey.selectRows(baseUrl = labkey.url.base,
                                      folderPath = "/Studies/",
                                      schemaName = "Microarray",
                                      queryName = "FeatureAnnotationSet",
                                      colNameOpt = "rname",
                                      showHidden = T))
  metaData$platform <- fas$vendor[ fas$rowid == fasId ]

  # **useCustomRawFile**: For some studies a custom file has been provided by ImmPort
  # temporarily while they update a study. These should be checked periodically.
  specialCase <- study == "SDY1529" & (0 %in% unique(gef$study_time_collected))
  metaData$useCustomRawFile <- study %in% c("SDY224", "SDY1324") | specialCase

  # ----------------------------- PROCESSING -------------------------------------

  # Identify correct inputFiles
  if (metaData$isGeo == FALSE & metaData$useCustomRawFile == FALSE) {
    inputFiles <- gef$file_info_name[ grep("cel$|txt$|tsv$|csv$",
                                           gef$file_info_name,
                                           ignore.case = TRUE)]
    inputFiles <- paste0(pipeline.root, "/rawdata/gene_expression/", inputFiles)
    inputFiles <- unique(inputFiles[ file.exists(inputFiles) ])
  } else if (metaData$useCustomRawFile == TRUE) {
    suffix <- ifelse(specialCase, "author_data/", "raw_counts/")
    sdyGEDir <- paste0("/share/files/Studies/", study, "/@files/rawdata/gene_expression/")
    rawDir <- paste0(sdyGEDir, suffix)

    inputFiles <- list.files(rawDir, full.names = TRUE)

    uniqueSubString <- ifelse(specialCase, "GA", "Header")
    inputFiles <- inputFiles[ grep("uniqueSubString", inputFiles, invert = TRUE) ]
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

  # Allow for work on server or local
  LKModules <- ifelse(dir.exists("/share/github/LabKeyModules"),
                      "/share/github/LabKeyModules",
                      "~/LabKeyModules")

  file.copy(from = file.path(LKModules, "HIPCMatrix/pipeline/tasks/create-matrix.R"),
            to = paste0(analysis.directory, "/", output.tsv, "-create-matrix-snapshot.R"))

  file.copy(from = file.path(LKModules, "HIPCMatrix/pipeline/tasks/runCreateMx.R"),
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
