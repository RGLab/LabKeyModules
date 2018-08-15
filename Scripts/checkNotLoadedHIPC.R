#!/usr/bin/env Rscript


# Check Args -------------------------------------------------------------------
args = commandArgs(trailingOnly = TRUE)
machine <- "www"
if (length(args) > 0) {
  if (args[1] == "test") {
    machine <- args[1]
  }
} else {
  if (Sys.info()["nodename"] == "immunetestrserve") {
    machine <- "test"
  }
}


# Checks -----------------------------------------------------------------------
stopifnot(file.exists("~/.netrc"))
stopifnot(Sys.getenv("ImmPortUsername") != "")
stopifnot(Sys.getenv("ImmPortPassword") != "")
stopifnot(file.exists("~/httr/googledrive.rds"))


# Load Packages ----------------------------------------------------------------
suppressPackageStartupMessages(library(Rlabkey))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(tidyr))
suppressPackageStartupMessages(library(ImmPortR))
suppressPackageStartupMessages(library(googledrive))


# Set Global Variables ---------------------------------------------------------
baseUrl <- paste0("https://", machine, ".immunespace.org")
labkey.setDefaults(baseUrl = baseUrl)
colNameOpt <- "fieldname"
folderPath <- "/Studies"
schemaName <- "immport"


# Retrieve Data ----------------------------------------------------------------
message("Retreiving Data from ", baseUrl, "...")

program <- labkey.executeSql(
  folderPath = folderPath,
  schemaName = schemaName,
  colNameOpt = colNameOpt,
  sql = "
  SELECT P.name as program_name, study.study_accession
    FROM
      immport.study
      LEFT OUTER JOIN immport.contract_grant_2_study CG2S ON study.study_accession = CG2S.study_accession
      LEFT OUTER JOIN immport.contract_grant CG ON CG2S.contract_grant_id = CG.contract_grant_id
      LEFT OUTER JOIN immport.program P on CG.program_id = P.program_id'
  "
)

study <- labkey.selectRows(
  folderPath = folderPath,
  schemaName = schemaName,
  queryName = "study",
  colNameOpt = colNameOpt
)

studyFolders <- labkey.getFolders(
  folderPath = folderPath,
  includeEffectivePermissions = FALSE
)

experiment <- labkey.selectRows(
  folderPath = folderPath,
  schemaName = schemaName,
  queryName = "experiment",
  colNameOpt = colNameOpt
)

subject <- labkey.selectRows(
  folderPath = folderPath,
  schemaName = schemaName,
  queryName = "subject",
  colNameOpt = colNameOpt
)

workspace <- labkey.selectRows(
  folderPath = folderPath,
  schemaName = schemaName,
  queryName = "workspace",
  colNameOpt = colNameOpt
)

subject_2_study <- labkey.selectRows(
  folderPath = folderPath,
  schemaName = schemaName,
  queryName = "subject_2_study",
  colNameOpt = colNameOpt
)


# Munge Data -------------------------------------------------------------------
loadedStudies <- studyFolders$name[grepl("^SDY\\d+", studyFolders$name)]
subject <- left_join(subject, subject_2_study, by = "subject_accession")
speciesByStudy <- subject %>%
  group_by(study_accession) %>%
  distinct(species) %>%
  summarise(n_species = length(species), species = paste0(species, collapse = ", ")) %>%
  arrange(desc(n_species))
experimentByStudy <- experiment %>%
  group_by(study_accession) %>%
  distinct(measurement_technique) %>%
  summarise(n_experiment = length(measurement_technique), experiment = paste0(measurement_technique, collapse = ", "))
DR <- paste0("DR", max(as.numeric(gsub("DR", "", unique(study$latest_data_release_version)))))


# HIPC Studies Not Loaded in ImmuneSpace ---------------------------------------
HIPCStudies <- filter(program, grepl("HIPC", program_name))
if (nrow(HIPCStudies) == 0) {
  message("There is no ")
  quit()
}

NotLoaded <- HIPCStudies %>%
  filter(!study_accession %in% loadedStudies) %>%
  arrange(as.integer(gsub("SDY", "", study_accession))) %>%
  left_join(study, by = "study_accession") %>%
  left_join(speciesByStudy, by = "study_accession") %>%
  left_join(experimentByStudy, by = "study_accession") %>%
  left_join(transmute(workspace, workspace_name = name, workspace_id), by = "workspace_id") %>%
  select(
    study_accession,
    initial_data_release_version,
    latest_data_release_version,
    brief_title,
    actual_enrollment,
    condition_studied,
    type,
    clinical_trial,
    species,
    experiment,
    program_name,
    sponsoring_organization,
    workspace_name
  ) %>%
  mutate(
    raw_files = purrr::map_chr(study_accession, function(x) paste0(unique(query_filePath(x)$fileDetail), collapse = ", ")),
    immport_link = paste0("http://www.immport.org/immport-open/public/study/study/displayStudyDetail/", study_accession),
    aspera_link = paste0("https://aspera-immport.niaid.nih.gov:9443/browser?path=%2F", study_accession, "%2FResultFiles")
  )


# Print Not Loaded HIPC Studies and save it as csv -----------------------------
message("Not Loaded HIPC Studies:")
cat(NotLoaded$study_accession, sep = "\n")

temp <- tempfile(fileext = ".csv")
write.csv(NotLoaded, file = temp, row.names = FALSE)


# Save to Google Drive ---------------------------------------------------------
message("Authenticating Google Drive Token...")
drive_auth("~/httr/googledrive.rds", verbose = FALSE)

message("Uploading to Google Drive...")
gd <- suppressWarnings(drive_upload(
  media = temp,
  path = "/Not Loaded HIPC Studies",
  name = paste0(machine, "_", Sys.Date(), "_", DR),
  type = "spreadsheet",
  verbose = FALSE
))
cat("Report Link:", gd$drive_resource[[1]]$webViewLink, sep = "\n")

drive_share(gd, "reader", "anyone", verbose = FALSE)
