# Data originally from supplementary files for
# Li S, Rouphael N, Duraisingham S, et al. Molecular signatures of antibody
# responses derived from a systems biology study of five human vaccines.
# Nat Immunol. 2014;15(2):195-204. doi:10.1038/ni.2789
# https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3946932/bin/NIHMS540680-supplement-26.zip
process_blood_transcript_modules <- function() {
  file <- system.file("extdata/btm_annotation_table.csv", package = "UpdateAnno", mustWork = TRUE)
  dt <- data.table::fread(file)
  btms <- UpdateAnno::emory_blood_transcript_modules

  dt[, current_genes := sapply(`Composite name`, function(x) {
    return(paste(btms[[x]], collapse = ", "))
  })]
  keepCols <- c(
    "Composite name",
    "current_genes",
    "Top matched Gene Ontology terms (number of matched genes)",
    "Module size",
    "Module category"
  )
  dt <- dt[, ..keepCols]
  newNames <- c(
    "module_name",
    "genes",
    "matched_gene_ontology_terms",
    "number_of_genes",
    "module_category"
  )
  data.table::setnames(dt, colnames(dt), newNames)

  dt$id <- seq_len(nrow(dt))

  dt
}
