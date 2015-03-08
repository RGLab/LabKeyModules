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
timePoint           <- as.numeric(labkey.url.params$timePoint);
timePointUnit       <- as.character(labkey.url.params$timePointUnit);
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
  EM <- con$getGEMatrix(cohort = arrayCohorts, summary = TRUE)
  PD <- data.table(pData(EM))
  if(any(exprs(EM)>100)){
    dt <- data.table(voom(EM)$E)
    dt <- dt[, gene_symbol := rownames(exprs(EM))]
  } else{
    dt <- data.table(exprs(EM))
    dt <- dt[, gene_symbol := rownames(exprs(EM))]
  }
  
  HAI <- con$getDataset("hai", original_view = TRUE)
  HAI <- HAI[, list(arm_accession, study_time_collected, study_time_collected_unit,
                    response=value_reported/mean(value_reported[study_time_collected<=0])), by="virus_strain,subject_accession"]
  # HAI at peak immunogenicity
  HAI <- HAI[, mr := mean(response), by="study_time_collected"]
  HAI <- HAI[, ma := max(mr), by = "arm_accession"]
  peak <- unique(HAI[mr ==ma, list(study_time_collected, arm_accession)])
  HAI <- merge(HAI, peak, by=c("study_time_collected", "arm_accession"))
  HAI <- HAI[, list(response=log2(max(response))), by="subject_accession"]

  PD <- merge(PD, HAI, by = "subject_accession")
  DEMO <- con$getDataset("demographics")[, list(subject_accession, age_reported, gender, race)]
  setnames(DEMO, "age_reported", "age")
  PD <- merge(PD, DEMO, by = "subject_accession")
  EM <- EM[, pData(EM)$biosample_accession %in% PD$biosample_accession]
}

# Subset
ssEM <- EM[arrayGenes, ]
data <- data.table(melt(exprs(ssEM), varnames = c("gene_symbol", "biosample_accession")))
data <- merge(data, PD, by = "biosample_accession")
if(normalize){
  data[, value := value[study_time_collected == timePoint & tolower(study_time_collected_unit) == timePointUnit]  -
                  value[study_time_collected == 0 & tolower(study_time_collected_unit) == timePointUnit],
        by = "subject_accession,gene_symbol"]
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

