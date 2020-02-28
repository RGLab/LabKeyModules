library(Rlabkey)
library(data.table)
library(stringr)
library(rvest)

######################################
###        General Setup           ###
######################################

# # Set dates for subsetting.
# format <- "%Y-%m-%d"
# from <- as.POSIXct("2016-01-01", format = format)
# to <- as.POSIXct(Sys.Date(), format = format)

# Set labkey.url.base given the hostname
labkey.url.base <- ifelse(Sys.info()["nodename"] == "ImmuneTestRserve2",
                          "https://test.immunespace.org",
                          "https://www.immunespace.org")

subdir <- "/share/files/Studies/R_API_resources/"

saveOutput <- function(data, filename){
    saveRDS(data, file = paste0(subdir, Sys.Date(), "_", filename, ".rds"))
}

cleanUp <- function(filename){
    # Delete previous file
    prevFile <- paste0(subdir, Sys.Date() - 1, "_", filename, ".rds")
    if (file.exists(prevFile)) {
        file.remove(prevFile)
    }
}

######################################
###           Tomcat Logs          ###
######################################

# Read in file shared with monitorIS
logs_dt <- readRDS(paste0(subdir, "/", Sys.Date(), "_logs.rds"))

# ImmuneSpaceR connections to a study (without date filtering)
ISR <- logs_dt[ grepl("ImmuneSpaceR", X11) & !is.na(X12) ]
ISR[, study := ifelse(is.na(study), "All", study) ] # Fix study for project level
ISR_inits <- ISR[ , list(cnt = .N), by = .(date2, X12, study) ]
ISR_study <- ISR_inits[ , list(ISR_connections = .N), by = .(study, date2) ]
ISR_study <- ISR_study[ grepl("SDY", study) ]

# UI pageviews of a study
searchString <- "/project/(Studies/SDY\\d+|Studies|HIPC/IS\\d+|HIPC/Lyoplate)/begin.view\\?? HTTP/1.1"
logs_dt <- logs_dt[, folder := stringr::str_extract(X5, searchString)]
UI <- logs_dt[ !is.na(folder) ]
UI[ , study := ifelse(is.na(study), "Data Finder", study) ]
UI_views <- UI[, list(cnt = .N), by = .(date2, X12, study) ]
UI_study <- UI_views[ , list(UI_pageviews = .N), by = .(study,date2) ]
UI_study <- UI_study[ grepl("SDY", study) ]

# Merge together and prep
studyStats <- merge(ISR_study, UI_study, by = c("study","date2"), all=TRUE)
studyStats[is.na(studyStats)] <- 0
colnames(studyStats)[ grep("date2", colnames(studyStats))] <- "Date"
studyStats[, studyId := as.numeric(gsub("SDY", "", study))]
studyStats[, total_views := ISR_connections + UI_pageviews ]
setcolorder(studyStats, c("Date", "study", "studyId",
                          "ISR_connections", "UI_pageviews", "total_views"))
setorder(studyStats, "Date")

filename <- "parsedLogs"
saveOutput(studyStats, filename)
cleanUp(filename)

######################################
###        PubMed Citations        ###
######################################

df <- labkey.selectRows(baseUrl = labkey.url.base,
                        folderPath = "/Studies/",
                        schemaName = "immport",
                        queryName = "study_pubmed",
                        colNameOpt = "fieldname")

# Subset down to those in immunespace only
sdysInIS <- labkey.selectRows(baseUrl = labkey.url.base,
                              folderPath = "/home/",
                              schemaName = "lists",
                              queryName = "Studies",
                              colNameOpt = "fieldname")
df <- df[ df$study_accession %in% sdysInIS$name, ]

# For each pubmedid
base <- "http://www.ncbi.nlm.nih.gov/pubmed?linkname=pubmed_pubmed_citedin&from_uid="
results <- lapply(df$pubmed_id, function(id){
    page <- read_html(paste0(base, id))
    nodes <- html_nodes(page, css = '.rslt')
    res <- lapply(nodes, html_text)
    parsed <- lapply(res, function(x){
        spl <- strsplit(x, "\\.")[[1]]
        if(length(spl) > 0){
            title <- spl[[1]]
            authors <- spl[[2]]
            pubmedid <- spl[[length(spl)]]
            pubmedid <- regmatches(pubmedid, regexpr("\\d{8}", pubmedid))
        }else{
            title <- authors <- pubmedid <- NA
        }
        return(c(title, authors, pubmedid, id))
    })
    parsed <- data.frame(do.call(rbind, parsed))
})
allIds <- data.table(do.call(rbind, results))
cnames <- c("citedby_title",
            "citedby_authors",
            "citedby_id",
            "original_id")
