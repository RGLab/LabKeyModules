library(HIPCMatrix)
con <- HMX$new()

if (con$study == "Studies") {

  ge_studies <- unique(con$get_de_compatible_runs()$study_accession)

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
        sdy$upload_de_analysis_results()
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
    cat("Differential Expression successfully run on all compatible studies!")
  } else {
    cat(
      "Some studies failed to update: \n",
      paste0(sapply(ge_studies[!sapply(success, isTRUE)], function(sdy) {
        paste0(sdy, ": ", success[[sdy]])
      }), collapse = "\n")
    )
  }
} else {
  con$upload_de_analysis_results()
}
