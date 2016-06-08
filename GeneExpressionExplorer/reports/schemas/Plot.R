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
library(Biobase)
library(data.table)
library(Rlabkey)
library(ImmuneSpaceR)
library(reshape2)
library(limma)

stopcheck <- function(data){
    stop(paste0(paste(capture.output(str(data)), collapse="\n"), "\nl.u.b: ",labkey.url.base, "\nl.u.p: ",labkey.url.path))
}

imageWidth  <- as.numeric(labkey.url.params$imageWidth);
imageHeight <- as.numeric(labkey.url.params$imageHeight);
imgfile     <- '${imgout:Plot.png}';
CairoPNG( filename=imgfile, width = imageWidth, height = imageHeight );


# Input parameters
response            <- as.character(labkey.url.params$response);
ems                 <- RJSONIO::fromJSON(labkey.url.params$ema)
input_cohorts       <- RJSONIO::fromJSON(labkey.url.params$cohorts);
input_genes         <- RJSONIO::fromJSON(labkey.url.params$genes);
timePoint           <- as.numeric(labkey.url.params$timePoint);
timePointUnit       <- as.character(labkey.url.params$timePointUnit);
normalize           <- as.logical(labkey.url.params$normalize);
# Data grid
filters             <- RJSONIO::fromJSON( labkey.url.params$filters );
# Additional options
textSize            <- as.numeric( labkey.url.params$textSize );
facet               <- tolower(labkey.url.params$facet)
shape               <- tolower(labkey.url.params$shape)
color               <- tolower(labkey.url.params$color)
size                <- tolower(labkey.url.params$size)
alpha               <- tolower(labkey.url.params$alpha)
#stop(dput(labkey.url.params))
stopcheck(labkey.url.params)

add_r2 <- function(data){
  dt <- data.table(data)
  dt <- dt[, r2 :=  paste("R^2 ==", round(summary(lm(response ~ value))[['r.squared']], 3)), by = "cohort,gene_symbol"]
  dt <- dt[, r2x := min(value), by = "cohort,gene_symbol"]
  dt <- dt[, r2y := max(response), by = "cohort,gene_symbol"]
  return(data.frame(dt))
}

filter <- as.matrix( lapply( filters, function( e ){
    return( paste0( RCurl::curlEscape( e['fieldKey'] ), '~', e['op'], '=', RCurl::curlEscape( e['value'] ) ) );
}) );
if ( nrow( filter ) == 0 ){
  filter <- NULL;
}

# Get the participants
# Check that con exist and that ithas the same participants as the Rlabkey version
# Check that cohorts exists and are the same
DF_pids <- labkey.selectRows(
    baseUrl = labkey.url.base, folderPath = labkey.url.path,
    schemaName = "study", queryName = "demographics", viewName="",
    colFilter=NULL, containerFilter=NULL, colNameOpt = "rname")$participantid

# Reload everything when DataFinder filters are updated
if(!exists("con") || !all(con$getDataset("demographics")$participant_id %in% DF_pids)){
  con <- CreateConnection()
  if(exists("loaded_cohorts")) rm(loaded_cohorts)
  if(exists("loaded_genes")) rm(loaded_genes)
}

# Re-download EM and demographics when the selected cohorts change
if(!exists("loaded_cohorts") || length(loaded_cohorts) != length(input_cohorts) || !all(loaded_cohorts %in% input_cohorts)){
 EM <- con$getGEMatrix(cohort = input_cohorts, summary = TRUE, reload = TRUE)
 if(any(exprs(EM)>100, na.rm = TRUE)){
   dt <- data.table(voom(EM)$E)
   dt <- dt[, gene_symbol := rownames(exprs(EM))]
 } else{
   dt <- data.table(exprs(EM))
   dt <- dt[, gene_symbol := rownames(exprs(EM))]
 }
 DEMO <- unique(con$getDataset("demographics")[, list(participant_id, age_reported, gender, race)])
 setnames(DEMO, "age_reported", "age")
}

  HAI <- con$getDataset("hai", original_view = TRUE, colFilter = filter, reload = TRUE)
  HAI <- HAI[, list(arm_accession, study_time_collected, study_time_collected_unit,
                    response=value_reported/mean(value_reported[study_time_collected<=0])), by="virus,participant_id"]
  # HAI at peak immunogenicity
  HAI <- HAI[, mr := mean(response), by="study_time_collected"]
  HAI <- HAI[, ma := max(mr), by = "arm_accession"]
  peak <- unique(HAI[mr ==ma, list(study_time_collected, arm_accession)])
  HAI <- merge(HAI, peak, by=c("study_time_collected", "arm_accession"))
  HAI <- HAI[, list(response=log2(max(response))), by="participant_id"]

  PD <- data.table(pData(EM))
  PD <- merge(PD, HAI, by = "participant_id")
  PD <- merge(PD, DEMO, by = "participant_id")
  #EM <- EM[, pData(EM)$biosample_accession %in% PD$biosample_accession]
  dt <- dt[, c("gene_symbol", PD$biosample_accession), with = FALSE]


# Subset
#ssEM <- EM[input_genes, ]
#data <- data.table(melt(exprs(ssEM), varnames = c("gene_symbol", "biosample_accession")))
ssdt <- dt[gene_symbol %in% input_genes,]
data <- melt(ssdt, variable.name="biosample_accession", id.vars="gene_symbol")
data <- merge(data, PD, by = "biosample_accession")
if(normalize){
  data[, value := value[study_time_collected == timePoint & tolower(study_time_collected_unit) == timePointUnit]  -
                  value[study_time_collected == 0 & tolower(study_time_collected_unit) == timePointUnit],
        by = "participant_id,gene_symbol"]
  xlab <- "log expression normalized to baseline"
} else{
  xlab <- "log expression"
}
data <- data[study_time_collected == timePoint & tolower(study_time_collected_unit) == timePointUnit]
  
# Plot
if(color=="") color <- NULL
if(shape=="") shape <- NULL
if(size=="") size <- NULL
if(alpha=="") alpha <- NULL

data <- add_r2(data)
p <- ggplot(data=data, aes(x=value, y=response)) +
  geom_point(aes_string(size=size, color=color, alpha=alpha, shape=shape)) +
  geom_smooth(method="lm") + ylab(response) + xlab(xlab) +
  geom_text(aes(x=r2x, y=r2y, label = r2), hjust = 0, vjust = 1, data = data, parse = TRUE) +
  theme_IS(base_size = textSize) #theme(text=element_text(size=textSize)) 
if(facet == "grid"){
  p <- p + facet_grid(aes(cohort, gene_symbol), scales="free")
} else{
  p <- p + facet_wrap(~cohort + gene_symbol, scales="free")
}
print(p)

# Variables used for caching
loaded_cohorts <- input_cohorts
loaded_genes   <- input_genes
dev.off();

