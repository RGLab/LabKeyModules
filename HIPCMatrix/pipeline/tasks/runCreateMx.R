#-------------------------------
# DEPENDENCIES
#-------------------------------
library(data.table)
library(Rlabkey)
library(tools)
library(ImmuneSpaceR)
library(Biobase)

#-------------------------------
# HELPER FUNCTIONS
#-------------------------------

#--------PROCESSING FUNCTIONS---------------------------------------------

# Process GEO accession
# Returns a data.table with a feature_id column and one column per expsample_accession
#' @importFrom Biobase exprs sampleNames
.process_GEO_microarray <- function(gef){
  gef <- gef[ geo_accession != "" ] # Make sure we only have rows with GEO.
  gsm <- getGEO(gef[1, geo_accession])
  gse <- gsm@header$series_id[1] # Assumes that the serie is the first one (SuperSeries with higher ID)
  es <- getGEO(gse)[[1]]
  es <- es[ , sampleNames(es) %in% gef$geo_accession ]
  if(all(gef$geo_accession %in% sampleNames(es))){ # All selected samples are in the series
    sampleNames(es) <- gef[match(sampleNames(es), geo_accession), expsample_accession] # sampleNames are GEO accession
    exprs <- data.table(exprs(es))
    exprs <- exprs[ , feature_id := featureNames(es) ]
    setcolorder(exprs, c("feature_id", cnames))
  } else{
    stop(paste0("Some of the selected gene_expression_files rows are not part of ",
                gse, ". Add code!"))
  }
  return(exprs)
}

# For SDY888 and others that pull base counts from GEO supplementary files
.process_GEO_rnaseq <- function(gef, study){

  #----GEO-PROCESSING HELPERS-------
  # Needed b/c multiple gse must be parsed for single cohort.
  # getGEO not working consistently b/c download.file.method.GEOquery = "auto",
  # which can't handle non https if it is libcurl. Therefore use download.file
  # directly to avoid method issue.
  .getGse <- function(singleGsm){
    url <- paste0("http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?targ=self&acc=",
                  singleGsm,
                  "&form=text&view=full")
    destfile <- tempfile()
    download.file(url = url, destfile = destfile)
    gsm <- getGEO(filename = destfile)
    gse <- gsm@header$series_id[1]
    return(gse)
  }

  # get Raw Counts Tbl from supplementary files b/c matrix preprocessed differently.
  # map names from GEO.expSmpls to IS.geoAccession so can do mapping to biosample later.
  .getRawCnts <- function(gse){
    metaDataLs <- getGEO(gse, GSEMatrix = FALSE)
    smpls <- sapply(names(metaDataLs@gsms), function(x){
        return(metaDataLs@gsms[[x]]@header$title[[1]])
    })
    es2gs <- data.frame(geo = names(metaDataLs@gsms),
                        smpl = smpls,
                        stringsAsFactors = FALSE)
    es2gs$smpl <- gsub("(N|n)egative|(S|s)econdary", "RNASeq", es2gs$smpl)
    es2gs$smpl <- gsub(" ", "", es2gs$smpl)
  
    url <- metaDataLs@header$supplementary_file[[1]]

    gzPath <- tempfile()
    tsvPath <- tempfile()
    tmp <- httr::GET(url = url, httr::write_disk(gzPath, overwrite = TRUE))
    gunzip(filename = gzPath, destname = tsvPath, overwrite = TRUE)
    rawCnts <- read.table(tsvPath, sep = "\t", header = TRUE)

    rownames(rawCnts) <- rawCnts$GENES
    colnames(rawCnts) <- es2gs$geo[ match(colnames(rawCnts), es2gs$smpl) ]
    rawCnts <- rawCnts[ , -(is.na(colnames(rawCnts))) ]

    return(rawCnts)
  }

  #------MAIN----------

  # SDY888 has cohorts split across gse, so easiest to get both rawCnt tbls and merge
  # before doing subsetting instead of guessing at which is needed based on gsms
  if( study == "SDY888" ){
    gses <- c("GSE97862", "GSE97861")
    res <- lapply(gses, .getRawCnts)
    rawCnts <- merge(res[[1]], res[[2]], by = "row.names") # by rownames
    rownames(rawCnts) <- rawCnts$Row.names
    rawCnts <- rawCnts[ , -1]
  }else{
    # TODO: this code has not actually been tested b/c no case study!
    gse <- .getGse(gef$geo_accession[[1]])
    rawCnts <- .getRawCnts(gse)
  }

  # prep for normalization and ensure only members of original gef are kept
  rawCnts <- rawCnts[ , colnames(rawCnts) %in% gef$geo_accession ]

  # convert colnames to biosample from gsm
  colnames(rawCnts) <- gef$biosample_accession[ match(colnames(rawCnts),
                                                         gef$geo_accession)]

  exprs <- data.table(rawCnts, keep.rownames = TRUE)
  setnames(exprs, "rn", "feature_id")

  return(exprs)
}

