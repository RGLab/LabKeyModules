# cohort + timepoint
# GEA + EM filename

get full EM
get lFC
subselect samples with D0 and TP
get fill HAI
subselect samples in both

# EM is a vector of EM files as found in InputSamples.gene_expression.matrices
read_em <- function(EM, timepoint){
  files <- file.path(labkey.file.root, "analysis/exprs_matrices", paste0(EM, ".summary"))
  headers <- lapply(files, scan, what="character", nlines=1, sep="\t", quiet=TRUE)
  EMs <- lapply(files, fread)
  for(i in 1:length(headers)){
    setnames(EMs[[i]], colnames(EMs[[i]]), headers[[i]])
  }
    



