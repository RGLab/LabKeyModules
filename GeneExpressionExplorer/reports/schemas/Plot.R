#  Copyright 2014 Fred Hutchinson Cancer Research Center
#
#  Licensed under the Apache License, Version 2.0 (the 'License');
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an 'AS IS' BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.


suppressMessages( library( Cairo ) );
suppressMessages( library( RJSONIO ) );
library(ggplot2)
library(data.table)
library(Rlabkey)
library(reshape2)

merge_cohorts <- function(x, y){
  return(merge(x, y, by="gene_symbol"))
}

get_cohort_summary_expression <- function(pd){
  umat <- unique(pd[, list(EM, run_featureset)])
  files <- file.path(labkey.file.root, "analysis/exprs_matrices/", paste0(umat$EM, ".summary"))
  EM <- vector('list', nrow(umat))
  for(i in 1:nrow(umat)){
    em <- fread(files[i])
    EM[[i]] <- em
  }
  EM <- Reduce(f=merge_cohorts,EM)
  return(EM)
}

add_r2 <- function(data){
  dt <- data.table(data)
  dt <- dt[, r2 :=  paste("R^2 ==", round(summary(lm(response ~ logFC))[['r.squared']], 3)), by = "arm_name,gene"]
  return(data.frame(dt))
}



imageWidth  <- as.numeric(labkey.url.params$imageWidth);
imageHeight <- as.numeric(labkey.url.params$imageHeight);
CairoPNG( filename='${imgout:Plot.png}', width = imageWidth, height = imageHeight );

arrayCohorts        <- RJSONIO::fromJSON( labkey.url.params$cohorts );
response            <- as.character( labkey.url.params$response );
timePoint           <- as.numeric( labkey.url.params$timePoint );
timePointDisplay    <- labkey.url.params$timePointDisplay;
arrayGenes          <- RJSONIO::fromJSON( labkey.url.params$genes );
textSize            <- as.numeric( labkey.url.params$textSize );
facet               <- tolower(labkey.url.params$facet)
shape               <- tolower(labkey.url.params$shape)
color               <- tolower(labkey.url.params$color)
size                <- tolower(labkey.url.params$size)
alpha               <- tolower(labkey.url.params$alpha)

stopcheck <- function(data){
    stop(paste0(paste(capture.output(str(data)), collapse="\n"), "\nl.u.b: ",labkey.url.base, "\nl.u.p: ",labkey.url.path))
}

#stopcheck(labkey.url.params)
if(exists("loadedCohorts") && all(loadedCohorts == arrayCohorts)){
  #No need to read again
} else{
  cohort_filter <- makeFilter(c("biosample_arm_name", "IN", paste(arrayCohorts, collapse=";")))
  gem <- data.table(labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName="assay.ExpressionMatrix.matrix", queryName = "InputSamples", viewName = "gene_expression_matrices", colFilter = cohort_filter, colNameOpt = "rname"))
  setnames(gem, colnames(gem), gsub("^biosample_", "", colnames(gem)))
  gem <- unique(gem[arm_name %in% arrayCohorts])

  if(length(grep("\"", gem$run_dataoutputs_name)) == nrow(gem)){
    EMs <- unlist(lapply(gem$run_dataoutputs_name, function(x){ grep(".tsv", eval(parse(text = x)), value=TRUE)} ))
    gem[, EM := EMs]
  } else{
    gem[, EM := gem$run_dataoutputs_name]
 }

  demographics <- data.table(labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName="study", 
                                      queryName="demographics", colNameOpt="rname"))
  demographics <- demographics[, list(subject_accession, age_reported, gender, race)] 
  setnames(demographics, "age_reported", "age")
  gem <- merge(gem, demographics, by="subject_accession")
  # Subjects with all timepoints
  utp <- unique(gem$study_time_collected)
  gem <- gem[, keep:=(sum(study_time_collected %in% utp) == length(utp)), by="subject_accession"]
  gem <- gem[keep==TRUE]
  pd <- gem[order(subject_accession, study_time_collected)]
  # Get HAI
  hai_filter <- makeFilter(c("subject_accession", "IN", paste(pd$subject_accession, collapse=";")))
  hai <- data.table(labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName="study", 
                                      queryName="hai", colFilter=hai_filter, colNameOpt="rname"))
  hai <- hai[, list(subject_accession, study_time_collected, response=value_reported/value_reported[study_time_collected==0]), by="virus_strain,subject_accession"]
  hai <- hai[study_time_collected==28]
  hai <- hai[, list(response=log2(max(response))), by="subject_accession"]
  EM <- get_cohort_summary_expression(pd)
  EM <- EM[, c("gene_symbol", colnames(EM)[ colnames(EM) %in% pd$biosample_accession]), with=FALSE]
}

# Subsets
ssES <- EM[gene_symbol %in% arrayGenes]
if(timePoint == 0){
  FC <- ssES[, pd[study_time_collected == 0, biosample_accession], with=FALSE]
  xlab <- "log expression"
} else{
  FC <- ssES[, pd[study_time_collected == timePoint, biosample_accession], with=FALSE] -
        ssES[, pd[study_time_collected == 0, biosample_accession], with=FALSE]
  xlab <- paste("log Fold-Change with respect to baseline")
}
FC <- FC[, gene:=ssES$gene_symbol]
FC <- melt(FC, id="gene")
FC <- data.table(FC)
setnames(FC, c("variable", "value"), c("biosample_accession", "logFC"))
data <- merge(FC, pd, by="biosample_accession")[, list(biosample_accession, gene, subject_accession, logFC, arm_name, age, race, gender)]
data <- merge(data, hai, by=c("subject_accession"))

# Plot
if(color=="") color <- NULL
if(shape=="") shape <- NULL
if(size=="") size <- NULL
if(alpha=="") alpha <- NULL

data <- add_r2(data)
p <- ggplot(data=data, aes(x=logFC, y=response)) + geom_point(aes_string(size=size, color=color, alpha=alpha, shape=shape)) + geom_smooth(method="lm") + ylab(response) + xlab(xlab) + geom_text(aes(x=min(data$logFC), y=max(data$response), label = r2), hjust = 0, vjust = 1, data = data, parse = TRUE) + theme(text=element_text(size=textSize)) 
if(facet == "grid"){
  p <- p + facet_grid(aes(arm_name, gene), scales="free")
} else{
  p <- p + facet_wrap(~arm_name + gene, scales="free")
}
print(p)

loadedCohorts <- arrayCohorts
dev.off();

Sys.sleep(3);

write( RJSONIO::toJSON( x=arrayCohorts, asIs = T ), '${jsonout:outArray}' );

