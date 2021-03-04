process_data <- function(data_name) {
  log_message(sprintf("Processing '%s'...", data_name))
  switch(
    data_name,
    "blood_transcript_modules" = process_blood_transcript_modules(),
    "gene_signatures" = process_gene_signatures(),
    "gene_expression" = process_gene_expression(),
    stop(data_name, " is not a valid data name...")
  )
}

check_data <- function(data_name, data) {
  log_message("Checking data...")

  assertthat::assert_that(nrow(data) > 0)
  assertthat::assert_that(ncol(data) > 0)

  # check for NULLs
  # is_null <- sapply(data, function(x) any(is.na(x) | x == ""))
  # if (any(is_null)) {
  #   columns <- paste0(names(is_null)[is_null], collapse = "', '")
  #   stop(sprintf("'%s' columns have null or empty values!", columns))
  # }

  # check for valid column names
  colnames_data <- sort(colnames(data))
  empty_table <- suppressWarnings(Rlabkey::labkey.selectRows(
    baseUrl = labkey.url.base,
    folderPath = labkey.url.path,
    schemaName = "analyte_explorer",
    queryName = data_name,
    maxRows = 0,
    colNameOpt = "rname"
  ))
  colnames_server <- sort(colnames(empty_table))
  assertthat::assert_that(length(colnames_data) == length(colnames_server))
  assertthat::assert_that(identical(colnames_data, colnames_server))

  # check for valid column types
  query_details <- Rlabkey::labkey.getQueryDetails(
    baseUrl = labkey.url.base,
    folderPath = labkey.url.path,
    schemaName = "analyte_explorer",
    queryName = data_name
  )
  coltypes_server <- fix_types(query_details$type)
  names(coltypes_server) <- query_details$fieldName
  coltypes_server <- coltypes_server[colnames_data]
  coltypes_data <- sapply(data, mode)
  coltypes_data <- coltypes_data[colnames_data]
  assertthat::assert_that(identical(coltypes_data, coltypes_server))

  invisible(TRUE)
}


update_table <- function(data_name, data) {
  schema_name <- "analyte_explorer"

  log_message("Backing up...")
  backup <- suppressWarnings(Rlabkey::labkey.selectRows(
    baseUrl = labkey.url.base,
    folderPath = labkey.url.path,
    schemaName = schema_name,
    queryName = data_name,
    colNameOpt = "rname"
  ))

  if (nrow(backup) > 0) {
    log_message("Truncating table...")
    Rlabkey::labkey.truncateTable(
      baseUrl = labkey.url.base,
      folderPath = labkey.url.path,
      schemaName = schema_name,
      queryName = data_name
    )
  }

  res <- tryCatch(
    {
      log_message(sprintf("Importing %s rows of data...", nrow(data)))
      labkey.importData(
        baseUrl = labkey.url.base,
        folderPath = labkey.url.path,
        schemaName = schema_name,
        queryName = data_name,
        toImport = data
      )
    },
    error = function(e) {
      log_message("Failed to import data!")
      if (nrow(backup) > 0) {
        log_message("Restoring table...")
        labkey.importData(
          baseUrl = labkey.url.base,
          folderPath = labkey.url.path,
          schemaName = schema_name,
          queryName = data_name,
          toImport = backup
        )
      }
      stop(e)
    },
    finally = {
      log_message("Import completed...")
    }
  )

  res
}

log_message <- function(msg) {
  message(sprintf("[%s] %s", Sys.time(), msg))
}

labkey.importData <- function(baseUrl, folderPath, schemaName, queryName, toImport) {
  temp_file <- tempfile(fileext = ".csv")
  data.table::fwrite(toImport, temp_file)

  url <- paste(baseUrl, "query", folderPath, "import.api", sep = "")
  config <- Rlabkey:::labkey.getRequestOptions(method = "POST")
  body <- list(
    schemaName = schemaName,
    queryName = queryName,
    file = httr::upload_file(temp_file)
  )
  header <- httr::add_headers(`Content-Type` = "multipart/form-data")

  response <- httr::POST(url = url, config = config, body = body, header)
  parsed <- Rlabkey:::processResponse(response, haltOnError = TRUE)
 
  parsed
}

fix_types <- function(types) {
  sapply(types, function(x) {
    switch(
      x,
      "Integer" = "numeric",
      "Number (Double)" = "numeric",
      "Text (String)" = "character",
      stop(sprintf("%s is an unknown type!", x))
    )
  }, USE.NAMES = FALSE)
}