setnames(allIds, colnames(allIds), cnames)

# Add study
allIds$study <- df$study_accession[ match(allIds$original_id, df$pubmed_id) ]
allIds$studyNum <- as.numeric(gsub("SDY","", allIds$study))

# Add date published (as YYYY-MM for sorting)
df$datePublished <- paste(df$year, match(df$month, month.abb), sep = "-")
allIds$datePublished <- df$datePublished[ match(allIds$study, df$study_accession) ]

# title - TODO v2 (journal impact score using scopus API)
allIds$original_title <- df$title[ match(allIds$original_id, df$pubmed_id) ]

filename <- "pubmedInfo"
saveOutput(allIds, filename)
cleanUp(filename)

######################################
###          Study Metadata        ###
######################################

# Ensure only valid studies in ImmuneSpace
valid <- labkey.selectRows(baseUrl = labkey.url.base,
                           folderPath = "/home/",
                           schemaName = "study",
                           queryName = "WPV_studies_with_status",
                           colNameOpt = "fieldname")

# Study Investigator
pi <- labkey.selectRows(baseUrl = labkey.url.base,
                        folderPath = "/Studies/",
                        schemaName = "immport",
                        queryName = "study_personnel",
                        colNameOpt = "fieldname",
                        colSelect = c("role_in_study", "study_accession", "person_accession"))
pi <- pi[ pi$role_in_study == "Principal Investigator", ]
pi <- pi[ pi$study_accession %in% valid$Name, ]
coauths <- pi$study_accession[ duplicated(pi$study_accession)]
for(i in coauths){
    rows <- grep(i, pi$study_accession)
    pi <- pi[ -rows[[1]], ]
}
colnames(pi)[ grepl("study_accession", colnames(pi))] <- "study"

# Study Overview
study <- labkey.selectRows(baseUrl = labkey.url.base,
                           folderPath = "/Studies/",
                           schemaName = "immport",
                           queryName = "study",
                           colNameOpt = "fieldname",
                           colSelect = c("study_accession",
                                         "actual_enrollment",
                                         "clinical_trial",
                                         "condition_studied",
                                         "maximum_age",
                                         "minimum_age",
                                         "sponsoring_organization",
                                         "initial_data_release_date"))
study <- study[ study$study_accession %in% valid$Name, ]
study$minimum_age[ is.na(study$minimum_age)] <- 0
study$maximum_age[ is.na(study$maximum_age)] <- 100
colnames(study)[ grepl("study_accession", colnames(study))] <- "study"

# Assay * timepoint
at <- labkey.selectRows(baseUrl = labkey.url.base,
                        folderPath = "/Studies/",
                        schemaName = "study",
                        queryName = "DimRedux_assay_data_computed",
                        colNameOpt = "fieldname")
at$study <- gsub("SUB\\d{5,6}\\.", "SDY", at$ParticipantId)
at$Timepoint <- gsub(" ", "_", at$Timepoint)
at$name_timepoint <- paste(at$Name, at$Timepoint, sep = "_")
at <- data.table(at)
at <- at[!duplicated(at[ , c("study", "name_timepoint")])]
at$count <- 1
at <- dcast(at, study ~ name_timepoint, value.var = "count")
at[is.na(at)] <- 0
missingSdys <- valid$Name[ !valid$Name %in% at$study]
ms <- data.frame(matrix(ncol = length(colnames(at)),
                        nrow = length(missingSdys),
                        data = 0))
colnames(ms) <- colnames(at)
ms$study <- missingSdys
atm <- rbind(at, ms)

# Merge
all <- Reduce( function(x,y){ merge(x, y, by = "study") }, list(pi, study, atm))
rownames(all) <- all$study
all <- all[ , -grep("study", colnames(all))]

filename <- "sdyMetaData"
saveOutput(all, filename)
cleanUp(filename)
