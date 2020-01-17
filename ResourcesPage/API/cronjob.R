library(Rlabkey)
library(data.table)
library(readr)
library(stringr)
library(rvest)

######################################
###        General Setup           ###
######################################

# Set dates for subsetting.
format <- "%Y-%m-%d"
from <- as.POSIXct("2016-01-01", format = format)
to <- as.POSIXct(Sys.Date(), format = format)

# Set labkey.url.base given the hostname
labkey.url.base <- ifelse(Sys.info()["nodename"] == "ImmuneTestRserve2",
                          "https://test.immunespace.org",
                          "https://www.immunespace.org")

cleanUp <- function(data, filename){
    # Output
    subdir <- "/share/files/Studies/R_API_resources/"
    saveRDS(data, file = paste0(subdir, Sys.Date(), "_", filename, ".rds"))

    # Delete previous file
    prevFile <- paste0(subdir, Sys.Date() - 1, "_", filename, ".rds")
    if (file.exists(prevFile)) {
        file.remove(prevFile)
    }
}

######################################
###           Tomcat Logs          ###
######################################

# Create lists of admins and others to exclude from counts
admins <- labkey.selectRows(baseUrl = labkey.url.base,
                            folderPath = "/home",
                            schemaName = "core",
                            queryName = "SiteUsers",
                            viewName = "",
                            colFilter = makeFilter(c("Groups/Group$SName",
                                                     "CONTAINS_ONE_OF",
                                                     "Developers;Administrators")),
                            containerFilter = NULL)
extra_emails <- paste("rglab.org",
                      "immunespace.org",
                      "labkey.com",
                      "gilguday@comcast.net",
                      "lwolfe@fredhutch.org",
                      "matthew@bellew.net",
                      "gfinak@scharp.org",
                      "reader@bellew.net",
                      "patrick.dunn@nih.gov",
                      "cnathe@labkey.org",
                      "hrodgers@fredhutch.org",
                      "wjiang2@fhcrc.org",
                      "hmiller@fredhutch.org",
                      sep = ";")
extras <- labkey.selectRows(baseUrl = labkey.url.base,
                            folderPath = "/home",
                            schemaName = "core",
                            queryName = "SiteUsers",
                            viewName = "",
                            colFilter = makeFilter(c("Email",
                                                     "CONTAINS_ONE_OF",
                                                     extra_emails)),
                            containerFilter = NULL)

# Admin emails no longer in the DB
oldAdminEmails <- c("rsautera@fhcrc.org",
                    "renan.sauteraud@gmail.com",
                    "ldashevs@fhcrc.org",
                    "ldashevs@scharp.org")

# Vectors of people to exclude from counts
exclusionEmails <- unique(c(admins$Email, extras$Email, oldAdminEmails))

# ---- get logs ----
# To determine how ImmuneSpaceR has been used, we parse the server logs. Since the server logs
# all types of GET / POSTS and other requests, there is a fair amount of filtering that must
# be done to find the requests that help us understand usage.
#
# These logs are created by Tomcat (server software) and written out to `/labkey/apps/tomcat/logs/`
# on the webserve machine. Since they cannot be accessed by the Rserve, we need to copy them to
# `/share` by setting up a cron job on `wsP/T` as `immunespace`.
#
# crontab -e
# Add this line
# 00 0-23/6 * * * rsync -a -v /labkey/apps/tomcat/logs/localhost_access_log.* /share/tomcat-logs/
# This will sync logs to `/share/tomcat-logs/` every six hour.
read_log2 <- function(date, exclusionEmails) {

    if (Sys.info()["nodename"] == "immunetestrserve" && date < "2017-09-22") {
        file_name <- paste0("/share/tomcat-logs/localhost_access_log..", date, ".txt")
        file_name_m <- paste0("/share/tomcat-logs/modified/localhost_access_log..", date, ".txt")
    } else {
        file_name <- paste0("/share/tomcat-logs/localhost_access_log.", date, ".txt")
        file_name_m <- paste0("/share/tomcat-logs/modified/localhost_access_log.", date, ".txt")
    }

    if (file.exists(file_name)) {
        # 1. Try reading unmodified logs
        tried <- try(
            readr::read_log(file = file_name,
                            col_types = readr::cols(.default = readr::col_character()))
        )

        # 2. If original errors out due to NULL values, create modified without NULL and
        # try reading that. Note that if tried does not have a "try-error" a list is returned
        # and to avoid warnings the `any` fn is used.
        if (any(class(tried) == "try-error")) {
            if (!file.exists(file_name_m)) {
                original <- file(file_name, "r")
                modified <- file(file_name_m, "w")
                lines <- readLines(original, skipNul = TRUE)
                writeLines(lines, modified)
                close(original)
                close(modified)
            }
            tried <- try(
                readr::read_log(file = file_name_m,
                                col_types = cols(.default = readr::col_character()))
            )
        }

        # 3. Parse
        if (!any(class(tried) == "try-error")) {
            if (nrow(tried) > 0) {

                # delete if the log is still being modfied
                if (date == as.POSIXct(Sys.Date())) {
                    if (file.exists(file_name_m)) {
                        file.remove(file_name_m)
                    }
                }

                tried <- data.table(tried)
                tried <- tried[ !X12 %in% exclusionEmails & X6 == 200,
                                c("date", "study", "schema", "query") :=
                                    list(date,
                                         stringr::str_extract(X5, "SDY\\d+|IS\\d+|Lyoplate"),
                                         grepl("schemaName=study?", X5),
                                         stringr::str_extract(X5, "(?<=queryName=)\\w+"))]
            } else {
                NULL
            }
        } else {
            NULL
        }
    } else {
        NULL
    }
}

logs_list <- lapply(seq(from, to, by = "1 day"), read_log2, exclusionEmails = exclusionEmails)
logs_dt <- data.table::rbindlist(logs_list)

# Create date from X4 rather than log file name b/c log file name leaves many NAs
# and visualizations require a date
tmp <- logs_dt$X4
tmp <- regmatches(tmp, regexpr("\\d{2}/\\w{3}/\\d{4}", tmp))
logs_dt$date2 <- as.POSIXct(tmp, format="%d/%b/%Y", tz="UTC")
logs_dt <- logs_dt[ !X12 %in% exclusionEmails ]

cleanUp(logs_dt, "logs")

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


cleanUp(allIds, "pubmedInfo")

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

cleanUp(all, "sdyMetaData")
