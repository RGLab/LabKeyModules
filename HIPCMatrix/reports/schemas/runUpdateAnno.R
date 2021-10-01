library(HIPCMatrix)

con <- HMX$new()

if (grepl("^IS", con$study)) {
  stop("Do not update ImmuneSignatures Annotation!")
}

# con$updateFAS()

if (con$study == "Studies") {
  ge_studies <- unique(con$listGEMatrices()$folder)

  success <- lapply(ge_studies, function(study) {
    res <- try(
      {
        # Need to spell out full labkey.url.path for
        # individual studies when labkey.url.path in
        # global env.
        sdy <- HMX$new(
          study = paste0("/Studies/", study, "/"),
          verbose = TRUE,
        )
        sdy$updateEMs()
        sdy$uploadGEAnalysisResults()
      },
      silent = TRUE
    )
    if ("try-error" %in% class(res)) {
      cat(study, " failed: ", res)
      return(res)
    }
    TRUE
  })
  names(success) <- ge_studies

  if (all(sapply(success, isTRUE))) {
    cat("All matrices successfully updated!")
  } else {
    cat(
      "Some studies failed to update: \n",
      paste0(sapply(ge_studies[!sapply(success, isTRUE)], function(sdy) {
        paste0(sdy, ": ", success[[sdy]])
      }), collapse = "\n")
    )
  }
} else {
  con$updateEMs()
  con$uploadGEAnalysisResults()
}
