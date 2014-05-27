```{r dev, echo = FALSE, eval = FALSE}
#labkey.url.base <- "posey.fhcrc.org"
#labkey.url.path <- "Studies/SDY269"
#labkey.file.root <- "~/Downloads/"
#param <- list(timepoint = 7, GEA_acc = c("GEA2", "GEA4"), FC_thresh = 1, FDR_thresh = 0.1, dichotomize = FALSE, dichValue = 4)
```

```{r knitr-opts, echo = FALSE, message = FALSE, cache = FALSE}
library(knitr)
opts_chunk$set(cache=FALSE, echo=FALSE, message=FALSE, warning=FALSE,
               fig.width=8, fig.height=4, dpi=100, fig.align="center",
               cache.path=paste(labkey.file.root, "cache/ImmuneResponsePredictor/", sep="/"))
```

```{r libraries, echo = FALSE, message = FALSE, cache = FALSE}
library(data.table)
library(Rlabkey)
library(ggplot2)
library(glmnet)
library(pheatmap)
```

```{r plot-styles, cache = TRUE}
IS_theme <- theme_bw(base_size=14)
palette <- rev(brewer.pal(name="PiYG", n=11))
```

```{r envir-var, cache=FALSE}
param <- list(timepoint   = as.numeric( labkey.url.params$timePoint ),
              GEA_acc     = RJSONIO::fromJSON( labkey.url.params$analysisAccession ),
              dichValue   = as.numeric( labkey.url.params$dichotomizeValue ),
              FDR_thresh  = as.numeric( labkey.url.params$fdrThreshold ),
              FC_thresh   = as.numeric( labkey.url.params$fcThreshold ),
              dichotomize = as.logical( labkey.url.params$dichotomize ),
              EM_pred     = RJSONIO::fromJSON( labkey.url.params$emTesting ),
              )
```

```{r param, cache=TRUE, cache.extra=digest::digest(param), echo=TRUE}
```