# Process CEL files
# @param gef A \code{data.table} the gene_expression_files table or a subset of
#  it.
# @param inputFiles A \code{character}. The filenames.
# @return A \code{matrix} with biosample_accession as cols and feature_id as rownames
#' @importFrom affy justRMA
.process_CEL <- function(gef, inputFiles, study){
  # Load package used to convert xy plate coordinates to probe id.
  # affy::justRMA will try to install a cdf pkg if it cannot find the right one
  # and cause an error because it is being run as immunespace and not root user.
  if(study == "SDY28"){
    library(hgu133plus2cdf)
  }else if(study %in% c("SDY112", "SDY305","SDY315") ){
    library(primeviewcdf)
  }else{
    library(hthgu133pluspmcdf)
  }
  tmp <- getwd()
  setwd("/") # b/c filepaths are absolute and justRMA prepends wd
  eset <- affy::justRMA(filenames = inputFiles, normalize = FALSE)
  setwd(tmp)
  exprs <- data.table(exprs(eset), keep.rownames = TRUE)
  colnames(exprs) <- gef$biosample_accession[ match(colnames(exprs), gef$file_info_name) ]
  setnames(exprs, "rn", "feature_id")
  return(exprs)
}

# This will work for files that follow the standards from immport
# Eventually, all tsv files should be rewritten to follow this standard.
# @return A matrix with biosample_accession as cols and feature_id as rownames
#' @importFrom reshape2 acast
.process_TSV <- function(gef, inputFiles, isRNA, study){
  exprs <- fread(inputFiles, header = TRUE)
  if( isRNA == FALSE ){
    exprs <- setnames(exprs, tolower(chartr(" ", "_", names(exprs))))
    if( study == "SDY299" ){
	ui2es <- fread("/share/files/Studies/SDY299/@files/rawdata/gene_expression/SDY299_userIds2expSmpls.csv")
        tmp <- ui2es[, Accession][ match(exprs[,`experiment_sample_user-defined_id`], ui2es[,`User Defined ID`])]
        exprs[, experiment_sample_accession := tmp]
    }
    if( !all(c("target_id", "raw_signal" ) %in% colnames(exprs))){
      stop("The file does not follow HIPC standards.")
    }
    try(setnames(exprs, "experiment_sample_accession", "expsample_accession"))
    try(setnames(exprs, "target_id", "feature_id"))
    if( "expsample_accession" %in% colnames(exprs) ){
      accessionCol <- "expsample_accession"
    } else if("biosample_accession" %in% colnames(exprs)){
      accessionCol <- "biosample_accession"
    } else{
      stop("The input file must contain either biosample_accession or expsample_accession")
    }
    exprs <- reshape2::acast(exprs, formula = paste("feature_id ~", accessionCol), value.var = "raw_signal")
    exprs <- exprs[ , c(colnames(exprs) %in% gef[[accessionCol]]) ]
    exprs <- data.table(exprs, keep.rownames = TRUE)
    setnames(exprs, "rn", "feature_id")
  }else{
    try(setnames(exprs, "V1", "feature_id"))
  }
  return(exprs)
}

