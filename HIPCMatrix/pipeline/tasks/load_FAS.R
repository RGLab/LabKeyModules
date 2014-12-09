# This pipeline task will load all the standard feature anototation sets to be used by the create-matrix task

anno <-c("hgu133plus2", #Human U133 Plus 2.0 Arrays, HT_HG-U133_Plus_PM
         "hgu133a",
         "illuminaHumanv3", # HumanHT12v3
         "illuminaHumanv4") # HumanHT12v4

annolib <- paste(anno, "db", sep = ".")
sapply(annolib, library, character.only=TRUE)

ll <- lapply(anno, function(X){as.list(eval(parse(text=paste0(X, "SYMBOL"))))})
lprobes <-lapply(ll, names)
lsym <- lapply(ll, function(X){data.frame(probe_id = names(X), gene_symbol = X)})