```{r functions, echo = FALSE, cache = TRUE}
get_GEAR <- function(GEA_acc, FC_thresh, FDR_thresh){
  GEAR_filter <- makeFilter(c("analysis_accession", "IN", paste(GEA_acc, collapse=";")),
                            c("adj_p_val", "LESS_THAN", FDR_thresh),
                            c("log_fc", "NOT_BETWEEN", paste(-FC_thresh, FC_thresh, sep=",")))
  GEAR <-data.table(labkey.selectRows(baseUrl = labkey.url.base, folderPath = labkey.url.path, schemaName = "lists", queryName = "gene_expression_analysis_results", colNameOpt="rname", colFilter=GEAR_filter))
  if(nrow(GEAR)==0){
    opts_chunk$set(cache=FALSE, echo=FALSE, eval=FALSE)
    stop("There are 0 probes selected. Try lowering the FDR threshold or the absolute log-FoldChange threshold.")
  }
  GEA_filter <- makeFilter(c("analysis_accession", "IN", paste(unique(GEAR$analysis_accession), collapse = ";")))
  GEA <- data.table(labkey.selectRows(baseUrl = labkey.url.base, folderPath = labkey.url.path, schemaName = "lists", queryName = "gene_expression_analysis", colNameOpt = "rname", colFilter = GEA_filter))
  GEAR <- merge(GEAR, GEA, by = "analysis_accession")
  return(GEAR)
}

get_pdata <- function(GEAR, timepoint){
  timepoints <- c(0, timepoint)
  pdata_filter <- makeFilter(c("expression_matrix", "IN", paste(unique(GEAR$expression_matrix), collapse=";")))
  pdata <- unique(data.table(labkey.selectRows(labkey.url.base, labkey.url.path, 
		  "assay.ExpressionMatrix.matrix", "InputSamples", "gene_expression_matrices", 
		  colFilter = pdata_filter, colNameOpt = "rname")))
  setnames(pdata, colnames(pdata), gsub("^biosample_", "", colnames(pdata)))
  pdata <- pdata[, keep:=(sum(study_time_collected %in% timepoints) == length(timepoints)), by="subject_accession"]
  pdata <- pdata[keep == TRUE]
  pdata <- pdata[study_time_collected %in% timepoints]
  pdata <- pdata[order(subject_accession)]
  return(pdata)
}

get_DEG <- function(GEAR, pdata){
  em2fas <- unique( pdata[, list(run_dataoutputs_name, run_featureset)])
  ## TODO: Problem if two probes with same name map different genes?
  FAS_filter <- makeFilter(c("FeatureAnnotationSetId", "IN", paste(em2fas$run_featureset, collapse = ";")))
  FAS <- data.table(labkey.selectRows(baseUrl = labkey.url.base, folderPath = labkey.url.path, schemaName="Microarray", queryName="FeatureAnnotation", colFilter = FAS_filter, colNameOpt = "rname", colSelect=c("featureid", "genesymbol")))
  setnames(FAS, c("featureid"), "feature_id")
  GEAR <- data.table(merge(GEAR, FAS, by = "feature_id"))
  DEG <- unique(GEAR$genesymbol) #rm duplicates and probes with no matches
  DEG <- DEG[!is.na(DEG)]
  return(DEG)
}

get_EM <- function(pdata, DEG){
  files <- file.path(labkey.file.root, "analysis/exprs_matrices", paste0(unique(pdata$run_dataoutputs_name), ".summary"))
  headers <- lapply(files, scan, what="character", nlines=1, sep="\t", quiet=TRUE)
  EMs <- lapply(files, fread)
  common_genes <- Reduce(intersect, lapply(EMs, "[",, "gene_symbol", with=FALSE))
  DEG <- DEG[DEG %in% common_genes]
  EMs <- lapply(EMs, function(x){x[na.omit(match(DEG, x$gene_symbol))]})
  EMs <- lapply(EMs, function(x){t(x[ ,gene_symbol := NULL])})
  EM <- do.call("rbind", EMs)
  colnames(EM) <- DEG
  return(EM)
}

get_FC <- function(EM, pdata, timepoint){ ## TODO: maybe I should include it in get_EM
  FC <- EM[pdata[study_time_collected == timepoint, biosample_accession], ] - EM[pdata[study_time_collected == 0, biosample_accession],]
  rownames(FC) <- pdata[match(rownames(FC), biosample_accession), subject_accession]
  return(FC)
}

get_HAI <- function(pdata, dichotomize, di_value){
  HAI_filter <- makeFilter(c("subject_accession", "IN", paste(pdata$subject_accession, collapse=";")))
  HAI <- data.table(labkey.selectRows(baseUrl=labkey.url.base, schemaName="study", folderPath=labkey.url.path, queryName ="hai", viewName = "", colNameOpt="rname", colFilter=HAI_filter))
  HAI <- HAI[subject_accession %in% pdata$subject_accession]
  HAI <- HAI[,list(arm_accession, study_time_collected=study_time_collected, response=value_reported/value_reported[study_time_collected==0]),by="virus_strain,subject_accession"]
  HAI <- HAI[study_time_collected==28]
  HAI <- HAI[,list(response=log2(max(response))),by="subject_accession,arm_accession"]
  if(dichotomize){
    HAI <- HAI[,response:=ifelse(response>=log2(di_value), FALSE,  TRUE)]
  }
  cohorts <- unique(pdata[, list(arm_name, subject_accession)])
  HAI <- merge(HAI, cohorts, by = "subject_accession")
  HAI <- HAI[order(subject_accession)]
  return(HAI)
}

select_features <- function(FC, response, dichotomize){
  # Elastic net
  if(dichotomize){
    fit <- glmnet(FC, as.factor(response), alpha = 0.5, family = "binomial") 
  } else{
    fit <- glmnet(FC, response, alpha = 0.5)
  }
  cv_fit <- cv.glmnet(FC, response)
  coef <- predict(fit, s=cv_fit$lambda.min, type="coefficients")
  # Selecting features
  selected_features <- names(which(abs(coef[,1]) > 0))
  selected_features <- grep("Intercept", selected_features, invert = TRUE, value = TRUE)
  if(length(selected_features) < 2){
    opts_chunk$set(eval=FALSE, cache=FALSE)
    stop("No features were selected as predictive. You may try to change the filtering criteria.")
  }
  # Need more obs than features
  nFeatures <- length(selected_features)
  nObs <- length(response)
  if(nObs <= nFeatures){
    cat("You selected as many or more features (", nFeatures, ") than observations (", nObs, ").\nThe", nObs-2, "most significant features will be kept.\n")
    selected_features <- names(sort(coef[selected_features,])[1:(nObs-2)])
  }
  return(selected_features)
}

# Heatmap #FC_selected, HAI, palette, dichotomize
draw_heatmap <- function(FC_selected, HAI, dichotomize){
  annotation <- HAI[, list(subject_accession, arm_name, response)]
  annotation <- data.frame(annotation[order(response, arm_name, subject_accession)])
  rownames(annotation) <- annotation$subject_accession
  annotation$subject_accession <- NULL
  if(dichotomize){
    annotation$response <- as.numeric(annotation$response)
    anno_col <- list(response=c(`FALSE`="white", `TRUE`="black"))
  } else{
    anno_col <- list(response=grey(10:0/10))
  }
  mat <- t(FC_selected)
  mat <- mat[, match(rownames(annotation), colnames(mat))]
  max_FC <- max(abs(mat))
  pheatmap(mat, dendrogram = "none", cluster_cols = FALSE, cluster_rows = TRUE,
           breaks = seq(-max_FC, max_FC, length.out = length(palette) +1),
           color = mypalette, show_colnames = FALSE, scale = "none", 
           cluster_distance="correlation", cluster_method = "ward",
           annotation = annotation, annotation_colors = anno_col)
}
```