.process_others <- function(gef, inputFiles, study){

  # Generating Raw Expression Values Matrix
  if( length(inputFiles) > 1 ){
    lf <- lapply(inputFiles, fread)
    names(lf) <- basename(inputFiles)
    exprs <- rbindlist(lf, idcol = TRUE)
    exprs <- setnames(exprs, tolower(chartr(" ", "_", names(exprs))))
    keepCols <- c("sample", "gene_symbol", "expression_value")

    if(study %in% c("SDY300","SDY67") ){ # essentially isRNA
      formula <- "gene_symbol ~ sample"
      rNamesCol <- "gene_symbol"
      try(setnames(exprs, "gene_count", "expression_value"), silent = TRUE) # only for SDY300  
    }else{
      try(setnames(exprs, "target_id", "probe_id"), silent = TRUE) # silent b/c SDY296 already has correct names
      try(setnames(exprs, "raw_signal", "expression_value"), silent = TRUE)
      keepCols <- c(keepCols, "probe_id")
      formula <- "probe_id ~ sample"
      rNamesCol <- "probe_id"
    }

    file2sample <- unique(gef[, list(file_info_name, expsample_accession)])
    exprs[, sample := file2sample[match(.id, file_info_name), expsample_accession]]
    exprs <- exprs[ , keepCols, with = FALSE  ]
    
    if(study != "SDY300"){
      exprs <- dcast.data.table(exprs, formula = formula, value.var = "expression_value")
    }else{
      # 20731 genes present in all 90 samples, but 20937 only present in 31? why?
      # Some genes duplicated in a handful of samples, these are therefore averaged
      exprs <- dcast.data.table(exprs, formula = formula, value.var = "expression_value", fun.aggregate = mean)
      # rm genes that were saved as dates or blank, most likely just digits converted by ms excel
      exprs <- exprs[ grep("^\\d{1,2}-[A-z]{3}|^$", exprs[,gene_symbol], invert = TRUE) ]
      # At this point many NaN left in matrix due to the missing data. Leaving as-is for the moment.
    }
    
    setnames(exprs, rNamesCol, "feature_id")
  
  } else {
    exprs <- fread(inputFiles, header = TRUE)
    sigcols <- grep("Signal", colnames(exprs), value = TRUE)
    rNamesCol <- ifelse(study %in% c("SDY400","SDY404","SDY80","SDY63"), "V1", "PROBE_ID")
    rnames <- exprs[, rNamesCol, with = FALSE]
    if( length(sigcols) > 0 ){
      exprs <- exprs[ , sigcols, with = FALSE ]
      setnames(exprs, gsub(".AVG.*$", "", colnames(exprs)))
    }else if( all(gef$biosample_accession %in% colnames(exprs)) ){
      exprs <- exprs[ , gef$biosample_accession, with = FALSE ]
    }else{
      stop("Unknown format: check data and add code if needed.")
    }
    exprs[, feature_id := rnames]
    # if(study == "SDY312"){
      # map colnames to expSamples
    #}
  }

  return(exprs)
}

#----------HIGHER LEVEL FUNCTIONS-----------------------------------------------------

# @value A data.table with a feature_id column and one column per biosample_accession
makeRawMatrix <- function(isGEO, isRNA, gef, study, inputFiles){

  # Filetypes
  if( isGEO == TRUE ){
    library(GEOquery)
    if( isRNA == TRUE ){
      exprs <- .process_GEO_rnaseq(gef, study)
    }else{
      exprs <- .process_GEO_microarray(gef)
    }
  }else{
    ext <- unique(file_ext(inputFiles))
    if( length(ext) > 1 ){
      stop(paste("There is more than one file extension:", paste(ext, collapse = ",")))
    }else if( ext %in% c("cel","CEL") ){
      exprs <- .process_CEL(gef, inputFiles, study)
    }else if( ext == "txt" | study %in% c("SDY162", "SDY180", "SDY212", "SDY400", "SDY404", "SDY80", "SDY63") ){
      exprs <- .process_others(gef, inputFiles, study)
    }else if( ext %in% c("tsv","csv") ){
      exprs <- .process_TSV(gef, inputFiles, isRNA, study)
    }else{
      stop("File extension not supported.")
    }
  }

  # Just to be sure! SDY212 has dup BioSamples therefore careful when re-ordering
  exprs <- data.table(exprs)
  nonFid <- grep("feature_id", names(exprs), invert = TRUE)
  fid <- grep("feature_id", names(exprs))
  setcolorder(exprs, c(fid, nonFid))

  # Change colnames from expsample_accession to biosample_accession
  ess <- grep("^ES", colnames(exprs), value = TRUE)
  if( length(ess) > 0 ){
    bss <- gef$biosample_accession[ match(ess, gef$expsample_accession)]
    setnames(exprs, ess, bss)
  }

  # Some single tsv (e.g. SDY224, SDY212) are loaded and we want to be sure that
  # only biosamples from subset gef are used!
  exprs <- exprs[ , colnames(exprs) %in% c("feature_id", gef$biosample_accession), with = FALSE ]

  return(exprs)
}

