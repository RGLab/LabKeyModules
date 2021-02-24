process_data <- function(data_name) {
    log_message("processing data...")
    # TODO
}

update_table <- function(data_name, data) {
    schema_name <- "analyte_explorer"

    log_message("backing up...")
    backup <- labkey.selectRows(
        baseUrl = labkey.url.base,
        folderPath = labkey.url.path,
        schemaName = schema_name,
        queryName = data_name,
        colNameOpt = "rname"
    )

    log_message("truncating table...")
    if (nrow(backup) > 0) {
        labkey.truncateTable(
            baseUrl = labkey.url.base,
            folderPath = labkey.url.path,
            schemaName = schema_name,
            queryName = data_name
        )
    }

    log_message("importing data...")
    res <- try({
        labkey.importData(
            baseUrl = labkey.url.base,
            folderPath = labkey.url.path,
            schemaName = schema_name,
            queryName = data_name,
            toImport = data
        )
    })

    if (is(res, "try-error")) {
        log_message("failed to import data!")
        if (nrow(backup) > 0) {
            log_message("restoring table...")
            labkey.importRows(
                baseUrl = labkey.url.base,
                folderPath = labkey.url.path,
                schemaName = schema_name,
                queryName = data_name,
                toImport = backup
            )
        }
        stop(res)
    }

    log_message("done!")
    res
}

log_message <- function(msg) {
    message(sprintf("[%s] %s", Sys.time(), msg))
}

labkey.importData <- function(baseUrl, folderPath, schemaName, queryName, toImport) {
    temp_file <- tempfile()
    print(url)
    data.table::fwrite(toImport, temp_file)

    url <- paste(baseUrl, "query", folderPath, "import.api", sep = "")
    print(url)
    config <- Rlabkey:::labkey.getRequestOptions(method = "POST")
    body <- list(
        schemaName = schemaName,
        queryName = queryName,
        file = httr::upload_file(temp_file)
    )
    header <- httr::add_headers(`Content-Type` = "multipart/form-data")

    response <- httr::POST(url = url, config = config, body = body, header)
    print(response)
    Rlabkey:::processResponse(response, haltOnError = TRUE)
}