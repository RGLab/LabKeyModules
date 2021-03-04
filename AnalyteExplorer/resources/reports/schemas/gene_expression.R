process_gene_expression <- function() {
  # get-studies-to-use ---
  log_message("Fetching gene expression metadata..")
  geMetaData <- Rlabkey::labkey.selectRows(
    baseUrl = labkey.url.base,
    folderPath = "/Studies/",
    schemaName = "assay.ExpressionMatrix.matrix",
    queryName = "inputSamples_computed",
    colNameOpt = "rname"
  )
  keepCols <- c(
    "biosample_participantid",
    "biosample_study_time_collected",
    "run_dataoutputs_name"
  )
  geMetaData <- geMetaData[, colnames(geMetaData) %in% keepCols]

  geMetaData$study <- paste0("SDY", sapply(strsplit(geMetaData$biosample_participantid, "\\."), "[", 2))
  geMetaData$expression_matrix <- gsub("\\.tsv", "", geMetaData$run_dataoutputs_name)

  geMetaData <- geMetaData[geMetaData$biosample_study_time_collected >= 0, ]
  geMetaData <- data.table::data.table(geMetaData)

  geMetaData <- geMetaData[, hasData := 0 %in% unique(biosample_study_time_collected) &
    length(unique(biosample_study_time_collected)) > 1,
  by = .(biosample_participantid)
  ]
  geMetaData <- geMetaData[hasData == TRUE]


  # create-eset ---
  log_message("Creating expression sets...")
  esets <- lapply(unique(geMetaData$study), function(study) {
    log_message(study)
    con <- ImmuneSpaceR::CreateConnection(study)
    eset <- con$getGEMatrix(con$cache$GE_matrices$name)
  })

  # Combine esets
  log_message("Combining expression sets...")
  eset <- ImmuneSpaceR:::.combineEMs(esets)

  # subset eset by pids in geMetaData$hasData
  pidsWithData <- unique(geMetaData$biosample_participantid)
  eset <- eset[, eset$participant_id %in% pidsWithData]
  saveRDS(eset, file = "eset.rds")


  # clean-eset ---
  log_message("Cleaning combined expression set...")
  # Handle baseline dupes
  # rm values before dneg7
  eset <- eset[, eset$study_time_collected >= -7]

  # If pids have d0 and d7, remove dneg7.
  # If multiple baseline, select one
  baseline <- eset[, eset$study_time_collected <= 0]
  dupes <- baseline$participant_id[duplicated(baseline$participant_id)]
  bsToRemove <- sapply(dupes, function(pid) {
    dupEntries <- baseline[, baseline$participant_id == pid]
    toKeep <- dupEntries$biosample_accession[dupEntries$study_time_collected == max(dupEntries$study_time_collected)][[1]]
    currRm <- dupEntries$biosample_accession[dupEntries$biosample_accession != toKeep]
  })
  bsToRemove <- unlist(unname(bsToRemove))
  eset <- eset[, !eset$biosample_accession %in% bsToRemove]

  # Add meta-data fields for hover text
  eset$study_accession <- gsub("SUB\\d{6}\\.", "SDY", eset$participant_id)
  splitCohortTypes <- strsplit(eset$cohort_type, split = "_")
  eset$cell_type <- sapply(splitCohortTypes, "[", 2)

  studyInfo <- Rlabkey::labkey.selectRows(
    baseUrl = labkey.url.base,
    folderPath = "/Studies/",
    schemaName = "immport",
    queryName = "study",
    colNameOpt = "rname"
  )

  eset$condition <- studyInfo$condition_studied[match(
    eset$study_accession,
    studyInfo$study_accession
  )]
  pd <- Biobase::pData(eset)
  pd <- mapCondition(pd)
  if (all.equal(rownames(pd), colnames(Biobase::exprs(eset)))) {
    Biobase::pData(eset) <- pd
  } else {
    stop("ensure ordering and matching of biosample ids")
  }


  # create-gene-summary-data ---
  log_message("Creating gene summary data...")
  geneSummary <- createSummaryData(eset, logData = TRUE)
  geneSummary$feature <- "gene"
  saveRDS(geneSummary, "geByTimepoint_gene.rds")


  # extract-em ---
  em <- Biobase::exprs(eset)


  # create-btm-summary-data ---
  log_message("Creating btm summary data...")
  btms <- UpdateAnno::emory_blood_transcript_modules

  # summarize btms as average of genes included in btm
  btmList <- lapply(names(btms), function(x) {
    log_message(x)
    selectRows <- which(rownames(em) %in% btms[[x]])
    subEm <- em[selectRows, ]
    if (!is.null(dim(subEm))) {
      return(colMeans(subEm))
    } else {
      return(subEm)
    }
  })

  btmEm <- data.frame(do.call(rbind, btmList), stringsAsFactors = FALSE)
  rownames(btmEm) <- names(btms)

  btmEset <- Biobase::ExpressionSet(
    assayData = as.matrix(btmEm),
    phenoData = Biobase::AnnotatedDataFrame(Biobase::pData(eset))
  )

  # save btmEset
  saveRDS(btmEset, "btmEset.rds")

  btmSummary <- createSummaryData(btmEset, logData = TRUE)
  btmSummary$feature <- "blood transcript module"
  saveRDS(btmSummary, "geByTimepoint_btm.rds")


  # summarize-data-by-gene-signature ---
  log_message("Creating gene sig summary data...")
  geneSignatures <- Rlabkey::labkey.selectRows(
    baseUrl = labkey.url.base,
    folderPath = labkey.url.path,
    schemaName = "analyte_explorer",
    queryName = "gene_signatures",
    colNameOpt = "rname"
  )

  # summarize gene signatures by geometric mean (recommendation by
  # S.Kleinstein and D.Chawla from Yale based on the following paper:
  # https://www.sciencedirect.com/science/article/pii/S1074761315004550)
  geneSigList <- lapply(geneSignatures$updated_symbols, function(x) {
    symbols <- strsplit(x, ";")[[1]]
    selectRows <- which(rownames(em) %in% symbols)
    subEm <- em[selectRows, ] # some symbols may not be found!
    if (!is.null(dim(subEm))) {
      gm_mean <- apply(subEm, 2, function(p) {
        # this should be 2^(sum(p) / length(p))
        exp(sum(p) / length(p))
      })
      return(gm_mean)
    } else {
      return(subEm)
    }
  })

  geneSigEm <- data.frame(do.call(rbind, geneSigList), stringsAsFactors = FALSE)
  rownames(geneSigEm) <- geneSignatures$uid
  geneSigEmRmNA <- geneSigEm[!(is.na(geneSigEm[, 1])), ] # rm signatures that could not be evaluated as no corresponding gene symbols were found

  geneSigEset <- Biobase::ExpressionSet(
    assayData = as.matrix(geneSigEm),
    phenoData = Biobase::AnnotatedDataFrame(Biobase::pData(eset))
  )

  saveRDS(geneSigEset, "geneSigEset.rds")

  # log-fc of geometric mean on a per sample basis
  geneSigSummary <- createSummaryData(geneSigEset, logData = FALSE)
  geneSigSummary$feature <- "gene signature"
  saveRDS(geneSigSummary, "geByTimepoint_geneSig.rds")

  # combine summaries ---
  res <- rbind(geneSummary, btmSummary, geneSigSummary)
  res[is.infinite(mean_fold_change), mean_fold_change := NA]
  res$id <- seq_len(nrow(res))
  saveRDS(res, "gene_expression.rds")

  log_message("Done!")
  res
}