#' @importFrom preprocessCore normalize.quantiles
#' @import DESeq
normalizeMatrix <- function(exprs, study, isRNA){
  # exprs comes in as data.table with feature_id col holding probes
  # data.table so MUST COPY to prevent changes in later work
  em <- copy(exprs)
  # already processed and raw data only in SRA, no raw count matrix easily available
  if( study == "SDY224"){ 
    return(em) 
  }else if(study == "SDY300"){
    em <- na.omit(em) # removes approx 20k rows! b/c DESeq needs only integers
  }

  rnames <- em[ , feature_id ]
  em[ , feature_id := NULL]
  em <- as.matrix(em)

  if( isRNA == TRUE){
    # Uses DESeq methods
    library(DESeq)
    cds <- newCountDataSet(countData = em, conditions = colnames(em))
    cds <- estimateSizeFactors(cds) ## estimate size factor
    cdsBlind <- estimateDispersions(cds, method = "blind" )
    vsd <- varianceStabilizingTransformation(cdsBlind)
    norm_exprs <- exprs(vsd)
  }else{
    cnames <- colnames(em)
    norm_exprs <- preprocessCore::normalize.quantiles(em)
    colnames(norm_exprs) <- cnames
    norm_exprs <- pmax(norm_exprs, 1)
    if( max(norm_exprs, na.rm = TRUE) > 100 ){ norm_exprs <- log2(norm_exprs) } # na.rm b/c SDY212 has NA ... Jira issue opened with ImmPort
  }

  norm_exprs <- data.table(norm_exprs)
  norm_exprs[ , feature_id := rnames]
  nonFid <- grep("feature_id", names(norm_exprs), invert = TRUE)
  fid <- grep("feature_id", names(norm_exprs))
  setcolorder(norm_exprs, c(fid, nonFid))

  return(norm_exprs)
}

summarizeMatrix <- function(norm_exprs, f2g){
  # exprs comes in as data.table with feature_id col holding probes
  # data.table by reference so MUST COPY to prevent changes in later work
  em <- copy(norm_exprs)
  em[ , gene_symbol := f2g[match(em$feature_id, f2g$featureid), genesymbol] ]
  em <- em[ !is.na(gene_symbol) & gene_symbol != "NA" ]
  em <- em[ , lapply(.SD, mean), by = "gene_symbol", .SDcols = grep("^BS", colnames(em)) ]
  return(em)
}

