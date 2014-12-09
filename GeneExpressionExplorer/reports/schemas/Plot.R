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
library(ImmuneSpaceR)
library(reshape2)
library(ggthemr)
library(limma)

merge_cohorts <- function(x, y){
  return(merge(x, y, by="gene_symbol"))
}

getRunFromCohort <- function(con, cohort){
  run <- gsub(".tsv$", "", unique(subset(con$data_cache$GE_inputs, arm_name == cohort)[, "name"]))
  return(run)
}

add_r2 <- function(data){
  dt <- data.table(data)
  dt <- dt[, r2 :=  paste("R^2 ==", round(summary(lm(response ~ value))[['r.squared']], 3)), by = "arm_name,gene_symbol"]
  dt <- dt[, r2x := min(value), by = "arm_name,gene_symbol"]
  dt <- dt[, r2y := max(response), by = "arm_name,gene_symbol"]
  return(data.frame(dt))
}



imageWidth  <- as.numeric(labkey.url.params$imageWidth);
imageHeight <- as.numeric(labkey.url.params$imageHeight);
imgfile <- '${imgout:Plot.png}'
CairoPNG( filename=imgfile, width = imageWidth, height = imageHeight );

arrayCohorts        <- RJSONIO::fromJSON( labkey.url.params$cohorts );
response            <- as.character( labkey.url.params$response );
timePoint           <- as.numeric( labkey.url.params$timePoint );
timePointDisplay    <- labkey.url.params$timePointDisplay;
normalize           <- as.logical( labkey.url.params$normalize );
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
con <- CreateConnection()
if(exists("loadedCohorts") && all(loadedCohorts == arrayCohorts)){
  #No need to read again
} else{
  runs <- getRunFromCohort(con, arrayCohorts)
  EM_list <- lapply(runs, con$getGEMatrix, summary = TRUE)
  PD <- rbindlist(lapply(EM_list, pData))
  if(any(exprs(EM_list[[1]])>100)){
    EM <- Reduce(f = merge_cohorts, lapply(EM_list, function(x){dt <- data.table(voom(x)$E); dt[, gene_symbol:=rownames(exprs(x))]}))
  } else{
    EM <- Reduce(f = merge_cohorts, lapply(EM_list, function(x){dt <- data.table(exprs(x)); dt[, gene_symbol:=rownames(exprs(x))]}))
  }
  
  EM <- melt(EM, id="gene_symbol", variable.name = "biosample_accession")
  HAI <- con$getDataset("hai", original_view = TRUE)
  HAI <- HAI[, list(subject_accession, study_time_collected, response=value_reported/value_reported[study_time_collected==0]), by="virus_strain,subject_accession"]
  #we predict the response at peak immunogenicity
  #immuno_peak <- HAI[, mean(response), by = "study_time_collected"][V1 == max(V1), study_time_collected] 
  HAI <-  HAI[, mr := mean(response), by = "study_time_collected"]
  immuno_peak <- HAI[HAI[, mr == max(mr)], study_time_collected]

  HAI <- HAI[study_time_collected==immuno_peak]
  HAI <- HAI[, list(response=log2(max(response))), by="subject_accession"]
  PD <- merge(PD, HAI, by = "subject_accession")
  DEMO <- con$getDataset("demographics")[, list(subject_accession, age_reported, gender, race)]
  setnames(DEMO, "age_reported", "age")
  PD <- merge(PD, DEMO, by = "subject_accession")
  EM <- EM[ biosample_accession %in% PD$biosample_accession]
  # PD and EM are the two useful objects out of this scope
}

# Subset
ssEM <- EM[gene_symbol %in% arrayGenes & biosample_accession %in% PD$biosample_accession]
data <- merge(ssEM, PD, by = "biosample_accession")
if(normalize){
  data[, value := value[study_time_collected == timePoint]  - value[study_time_collected == 0], by = "subject_accession,gene_symbol"]
  xlab <- "log expression normalized to baseline"
} else{
  xlab <- "log expression"
}
data <- data[study_time_collected == timePoint]
  
# Plot
if(color=="") color <- NULL
if(shape=="") shape <- NULL
if(size=="") size <- NULL
if(alpha=="") alpha <- NULL

data <- add_r2(data)
p <- ggplot(data=data, aes(x=value, y=response)) + geom_point(aes_string(size=size, color=color, alpha=alpha, shape=shape)) + geom_smooth(method="lm") + ylab(response) + xlab(xlab) + geom_text(aes(x=r2x, y=r2y, label = r2), hjust = 0, vjust = 1, data = data, parse = TRUE) + theme(text=element_text(size=textSize)) 
if(facet == "grid"){
  p <- p + facet_grid(aes(arm_name, gene_symbol), scales="free")
} else{
  p <- p + facet_wrap(~arm_name + gene_symbol, scales="free")
}
ggthemr("solarized")
print(p)

loadedCohorts <- arrayCohorts
dev.off();

#write( RJSONIO::toJSON( x=arrayCohorts, asIs = T ), '${jsonout:outArray}' );

