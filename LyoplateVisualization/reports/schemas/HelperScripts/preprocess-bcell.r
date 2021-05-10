library(flowWorkspace)
library(data.table)
library(plyr)
library(tools)

#Set up some standard paths
scriptPath <- "/labkey/git/LabKeyModules/LyoplateVisualization/reports/schemas/HelperScripts"
path <- "/share/files/HIPC/Lyoplate/@files"

# source some common functions
source(file.path(scriptPath, "wrapper-functions.r"))

#' load panel-specific settings (uncomment the panel you want to analyze)
source(file.path(scriptPath,"settings-bcell.r"))

#' Should we extract the spillover matrices for each center?
#' By default, no because the data are already compensated and transformed.
extract_spillover <- FALSE

#' whether to use ncdfFlowSet or flowSet
isNcdf <- TRUE

#' path that stores the manually gated FCS files and XML workspaces
manual_path <- path

#' flowJo workspace path
ws_path <- file.path(manual_path, "XML")

#' raw FCS file path
fcs_path <- file.path(manual_path, "FCS files")

#' path that sores the phenoData annotations as excel file
pd_path <- file.path(path, "pData")

# Test if the data has already been parsed by trying to load the gatingset list
if(inherits(try(gs_list<-load_gslist(gslist_path_manual)),"try-error")){
  message("Can't find manually gated gslist. Re-importing:");

centers <- c('BIIR','CIMR','Miami','NHLBI','Stanford','UCLA','Yale')

#' If specified, extracts spillover matrices for each center as a list
if (extract_spillover) {
  message("Extracting spillover matrices...")
  spillover_matrices <- sapply(centers, function(center) {
    spillover_file <- file.path(ws_path, center, paste(center, "Matrices"), panel)
    read.table(spillover_file, skip = 2, nrows = 8, header = TRUE, check.names = FALSE, sep = "\t")
  }, simplify = FALSE)
}


#' We parse each center's workspace and then extract its flowSet.
message("Parsing Lyoplate workspaces...")
gs_list <- sapply(centers, function(center) {
  message("Center: ", center)
  this_ws_path <- file.path(ws_path, center, paste0("CA c3 v2 ", center, ".xml"))
  ws <- openWorkspace(this_ws_path)
  groupNames <- levels(getSampleGroups(ws)[,"groupName"])
  #NOTE: here we use the fuzzy match due to the short name used in auto gating
  #ideally, we want to do the strict full string match avoid picking up the wrong panel
  #in case the panel name are similar. But in this particular panel set, it is safe to do so.
  groupID <- grep(panel, groupNames, ignore.case = T)
  #NOTE: in theory, we shouldn't need to do this if center names were consistent.

  this_fcs_path <- file.path(fcs_path, center)
  this_fcs_path <- sub("BIIR", "Baylor", this_fcs_path)
  gs <- parseWorkspace(ws, name = groupNames[groupID], path = this_fcs_path, isNcdf = isNcdf, extend_val = -10)
  gs
}, simplify = FALSE)


# Swaps the channels and markers for the current 'flowSet' object. This ensures
# that we can 'rbind2' the 'GatingSetList' below because the stain names do not
# match otherwise.
message ("Swapping flowSet channels and markers")
gs_list <- sapply(centers, function(center) {
  message("Center: ", center)

  gs <- gs_list[[center]]
  fs <- getData(gs)

  for(sn in sampleNames(fs)){
      fr <- fs@frames[[sn]]
      fs@frames[[sn]] <- preprocess_flowframe(fr, use.exprs = !isNcdf)
  }

  newColNames <- colnames(fs@frames[[sn]])
  colnames(fs) <- newColNames #assuming the order of colnames between fr and fs were consistent
  flowData(gs) <- fs

  fr <- fs@frames[[sn]]
  pd <- pData(parameters(fr))
  pd <- pd[!is.na(pd$desc), 2:1]
  colnames(pd) <- c("old", "new")

  gs <- updateGateParameter(gs, pd)

  #subset on common columns
  fs <- fs[, markers_of_interest]
  flowData(gs) <- fs
  gs
}, simplify = FALSE)

#' hide singlet gate since some centers don't have it
invisible(lapply(centers[!centers%in%centers_no_singlets], function(center){
          setNode(gs_list[[center]], "singlets", FALSE)
        }))

#' correct typos for some centers
invisible(lapply(names(popName_alias), function(thisCenter){
          message(thisCenter)
          gs <- gs_list[[thisCenter]]
          typo <- popName_alias[[thisCenter]]
          lapply(names(typo), function(thisTypo){
                correct <- typo[[thisTypo]]
                message(thisTypo, " --> ", correct)
                setNode(gs, thisTypo, correct)
              })
        }))

#' Construct a gating set list
gs_list <- GatingSetList(gs_list)

# Updates pData to include Center, Sample, and Replicate
# To do this, we open the csv files provided for each center and extract the
# relevant data.
message("Extracting pData from csv config files...")
center_pData <- ldply(centers, function(center) {
  message("Center: ", center)

  #NOTE: in theory, we shouldn't need to do this if center names were consistent.
  center <- sub("BIIR", "Baylor", center)
  # The filename of the manually edited Excel file
  csv <- dir(path = pd_path, pattern = center, full.names = TRUE)

  exp_samples <- read.csv(file = csv, stringsAsFactors = FALSE)
  colnames(exp_samples) <- c("name", "Institution", "Panel", "Replicate", "Sample")
  exp_samples <- subset(exp_samples, select = -c(Institution, Panel))
  exp_samples$Replicate <- as.character(as.numeric(exp_samples$Replicate))
  exp_samples$Sample <- as.character(as.numeric(exp_samples$Sample))
  exp_samples$Center <- center
  exp_samples
})

center_pData <- subset(center_pData, select = c(name, Center, Sample, Replicate))

message("Updating flowSet's pData...")
center_pData <- merge(pData(gs_list), center_pData, sort = FALSE)
rownames(center_pData) <- rownames(pData(gs_list))
pData(gs_list) <- center_pData


#' Archives the results
save_gslist(gs_list, path = gslist_path_manual)
}



#' extract stats from manual gates
pop_stats <- extractStats(gs_list, subpopulations_manual)

#Check the md5sum of the current data and the existing data. Re-generate if it's stale.

md5current <- md5sum(list.files(path=dirname(stats_path_manual),pattern=basename(stats_path_manual),full=TRUE))
temp <- file.path(tempdir(),basename(stats_path_manual))
write.csv(pop_stats, file = temp, row.names = FALSE)
md5new <- md5sum(temp)
if(!all.equal(as.vector(md5current),as.vector(md5new))){
  message("Writing population statistics")
write.csv(pop_stats, file = stats_path_manual, row.names = FALSE)
}else{
  message("Population statistics already written")
}
message("Finished parsing manual gates for the ",panel," panel")