writeMatrix <- function(pipeline.root, output.tsv, exprs, norm_exprs, sum_exprs, onCL){
  # - Raw EM
  write.table(exprs,
              file = file.path(pipeline.root,
                               "analysis/exprs_matrices",
                               paste0(output.tsv,".raw")),
              sep = "\t",
              quote = FALSE,
              row.names = FALSE)

  # - Normalized EM
  write.table(norm_exprs,
              file = file.path(pipeline.root,
                               "analysis/exprs_matrices",
                               output.tsv),
              sep = "\t",
              quote = FALSE,
              row.names = FALSE)

  # - summary EM
  write.table(sum_exprs,
              file = file.path(pipeline.root,
                               "analysis/exprs_matrices",
                               paste0(output.tsv, ".summary")),
              sep = "\t",
              quote = FALSE,
              row.names = FALSE)

  # So as to avoid error in LK need blank single space probe colheader
  setnames(exprs, "feature_id", "ID_REF")

  if(onCL == FALSE){
    # - EM used for pipeline (not moved to the right location)
    write.table(exprs,
                file = output.tsv,
                sep = "\t",
                quote = FALSE,
                row.names = FALSE)
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
                        onCL = FALSE
                        ){

  # For printing and con
  sdy <- gsub("/Studies/", "", labkey.url.path)
  mx <- gsub(".tsv", "", output.tsv)

  if( onCL == TRUE ){
    print(paste(sdy, mx))
  }

  # Check that output filepath exists before starting run
  outPath <- file.path(pipeline.root, "analysis/exprs_matrices")
  if( !dir.exists(outPath) ){
    stop(paste0("file path ", outPath, " does not exist. Please correct and re-run"))
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

  if(nrow(f2g) == 0){ stop("The downloaded feature annotation set has 0 rows.") }

  # Specifying study and onTest so that code can be used in either module / pipeline,
  # which currently pulls lub and lup from javascript calls, or CL work.
  onTest <- labkey.url.base == "https://test.immunespace.org"
  con <- CreateConnection(study = sdy, onTest = onTest)

  # Create GEF
  bs_filter <- makeFilter(c("biosample_accession", "IN", gsub(",", ";", selectedBiosamples)))
  gef <- con$getDataset("gene_expression_files",
                        colFilter = bs_filter,
                        original_view = TRUE,
                        reload = TRUE)

  # ensure single cohort for processing
  if( length(unique(gef$arm_name)) > 1 ){
    message("There are more than one cohort selected in this HIPCMatrix run")
  }

  # manually curate list of RNAseq  and GEO studies
  isRNA <- con$study %in% c("SDY888", "SDY224", "SDY67", "SDY300")
  isGEO <- con$study %in% c("SDY888")

  # limit inputFiles to only those existing
  # SDY224 is special case where we use local copy of a processed counts tsv not listed in gef
  if( isGEO == FALSE ){
    if( con$study == "SDY224"){
      inputFiles <- "TIV_2010.tsv"
    }else if( con$study == "SDY299"){
      inputFiles <- "ImmportMicroarrayDataHeplisav.441456.csv"
    }else if( con$study %in% c("SDY400", "SDY404", "SDY80", "SDY63") ){
      inputFiles <- paste0(mx, ".tsv")
    }else{
      inputFiles <- gef$file_info_name[ grep("CEL$|cel$|txt$|tsv$|csv$", gef$file_info_name)]
    }
    inputFiles <- paste0(pipeline.root, "/rawdata/gene_expression/", inputFiles)
    inputFiles <- unique(inputFiles[file.exists(inputFiles)]) # sometimes all subs in single file
  }else{
    inputFiles <- NA
  }

  # Create three versions of matrix
  exprs <- makeRawMatrix(isGEO = isGEO,
                         isRNA = isRNA,
                         gef = gef,
                         study = con$study,
                         inputFiles = inputFiles)

  norm_exprs <- normalizeMatrix(exprs, con$study, isRNA)

  sum_exprs <- summarizeMatrix(norm_exprs, f2g)

  # --------------- output -------------------
  writeMatrix(pipeline.root, output.tsv, exprs, norm_exprs, sum_exprs, onCL)

  # This file gets cleaned up anyway, so not worrying about it onCL
  if( onCL == FALSE ){
    outProps = file(description = taskOutputParams, open = "w")
    cat(file = outProps, sep="", "name\tvalue\n")
    cat(file = outProps, sep="", "assay run property, cohort\t", unique(gef$cohort), "\n")
    flush(con = outProps)
    close(con = outProps)
  }

  # create copy of CM.R script from run time, after checking to be sure analysis
  # directory is in place. It is missing from some studies for some reason.
  if(!dir.exists(analysis.directory)){
    dir.create(analysis.directory, recursive = TRUE)
  }

  file.copy(from = "/share/github/LabKeyModules/HIPCMatrix/pipeline/tasks/create-matrix.R",
            to = paste0(analysis.directory, "/create-matrix-snapshot.R")
            )

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
              quote = FALSE)
}

