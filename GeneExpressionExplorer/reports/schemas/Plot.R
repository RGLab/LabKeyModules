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

get_cohort_expression <- function(gem){
  umat <- unique(gem[, list(file_info_name, feature_mapping_file)])
  em_links <- paste(labkey.file.root, "/analysis/exprs_matrices/", umat$file_info_name, sep="/")
  f2g_links <- paste(labkey.file.root, "/analysis/features2genes/", umat$feature_mapping_file, sep="/")
  EM <- vector('list', nrow(umat))
  for(i in 1:nrow(umat)){
    header <- scan(em_links[i], what="character", nlines=1, sep="\t", quiet=TRUE)
    em <- fread(em_links[i])
    setnames(em, colnames(em), c("feature_id", header))
    f2g <- read.table(f2g_links[i], sep="\t", header=TRUE)
    em <- em[, gene_symbol:=f2g[match(em$feature_id, f2g$feature_id), "gene_symbol"]]
    em <- em[, lapply(.SD, mean), by="gene_symbol", .SDcols=2:(ncol(em)-1)]
    EM[[i]] <- em
  }
  #common_genes <- Reduce(intersect, lapply(EM, "[[", "gene_symbol"))
  EM <- Reduce(f=merge_cohorts, EM)
  return(EM)
}



imageWidth  <- as.numeric(labkey.url.params$imageWidth);
imageHeight <- as.numeric(labkey.url.params$imageHeight);
CairoPNG( filename='${imgout:Plot.png}', width = imageWidth, height = imageHeight );

arrayCohorts        <- RJSONIO::fromJSON( labkey.url.params$cohorts );
timePoint           <- as.numeric( labkey.url.params$timePoint );
timePointDisplay    <- labkey.url.params$timePointDisplay;
arrayGenes          <- RJSONIO::fromJSON( labkey.url.params$genes );

if(exists("loadedCohorts") && loadedCohorts == arrayCohorts){
  message("No need to read again")
  #No need to read again
} else{
  cohort_filter <- makeFilter(c("arm_name", "IN", paste(arrayCohorts, collapse=";")))
  gem <- data.table(labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName="study", 
                                      queryName="gene_expression_matrices", colFilter=cohort_filter, 
                                      colNameOpt="rname"))
  # Subjects with all timepoints
  utp <- unique(gem$study_time_reported)
  gem <- gem[, keep:=(sum(study_time_reported %in% utp) == length(utp)), by="subject_accession,biosample_accession_name"]
  gem <- gem[keep==TRUE]
  pd <- gem[order(subject_accession, biosample_accession_name, study_time_reported)]
  # Get HAI
  hai_filter <- makeFilter(c("subject_accession", "IN", paste(pd$subject_accession, collapse=";")))
  hai <- data.table(labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName="study", 
                                      queryName="hai", colFilter=hai_filter, colNameOpt="rname"))
  hai <- hai[, list(subject_accession, study_time_collected, response=value_reported/value_reported[study_time_collected==0]), by="virus_strain,biosample_accession_name,subject_accession"]
  hai <- hai[study_time_collected==28]
  hai <- hai[, list(response=log2(max(response))), by="subject_accession,biosample_accession_name"]
  EM <- get_cohort_expression(gem)
  EM <- EM[, c("gene_symbol", colnames(EM)[ colnames(EM) %in% pd$biosample_accession]), with=FALSE]
}

# Subsets
ssES <- EM[gene_symbol %in% arrayGenes]
if(timePoint == 0){
  FC <- ssES[, pd[study_time_reported == 0, biosample_accession], with=FALSE]
} else{
  FC <- ssES[, pd[study_time_reported == timePoint, biosample_accession], with=FALSE] -
        ssES[, pd[study_time_reported == 0, biosample_accession], with=FALSE]
}
FC <- FC[, gene:=ssES$gene_symbol]
FC <- melt(FC, id="gene")
FC <- data.table(FC)
setnames(FC, c("variable", "value"), c("biosample_accession", "logFC"))
data <- merge(FC, pd, by="biosample_accession")[, list(biosample_accession, gene, subject_accession, biosample_accession_name, logFC, arm_name)]
data <- merge(data, hai, by=c("subject_accession", "biosample_accession_name"))

# Plot
p <- ggplot(data=data, aes(x=logFC, y=response)) + geom_point() + geom_smooth(method="lm") + facet_grid(aes(arm_name, gene))
print(p)

loadedCohorts <- arrayCohorts
dev.off();

Sys.sleep(3);

write( RJSONIO::toJSON( x=12, asIs = T ), '${jsonout:outArray}' );