```{r main, echo = TRUE, cache = FALSE}
GEAR <- get_GEAR(param$GEA_acc, param$FC_thresh, param$FDR_thresh)
pdata <- get_pdata(GEAR, param$timepoint)
DEG <- get_DEG(GEAR, pdata)
EM <- get_EM(pdata, DEG)
FC <- get_FC(EM, pdata, param$timepoint)
HAI <- get_HAI(pdata, param$dichotomize, param$dichValue)
response <- HAI$response
selected_features <- select_features(FC, response, param$dichotomize)
FC_selected <- FC[,selected_features]

# lasso #IN FC_selected, dichotomize, selected_features #OUT predictor_table
FC_selected <- data.frame(FC_selected, check.names = FALSE)
colnames(FC_selected) <- gsub("@", "", gsub(";", "_OR_", gsub("-", "_", colnames(FC_selected)))) # TODO: No need for @ / _OR_
form <- as.formula(paste0("outcome~`", paste(colnames(FC_selected), collapse="`+`"), sep="`"))
FC_selected$outcome <- response
if(param$dichotomize){
     relasso <- glm(form, FC_selected, family="binomial")
} else{
     relasso <- lm(form, FC_selected)
}

FC_selected$outcome <- NULL
sum_relasso <- summary(relasso)
sum_relasso_coef <- sum_relasso$coefficients
pred_cIdx <- grep("value|Pr", colnames(sum_relasso_coef))
predictor_table <- sum_relasso_coef[,pred_cIdx][-1,]
colnames(predictor_table) <- c("statistic", "p-value")
predictor_table <- data.table(cbind(selected_features, predictor_table))
predictor_table <- predictor_table[, c("statistic", "p-value") := lapply(.SD, function(X){ as.numeric(levels(X)[X])}), .SDcols = c("statistic", "p-value")]
predictor_table <- predictor_table[, gene_symbol := lapply(strsplit(as.character(selected_features), split=";"), function(X){ paste0('<a href="http://immunet-dev.princeton.edu/predictions/gene/?network=hipc_global&gene=', X, '" target="_blank">', X, '</a>', collapse=";")})]


if(length(param$EM_pred) > 0){
  # Get pdata for test
  # get_FC(EM, DEG)
  # Get HAI for pred
}

# Prediction
if(length(param$EM_pred) == 0){
     data <- data.frame(observed = response, fitted=relasso$fitted.values)
   ggplot(data, aes(x=observed, y=fitted)) + geom_point() + geom_smooth(method="lm") + IS_theme
} else{
  # predict for test
  # create data with training + testing cohorts
  # gpplot
}

# get annotations for training: subject + arm_name + hai
# kable
```

## Heatmap of the selected features
```{r heatmap, echo = FALSE}
draw_heatmap(FC_selected, HAI, palette)
```
