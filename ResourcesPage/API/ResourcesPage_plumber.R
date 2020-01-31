# ---- REST API for ResourcesPage data processing ----
# ResourcesPage/API/cronjob.R should do major pre-processing.
# This script does any parameterized processing work and
# serves the endpoints via the R utility Plumber.

#############################################
###              LIBRARIES                ###
#############################################

library(data.table)
library(rjson)

#############################################
###                HELPERS                ###
#############################################

loadLocalFile <- function(fileName){
    # pull most recent file in case any old objects persist
    fl <- grep(paste0("\\d{4}-\\d{2}-\\d{2}_", fileName),
               list.files(path = "/app/"), value = TRUE)
    fl <- sort(fl, decreasing = TRUE)[[1]]
    ret <- readRDS(paste0("/app/", fl))
}


#############################################
###               ENDPOINTS               ###
#############################################

#* Most commonly downloaded (via ImmuneSpaceR) and viewed (via UI) Studies
#* @param from The start date
#* @param to The end date
#* @get /log_data
function(from = NULL, to = NULL){

  format <- "%Y-%m-%d"

  if(is.null(from)){
      from <- "2016-01-01"
  }
  from <- as.POSIXct(as.Date(from), format = format)

  if(is.null(to)){
      to <- Sys.Date()
  }
  to <- as.POSIXct(as.Date(to), format = format)

  parsedLogs <- loadLocalFile("parsedLogs")

  parsedLogs <- parsedLogs[ Date >= from & Date < to ]

  byStudy <- parsedLogs[ ,list(ISR = unique(sum(ISR_connections)),
                               UI = unique(sum(UI_pageviews)),
                               total = unique(sum(total_views))),
                            by = .(studyId)]
  setorder(byStudy, "studyId")
  byStudy <- lapply(split(byStudy, seq_along(byStudy[, studyId])), as.list)

  parsedLogs[ , Month := format(Date, format = "%Y-%m")]
  byMonth <- parsedLogs[ , list(ISR = unique(sum(ISR_connections)),
                                UI = unique(sum(UI_pageviews)),
                                total = unique(sum(total_views))),
                          by = .(Month) ]
  setorder(byMonth, "Month")
  byMonth <- lapply(split(byMonth, seq_along(byMonth[, Month])), as.list)

  res <- list(byStudy = byStudy, byMonth = byMonth)

  return(res)
}

#* Studies with most citations (for use also to show most recently published papers)
#* @get /pubmed_data
function(){
  allIds <- loadLocalFile("pubmedInfo")

  # Get counts and order by count
  countByPubId <- allIds[, .(Citations = .N,
                             study = unique(study),
                             datePublished = unique(datePublished),
                             title = unique(original_title),
                             studyNum = unique(studyNum)),
                           by = .(original_id)]
  setorder(countByPubId, -Citations)

  # Setup for easy use in render named list with original_id
  # as key and value {Citations: X, Study: Y, datePublished: Z}
  res <- list()
  for(i in seq(1:nrow(countByPubId))){
      tmp <- as.vector(countByPubId[i,])
      res[[i]] <- list(citations = tmp$Citations,
                       study = tmp$study,
                       datePublished = tmp$datePublished,
                       studyNum = tmp$studyNum,
                       title = tmp$title)
  }
  names(res) <- countByPubId$original_id

  # Return as json object
  return(res)

}