# utils.R
#' Convert ImmuneSpace conditon-studied to a curated version
#'
#' @param pd phenotypic meta-data data.table with condtion from ImmuneSpace
#' @export
#'
addMappedCondition <- function(pd) {
  pd$newCondition <- sapply(pd$condition, function(x) {
    if (grepl("healthy|normal|naive", x, ignore.case = TRUE)) {
      return("Healthy")
    } else if (grepl("influenza|H1N1", x, ignore.case = TRUE)) {
      return("Influenza")
    } else if (grepl("CMV", x, ignore.case = TRUE)) {
      return("CMV")
    } else if (grepl("TB|tuberculosis", x, ignore.case = TRUE)) {
      return("Tuberculosis")
    } else if (grepl("Yellow Fever", x, ignore.case = TRUE)) {
      return("Yellow_Fever")
    } else if (grepl("Mening", x, ignore.case = TRUE)) {
      return("Meningitis")
    } else if (grepl("Malaria", x, ignore.case = TRUE)) {
      return("Malaria")
    } else if (grepl("HIV", x, ignore.case = TRUE)) {
      return("HIV")
    } else if (grepl("Dengue", x, ignore.case = TRUE)) {
      return("Dengue")
    } else if (grepl("ZEBOV", x, ignore.case = TRUE)) {
      return("Ebola")
    } else if (grepl("Hepatitis", x, ignore.case = TRUE)) {
      return("Hepatitis")
    } else if (grepl("Smallpox|vaccinia", x, ignore.case = TRUE)) {
      return("Smallpox")
    } else if (grepl("JDM|Dermatomyositis", x, ignore.case = TRUE)) {
      return("Dermatomyositis")
    } else if (grepl("West Nile", x, ignore.case = TRUE)) {
      return("West_Nile")
    } else if (grepl("Zika", x, ignore.case = TRUE)) {
      return("Zika")
    } else if (grepl("Varicella", x, ignore.case = TRUE)) {
      return("Varicella_Zoster")
    } else {
      return("Unknown")
    }
  })

  return(pd)
}

