# Allow users to filter options based on disease_studied, timepoint, tissue_type, regulation_type
# Then show a string with the full pathogen name and the publication title in the dropdown.
# In info section of the app, show publication title and abstract as well as link to pubmed ID.
# https://github.com/floratos-lab/hipc-dashboard-pipeline/tree/master/reformatted_data
process_gene_signatures <- function() {
  # read-in
  file <- system.file("extdata/hipc_2020-09-28_gene_expression_v31-recreated_template.RDS", package = "UpdateAnno", mustWork = TRUE)
  ge <- readRDS(file)
  ge <- ge[7:nrow(ge), 2:ncol(ge)]
  keepCols <- c(
    "target_pathogen",
    "response_component_original",
    "tissue_type",
    "response_behavior",
    "time_point",
    "time_point_units",
    "publication_reference",
    "subgroup",
    "comparison",
    "cohort"
  )
  ge <- ge[, colnames(ge) %in% keepCols]
  ge <- ge[!duplicated(ge), ] # rm one row of technical replicate - pub27974398

  # update-cols
  # Map pathogen to the disease types given
  ge$disease_studied <- sapply(ge$target_pathogen, function(x) {
    if (grepl("influenza", x, ignore.case = TRUE)) {
      return("Influenza")
    } else if (grepl("meningitidis", x, ignore.case = TRUE)) {
      return("Meningitidis")
    } else if (grepl("yellow fever", x, ignore.case = TRUE)) {
      return("Yellow Fever")
    } else if (grepl("ebola", x, ignore.case = TRUE)) {
      return("Ebola")
    } else if (grepl("immunodeficiency virus", x, ignore.case = TRUE)) {
      return("HIV")
    } else if (grepl("falciparum", x, ignore.case = TRUE)) {
      return("Malaria")
    } else if (grepl("mycobacterium", x, ignore.case = TRUE)) {
      return("Tuberculosis")
    } else if (grepl("vaccinia|variola", x, ignore.case = TRUE)) {
      return("Smallpox")
    } else if (grepl("rubella", x, ignore.case = TRUE)) {
      return("Rubella")
    } else if (grepl("pneumoniae", x, ignore.case = TRUE)) {
      return("Pneumonia")
    } else if (grepl("measles", x, ignore.case = TRUE)) {
      return("Measles")
    } else if (grepl("hepatitis B", x, ignore.case = TRUE)) {
      return("Hepatitis B")
    } else if (grepl("leishmania", x, ignore.case = TRUE)) {
      return("Leishmaniasis")
    } else if (grepl("papillomavirus", x, ignore.case = TRUE)) {
      return("HPV")
    } else if (grepl("tularensis", x, ignore.case = TRUE)) {
      return("Tularemia")
    } else if (grepl("equine", x, ignore.case = TRUE)) {
      return("VEEV")
    } else if (grepl("alphaherpesvirus", x, ignore.case = TRUE)) {
      return("Herpes")
    } else {
      return(NA)
    }
  })


  # Ensure that gene symbols are current HUGO
  ge$updated_symbols <- sapply(ge$response_component_original, function(x) {
    current <- strsplit(x, "; ")[[1]]
    symbols <- UpdateAnno::mapAlias2Symbol(current)
    symbols <- symbols[!is.na(symbols)]
    if (length(symbols) == 0) {
      return(NA)
    } else {
      return(paste(symbols, collapse = ";"))
    }
  })

  ge <- ge[!is.na(ge$updated_symbols), ]

  # Standardize timepoints to Days and Years
  ge$updated_timepoint_units <- sapply(ge$time_point_units, function(x) {
    if (grepl("day|hour", x, ignore.case = TRUE)) {
      return("Days")
    } else if (x == "" | x == "N/A") {
      return("NA")
    } else if (x %in% c("Months", "Weeks")) {
      return("Days")
    } else {
      return(x)
    }
  })

  ge$updated_timepoint <- apply(ge, 1, function(x) {
    origUnit <- x[["time_point_units"]]
    origValue <- x[["time_point"]]

    if (origValue %in% c("N/A", "")) {
      return(NA)
    } else if (grepl("\\d{1,2} (to|or) \\d{1,2}", origValue)) {
      vals <- strsplit(origValue, " (to|or) ")[[1]]
      return(round(median(as.numeric(vals))))
    } else if (origUnit == "Weeks") {
      return(7 * as.numeric(origValue))
    } else if (origUnit == "Months") {
      return(30 * as.numeric(origValue))
    } else if (origUnit == "Hours") {
      return(round(as.numeric(origValue) / 24))
    } else {
      return(as.numeric(origValue))
    }
  })

  # Make response behavior more informative
  ge$updated_response_behavior <- sapply(ge$response_behavior, function(x) {
    if (x %in% c("positively", "negatively")) {
      return(paste0(x, "-correlated"))
    } else if (x %in% c("up", "down")) {
      return(paste0(x, "-regulated"))
    } else {
      return(x)
    }
  })

  # Pull Pubmed article title using ID
  base <- "https://pubmed.ncbi.nlm.nih.gov/"
  ge$pubmed_titles <- sapply(ge$publication_reference, function(id) {
    url <- paste0(base, id, "/")
    page <- xml2::read_html(url)
    nodes <- rvest::html_nodes(page, css = ".heading-title")
    title <- stringr::str_trim(rvest::html_text(nodes[[1]]))
  })

  ge$timepoint_concat <- paste(ge$updated_timepoint, ge$updated_timepoint_units, sep = "-")

  # save
  keepCols <- c(
    "pubmed_titles",
    "publication_reference",
    "updated_response_behavior",
    "timepoint_concat",
    "updated_symbols",
    "disease_studied",
    "comparison",
    "subgroup",
    "cohort"
  )
  ge <- ge[, colnames(ge) %in% keepCols]

  ge$uid <- apply(ge, 1, function(x) {
    uid <- paste(x[["publication_reference"]],
      x[["cohort"]],
      x[["subgroup"]],
      x[["timepoint_concat"]],
      x[["updated_response_behavior"]],
      x[["comparison"]],
      sep = "_"
    )
    uid <- gsub(" ", "-", uid)
  })

  # Some uid are not unique? Perhaps multiple signatures at same timepoint
  # Make unique with additional numerical value.
  # Also update the pubmed titles to clarify difference when user is performing selection
  uids <- unique(ge$uid)
  for (id in uids) {
    rows <- which(ge$uid == id)
    if (length(rows) > 1) {
      ver <- seq(1:length(rows))
    } else {
      ver <- 1
    }
    ge$uid[rows] <- paste(ge$uid[rows], ver, sep = "_")
    ge$pubmed_titles[rows] <- paste0(ge$pubmed_titles[rows], " (", ver, ")")
  }

  if (any(duplicated(ge$uid))) {
    stop("Still duplicates!")
  }

  ge$id <- seq_len(nrow(ge))

  ge
}