#* Get study clusters using UMAP
#* @get /sdy_metadata
function(){
  sdyMetaData <- loadLocalFile("sdyMetaData")

  # ---- Feature Engineering -----

  # Local Helpers
  extractIntegerFromString <- function(string){
      hasInteger <- grepl("\\d", string)
      if(hasInteger){
          int <- as.numeric(regmatches(string, regexpr("(\\d+)", string, perl = TRUE)))
          return(int)
      }else{
          return(NA)
      }
  }

  # Ensure min and max age are all ints (no strings)
  sdyMetaData$newMinAge <- suppressWarnings(as.integer(sdyMetaData$minimum_age))
  if (any(is.na(sdyMetaData$newMinAge))) {
      sdyMetaData$newMinAge[ is.na(sdyMetaData$newMinAge)] <-
          extractIntegerFromString(sdyMetaData$minimum_age[ is.na(sdyMetaData$newMinAge)])
  }

  sdyMetaData$newMaxAge <- suppressWarnings(as.integer(sdyMetaData$maximum_age))
  if (any(is.na(sdyMetaData$newMaxAge))) {
      sdyMetaData$newMaxAge[ is.na(sdyMetaData$newMaxAge)] <-
          extractIntegerFromString(sdyMetaData$maximum_age[ is.na(sdyMetaData$newMaxAge)])
  }

  sdyMetaData <- sdyMetaData[ , -(grep("(min|max)imum", colnames(sdyMetaData))) ]

  # Distill condition studied
  sdyMetaData$newCondition <- sapply(sdyMetaData$condition_studied, function(x) {
      if( grepl("healthy|normal|naive", x, ignore.case = TRUE)){
          return("Healthy")
      }else if(grepl("influenza|H1N1", x, ignore.case = TRUE)){
          return("Influenza")
      }else if(grepl("CMV", x, ignore.case = TRUE)){
          return("CMV")
      }else if(grepl("TB|tuberculosis", x, ignore.case = TRUE)){
          return("Tuberculosis")
      }else if(grepl("Yellow Fever", x, ignore.case = TRUE)){
          return("Yellow_Fever")
      }else if(grepl("Mening", x, ignore.case = TRUE)){
          return("Meningitis")
      }else if(grepl("Malaria", x, ignore.case = TRUE)){
          return("Malaria")
      }else if(grepl("HIV", x, ignore.case = TRUE)){
          return("HIV")
      }else if(grepl("Dengue", x, ignore.case = TRUE)){
          return("Dengue")
      }else if(grepl("ZEBOV", x, ignore.case = TRUE)){
          return("Ebola")
      }else if(grepl("Hepatitis", x, ignore.case = TRUE)){
          return("Hepatitis")
      }else if(grepl("Smallpox|vaccinia", x, ignore.case = TRUE)){
          return("Smallpox")
      }else if(grepl("JDM|Dermatomyositis", x, ignore.case = TRUE)){
          return("Dermatomyositis")
      }else if(grepl("West Nile", x, ignore.case = TRUE)){
          return("West_Nile")
      }else if(grepl("Zika", x, ignore.case = TRUE)){
          return("Zika")
      }else if(grepl("Varicella", x, ignore.case = TRUE)){
          return("Varicella_Zoster")
      }else{
          return("Unknown")
      }
  })

  sdyMetaData <- sdyMetaData[ , -grep("condition_studied", colnames(sdyMetaData))]

  # TODO: Turn condition studied into model matrix and merge
  tmp <- model.matrix(~condition, data.frame(study = rownames(sdyMetaData),
                                             condition = sdyMetaData$newCondition))
  tmp <- data.frame(tmp[, -1])
  colnames(tmp) <- gsub("condition", "", colnames(tmp))
  cmv <- unname(unlist(rowSums(tmp)))
  tmp$CMV <- ifelse(cmv == 0, 1, 0)
  tmp$study <- sdyMetaData$study <- rownames(sdyMetaData)
  sdyMetaData <- merge(sdyMetaData, tmp, by="study")
  sdyMetaData <- sdyMetaData[, -grep("newCondition", colnames(sdyMetaData))]

  # Factor the sponsor( 0 ... n) and clinical trial (0,1) columns

  # metric should be hamming for all binary categoricals and euclidean for min/max Age and numParticipants


  # Col - metric
  # minAge - euc
  # maxAge - euc
  # numparticipants - euc
  # hasAssay - cat
  # assay_timepoint - cat
  # sponsor - cat


  # Generate UMAP results with assay * timepoint
  set.seed(8)
  umap <- uwot::umap(sdyMetaData,
                     n_neighbors = 20,
                     n_components = 2)
  df <- data.frame(x = umap[,1],
                   y = umap[,2],
                   stringsAsFactors = FALSE)
  sdyMetaData$x <- df$x
  sdyMetaData$y <- df$y

  # Condense assay data to single binary for each assay
  assays <- c("elisa", "elispot", "fcs", "gene_expression", "hai", "mbaa", "neut_ab_titer", "pcr")
  for (assay in assays) {
      relevantCols <- grep(assay, colnames(sdyMetaData))
      sdyMetaData[assay] <- apply(sdyMetaData, 1, function(x){
          if(any(x[relevantCols] == 1)){
              return(1)
          }else{
              return(0)
          }
      })
      sdyMetaData <- sdyMetaData[, -relevantCols]
  }

  # Convert to list of lists for parsing
  res <- lapply( split(sdyMetaData, seq_along(sdyMetaData[,1])), as.list)

  return(res)
}