#' Convert ImmuneSpace conditon-studied to a curated version
#'
#' @param pd phenotypic meta-data data.table with condtion from ImmuneSpace
#' @export
#'
mapCondition <- function(pd) {
  unmarkedInfluenzaStudies <- c(
    "301", "144", "224", "80",
    "296", "364", "368", "387"
  )
  unmarkedInfluenzaStudies <- paste0("SDY", unmarkedInfluenzaStudies)
  unmarkedHepBStudies <- c("SDY690", "SDY89", "SDY299")
  unmarkedSmallpoxStudies <- c("SDY1370")
  unmarkedPPPStudies <- c("SDY667")
  unmarkedHerpesZosterStudies <- c("SDY984")

  pd$mapped_condition <- apply(pd, 1, function(x) {
    study <- x[["study_accession"]]
    condition <- x[["condition"]]
    cohort <- x[["cohort"]]

    if (study == "SDY180") {
      if (grepl("Saline", cohort)) {
        return("Healthy")
      } else if (grepl("Pneunomax23", cohort)) {
        return("Pneumonia")
      } else {
        return("Influenza")
      }
    } else if (study %in% unmarkedInfluenzaStudies |
      grepl("influenza|H1N1", condition, ignore.case = TRUE)) {
      return("Influenza")
    } else if (study %in% unmarkedHepBStudies |
      grepl("Hepatitis", condition, ignore.case = TRUE)) {
      return("Hepatitis")
    } else if (study %in% unmarkedSmallpoxStudies |
      grepl("Smallpox|vaccinia", condition, ignore.case = TRUE)) {
      return("Smallpox")
    } else if (study %in% unmarkedPPPStudies) {
      return("Palmoplantar_Pustulosis")
    } else if (study %in% unmarkedHerpesZosterStudies) {
      return("Herpes_Zoster")
    } else if (grepl("healthy|normal|naive", condition, ignore.case = TRUE)) {
      return("Healthy")
    } else if (grepl("CMV", condition, ignore.case = TRUE)) {
      return("CMV")
    } else if (grepl("TB|tuberculosis", condition, ignore.case = TRUE)) {
      return("Tuberculosis")
    } else if (grepl("Yellow Fever", condition, ignore.case = TRUE)) {
      return("Yellow_Fever")
    } else if (grepl("Mening", condition, ignore.case = TRUE)) {
      return("Meningitis")
    } else if (grepl("Malaria", condition, ignore.case = TRUE)) {
      return("Malaria")
    } else if (grepl("HIV", condition, ignore.case = TRUE)) {
      return("HIV")
    } else if (grepl("Dengue", condition, ignore.case = TRUE)) {
      return("Dengue")
    } else if (grepl("ZEBOV", condition, ignore.case = TRUE)) {
      return("Ebola")
    } else if (grepl("JDM|Dermatomyositis", condition, ignore.case = TRUE)) {
      return("Dermatomyositis")
    } else if (grepl("West Nile", condition, ignore.case = TRUE)) {
      return("West_Nile")
    } else if (grepl("Zika", condition, ignore.case = TRUE)) {
      return("Zika")
    } else if (grepl("Varicella", condition, ignore.case = TRUE)) {
      return("Varicella_Zoster")
    } else {
      return("Unknown")
    }
  })

  return(pd)
}

#' Extract study id from participant id and add as new field
#'
#' @param pd phenotypic meta-data data.table with participant_id from ImmuneSpace
#' @export
#'
addStudy <- function(pd) {
  pd$study <- paste0("SDY", sapply(strsplit(pd$participant_id, "\\."), "[[", 2))
  return(pd)
}

#' Convert 'Hours' or 'Months' based study times to 'Days'
#'
#' @param dt meta-data data.table
#' @import data.table
#' @export
#'
correctTimeUnits <- function(dt) {
  dt <- apply(dt, 1, function(row) {
    if (row[["study_time_collected_unit"]] == "Hours") {
      row[["study_time_collected"]] <- as.numeric(row[["study_time_collected"]]) / 24
      row[["study_time_collected_unit"]] <- "Days"
    } else if (row[["study_time_collected_unit"]] == "Months") {
      row[["study_time_collected"]] <- as.numeric(row[["study_time_collected"]]) * 30
      row[["study_time_collected_unit"]] <- "Days"
    }
    return(row)
  })
  dt <- data.table::data.table(t(dt))
  dt$study_time_collected <- gsub(" ", "", dt$study_time_collected)
  dt$study_time_collected <- gsub("\\.00", "", dt$study_time_collected)
  dt$study_time_collected <- as.numeric(dt$study_time_collected)
  return(dt)
}

