library(Rlabkey)
library(data.table)
library(limma)

# Get the EMs
GEM <- unique(labkey.selectRows(labkey.url.base, labkey.url.path, "assay.ExpressionMatrix.matrix",
			        "InputSamples", "gene_expression_matrices", colNameOpt = "rname"))
colnames(GEM) <- gsub("^biosample_", "", colnames(GEM))
EMs <- unique(GEM$run_dataoutputs_name)

for(i in nEMs){


# LAIV 2008
GEM_LAIV <- GEM[ grep("LAIV", GEM$run_dataoutputs_name),]
rownames(GEM_LAIV) <- GEM_LAIV$biosample_accession
file <- file.path(labkey.file.root, "analysis/exprs_matrices", unique(GEM_LAIV$run_dataoutputs_name))
header <- scan(file, what="character", nlines=1, sep = "\t")
mat <- fread(file)
setnames(mat, colnames(mat), c("feature_id", header))
assay <- as.matrix(mat[, header, with = FALSE])
rownames(assay) <- mat[, feature_id]
pdata <- GEM_LAIV[na.omit(match(colnames(assay), GEM_LAIV$biosample_accession)),]
pdata$study_time_collected <- as.character(pdata$study_time_collected)
## eset creation
eset <- ExpressionSet(assayData = assay, phenoData = as(pdata, "AnnotatedDataFrame"))
## limma
FDRthresh <- 0.05
mm <- model.matrix(~subject_accession + study_time_collected, eset)
fit <- lmFit(eset, mm) 
ebay <- eBayes(fit)
LAIV_tt3 <- topTable(ebay, coef="study_time_collected3", number=Inf)
LAIV_tt3$analysis_accession <- "GEA1"
LAIV_tt3$feature_id <- rownames(LAIV_tt3)
LAIV_tt7 <- topTable(ebay, coef="study_time_collected7", number=Inf)
LAIV_tt7$analysis_accession <- "GEA2"
LAIV_tt7$feature_id <- rownames(LAIV_tt7)


# TIV 2008
GEM_TIV <- GEM[ grep("TIV", GEM$run_dataoutputs_name),]
rownames(GEM_TIV) <- GEM_TIV$biosample_accession
file <- file.path(labkey.file.root, "analysis/exprs_matrices", unique(GEM_TIV$run_dataoutputs_name))
header <- scan(file, what="character", nlines=1, sep = "\t")
mat <- fread(file)
setnames(mat, colnames(mat), c("feature_id", header))
assay <- as.matrix(mat[, header, with = FALSE])
rownames(assay) <- mat[, feature_id]
pdata <- GEM_TIV[na.omit(match(colnames(assay), GEM_TIV$biosample_accession)),]
pdata$study_time_collected <- as.character(pdata$study_time_collected)
## eset creation
eset <- ExpressionSet(assayData = assay, phenoData = as(pdata, "AnnotatedDataFrame"))
## limma
FDRthresh <- 0.05
mm <- model.matrix(~subject_accession + study_time_collected, eset)
fit <- lmFit(eset, mm) 
ebay <- eBayes(fit)
TIV_tt3 <- topTable(ebay, coef="study_time_collected3", number=Inf)
TIV_tt3$feature_id <- rownames(TIV_tt3)
TIV_tt3$analysis_accession <- "GEA3"
TIV_tt7 <- topTable(ebay, coef="study_time_collected7", number=Inf)
TIV_tt7$analysis_accession <- "GEA4"
TIV_tt7$feature_id <- rownames(TIV_tt7)

# lists.gene_expression_analysis
analysis_accession <- paste0("GEA", 1:4)
expression_matrix <- c(rep(unique(GEM_LAIV$run_dataoutputs_name), 2), rep(unique(GEM_TIV$run_dataoutputs_name), 2))
timepoint <- c(3,7,3,7)
description <- paste("Differential expression in cohort", c("LAIV", "LAIV", "TIV", "TIV"), "using limma, Day", timepoint, "vs. Day 0")
newGEA <- data.frame(analysis_accession, expression_matrix, timepoint, description)
	
GEA <- labkey.selectRows(labkey.url.base, labkey.url.path, "lists",
			 "gene_expression_analysis", colNameOpt = "rname")
newGEA <- newGEA[!newGEA$analysis_accession %in% GEA$analysis_accession,]
if(nrow(newGEA) > 0){
  res <- labkey.importRows(labkey.url.base, labkey.url.path, "lists", "gene_expression_analysis", toImport = newGEA)
}


# lists.gene_expression_analysis_results
GEAR <- rbindlist(list(LAIV_tt3, LAIV_tt7, TIV_tt3, TIV_tt7))
GEAR <- GEAR[!analysis_accession %in% GEA$analysis_accession]
setnames(GEAR, c("adj.P.Val", "AveExpr", "logFC", "P.Value", "t"), c("adj_p_val", "ave_expr", "log_fc", "p_value", "statistic"))
if(nrow(GEAR) > 0){
  res <- labkey.importRows(labkey.url.base, labkey.url.path, "lists", "gene_expression_analysis_results", toImport = GEAR)
}
