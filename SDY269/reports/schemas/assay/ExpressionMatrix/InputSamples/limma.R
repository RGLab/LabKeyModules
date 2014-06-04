labkey.url.base <- "posey.fhcrc.org"
labkey.url.path <- "Studies/SDY269"

library(Rlabkey)
library(data.table)
library(limma)
library(Biobase)

# Get the EMs
GEM <- unique(labkey.selectRows(labkey.url.base, labkey.url.path, "assay.ExpressionMatrix.matrix",
			        "InputSamples", "gene_expression_matrices", colNameOpt = "rname"))
colnames(GEM) <- gsub("^biosample_", "", colnames(GEM))
EMs <- unique(GEM$run_dataoutputs_name)
GEAs <- unique(GEM[GEM$study_time_collected != 0, c("arm_name", "study_time_collected")])

nEMs <- length(EMs)
GEA_count <- 1
GEA_list <- tt_list <- vector("list", nrow(GEAs))
for(i in 1:nEMs){
  ssGEM <- GEM[ GEM$run_dataoutputs_name == EMs[i], c("biosample_accession", "subject_accession", "run_dataoutputs_name", "arm_name", "study_time_collected")]
  rownames(ssGEM) <- ssGEM$biosample_accession
  ssGEAs <- unique(ssGEM[ssGEM$study_time_collected != 0, c("arm_name", "study_time_collected")])
  file <- file.path(labkey.file.root, "analysis/exprs_matrices", EMs[i])
  header <- scan(file, what="character", nlines=1, sep = "\t")
  if(header[1] == " ") header[1] <- "feature_id"
  mat <- fread(file, header = TRUE)
  setnames(mat, colnames(mat), header)
  assay <- as.matrix(mat[, grep("^BS", header, value = TRUE), with = FALSE])
  rownames(assay) <- mat[, feature_id]
  pdata <- ssGEM[na.omit(match(colnames(assay), ssGEM$biosample_accession)),]
  pdata$study_time_collected <- as.character(pdata$study_time_collected)

  eset <- ExpressionSet(assayData = assay, phenoData = as(pdata, "AnnotatedDataFrame"))
  FDRthresh <- 0.05
  mm <- model.matrix(~subject_accession + study_time_collected, eset)
  fit <- lmFit(eset, mm) 
  ebay <- eBayes(fit)
  for(timepoint in ssGEAs$study_time_collected){
    description <- paste("Differential expression in ", unique(ssGEAs$arm_name), "using limma, Day", timepoint, "vs. Day 0")
    tt <- topTable(ebay, coef = paste0("study_time_collected", timepoint), number = Inf)
    analysis_accession <- paste0("GEA", GEA_count)
    tt$analysis_accession <- analysis_accession 
    tt$feature_id <- rownames(tt)
    tt_list[[GEA_count]] <- tt
    GEA_list[[GEA_count]] <- data.frame(analysis_accession = analysis_accession, expression_matrix = EMs[i], timepoint = timepoint, description = description)
    GEA_count <- GEA_count + 1
  }
}
newGEA <- rbindlist(GEA_list)
newGEAR <- rbindlist(tt_list)

# Write to tables  
existGEA <- labkey.selectRows(labkey.url.base, labkey.url.path, "lists", "gene_expression_analysis", colNameOpt = "rname")
newGEA <- newGEA[!newGEA$analysis_accession %in% existGEA$analysis_accession,]
if(nrow(newGEA) > 0){
    res <- labkey.importRows(labkey.url.base, labkey.url.path, "lists", "gene_expression_analysis", toImport = newGEA)
}
print(newGEA)

newGEAR <- newGEAR[!analysis_accession %in% existGEA$analysis_accession]
setnames(newGEAR, c("adj.P.Val", "AveExpr", "logFC", "P.Value", "t"), c("adj_p_val", "ave_expr", "log_fc", "p_value", "statistic"))
if(nrow(newGEAR) > 0){
    res <- labkey.importRows(labkey.url.base, labkey.url.path, "lists", "gene_expression_analysis_results", toImport = newGEAR)
}