#' Create dt with subject * analyte matched columns for baseline and max(post) values
#'
#' @param dt meta-data data.table
#' @param analyteCol analyte column name
#' @param valueCol value column name
#' @export
#'
matchBaselineAndPostTimepoints <- function(dt, analyteCol, valueCol) {
  dt <- data.talbe::data.table(dt)
  data.table::setnames(dt, c(analyteCol, valueCol), c("analyte", "value"))
  keepCols <- c("ParticipantId", "analyte", "value")
  groupingCols <- c("ParticipantId", "analyte")

  baseline <- dt[dt$study_time_collected == 0, ..keepCols]
  data.table::setnames(baseline, "value", "baseline_value")

  post <- dt[dt$study_time_collected > 0, ..keepCols]
  rowsToUse <- post[, .I[which.max(value)], by = groupingCols]
  post <- post[rowsToUse$V1]
  data.table::setnames(post, "value", "post_value")

  final <- merge(baseline, post, by = groupingCols)
  final <- final[!duplicated(final)]
}


#' Add fold change assuming no log transform upstream
#'
#' @param dt meta-data data.table
#' @export
#'
addFoldChange <- function(dt) {
  dt$baseline_value <- as.numeric(dt$baseline_value)
  dt$post_value <- as.numeric(dt$post_value)
  dt$fc <- (dt$post_value - dt$baseline_value) / dt$baseline_value
  dt$fc <- ifelse(is.infinite(dt$fc), dt$post_value, dt$fc)
  return(dt)
}

#' Create a summary data object for easy use with app
#'
#' @param eset expressionSet object with cohort column and gene or btm expression
#' @param logData boolean is the data in log2 format
#' @export
#'
createSummaryData <- function(eset, logData) {
  eset$study_cohort <- paste(eset$study_accession, eset$cohort, sep = "_")

  # Create data frame with summary statistics for each cohort*timepoint
  res <- lapply(unique(eset$study_cohort), function(study_cohort) {
    tmp <- eset[, eset$study_cohort == study_cohort]
    cell_type <- unique(tmp$cell_type)
    mapped_condition <- unique(tmp$mapped_condition)
    study <- unique(tmp$study_accession)
    cohort <- unique(tmp$cohort)

    timepoints <- table(tmp$study_time_collected)
    timepoints <- as.numeric(names(timepoints)[timepoints > 2])
    baseline <- tmp[, tmp$study_time_collected == 0]
    subres <- lapply(timepoints, function(timepoint) {
      log_message(paste(study_cohort, timepoint))
      if (timepoint == 0) {
        df <- data.frame(
          cohort = cohort,
          cell_type = cell_type,
          study = study,
          mapped_condition = mapped_condition,
          timepoint = timepoint,
          analyte = rownames(baseline),
          mean_fold_change = 0,
          sd_fold_change = 0
        )
      } else {
        curr <- tmp[, tmp$study_time_collected == timepoint]
        smplCount <- table(curr$participant_id)
        dupes <- names(smplCount)[smplCount > 1]
        if (length(dupes) > 0) {
          bsToRemove <- sapply(dupes, function(pid) {
            dupEntries <- curr[, curr$participant_id == pid]
            maxDay <- max(dupEntries$study_time_collected)
            toKeep <- dupEntries$biosample_accession[dupEntries$study_time_collected == maxDay][[1]]
            currRm <- dupEntries$biosample_accession[dupEntries$biosample_accession != toKeep]
          })
          bsToRemove <- unlist(unname(bsToRemove))
          curr <- curr[, !curr$biosample_accession %in% bsToRemove]
        }
        shared <- intersect(baseline$participant_id, curr$participant_id)
        if (length(shared) < 3) {
          return()
        }
        curr <- curr[, curr$participant_id %in% shared]
        base <- baseline[, baseline$participant_id %in% shared]
        curr <- curr[, order(match(curr$participant_id, base$participant_id))]
        currEm <- Biobase::exprs(curr)
        baseEm <- Biobase::exprs(base)
        currEm <- currEm[order(match(rownames(currEm), rownames(baseEm))), ]
        if (!all.equal(dim(currEm), dim(baseEm))) {
          stop()
        }

        if (logData) {
          fc <- currEm - baseEm
        } else {
          delta <- currEm - baseEm
          fc <- delta / baseEm
        }

        mean_fc <- rowMeans(fc)
        sd_fc <- apply(fc, 1, sd)
        df <- data.frame(
          cohort = cohort,
          cell_type = cell_type,
          study = study,
          mapped_condition = mapped_condition,
          timepoint = timepoint,
          analyte = rownames(fc),
          mean_fold_change = mean_fc,
          sd_fold_change = sd_fc
        )
      }
      return(df)
    })
    subresDF <- do.call("rbind", subres)
  })
  allRes <- data.table::rbindlist(res)
}
