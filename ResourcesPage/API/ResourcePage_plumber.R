# REST API for ResourcesPage data processing
library(data.table)
library(rjson)

#* Most commonly downloaded (via ImmuneSpaceR) and viewed (via UI) Studies
#* @param from The start date
#* @param to The end date
#* @get /log_data
function(from = NULL, to = NULL){

  format <- "%Y-%m-%d"

  if(is.null(from)){ from <- "2016-01-01" }
  from <- as.POSIXct(as.Date(from), format = format)

  if(is.null(to)){ to <- Sys.Date() }
  to <- as.POSIXct(as.Date(to), format = format)

  fl <- grep("logs", list.files(path = "/app/"), value = TRUE)
  logs_dt <- readRDS(paste0("/app/", fl))

  # ImmuneSpaceR connections to a study
  ISR <- logs_dt[ grepl("ImmuneSpaceR", X11) & !is.na(X12) ]
  ISR[, study := ifelse(is.na(study), "All", study) ] # Fix study for project level
  ISR_inits <- ISR[ , list(cnt = .N), by = .(date2, X12, study) ]
  ISR_inits <- ISR_inits[ date2 >= from & date2 < to ]
  ISR_study <- ISR_inits[ , list(ISR_connections = .N), by = study ]
  ISR_study <- ISR_study[ grepl("SDY", study) ]

  # UI pageviews of a study
  searchString <- "/project/(Studies/SDY\\d+|Studies|HIPC/IS\\d+|HIPC/Lyoplate)/begin.view\\?? HTTP/1.1"
  logs_dt <- logs_dt[, folder := stringr::str_extract(X5, searchString)]
  UI <- logs_dt[ !is.na(folder) ]
  UI[ , study := ifelse(is.na(study), "Data Finder", study) ]
  UI_views <- UI[, list(cnt = .N), by = .(date2, X12, study) ]
  UI_views <- UI_views[ date2 >= from & date2 < to ]
  UI_study <- UI_views[ , list(UI_pageviews = .N), by = study ]
  UI_study <- UI_study[ grepl("SDY", study) ]

  # Merge together
  studyStats <- merge(ISR_study, UI_study, by = "study")

  # Return as json object
  return(toJSON(studyStats))
}

#* Studies with most citations (for use also to show most recently published papers)
#* @get /pubmed_data
function(){
  fl <- grep("pubmedInfo", list.files(path = "/app/"), value = TRUE)
  allIds <- readRDS(paste0("/app/", fl))

  # Get counts and order by count
  countByStudy <- allIds[ , list(Citations = .N), by = .(study)]
  setorder(countByStudy, -Citations)

  # Return as json object
  return(toJSON(countByStudy))

}

#* Get study clusters using UMAP
#* @get /sdy_metadata
function(){
  fl <- grep("sdyMetaData", list.files(path = "/app/"), value = TRUE)
  sdyMetaData <- readRDS(paste0("/app/", fl))

  # Generate UMAP results
  set.seed(8)
  umap <- uwot::umap(sdyMetaData, n_neighbors = 20, n_components = 2)
  df <- data.frame(x = umap[,1],
                   y = umap[,2],
                   stringsAsFactors = FALSE)

  # Return UMAP input and output for plotting
  res <- toJSON(list(sdyMetaData, df))
}
