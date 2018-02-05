library(openCyto)
opt <- getOption('openCyto')
opt$check.pop <- FALSE
options(openCyto = opt)
library(data.table)
library(plyr)

flowDensityEx <- function(fr, pp_res, channels, ...){

  if(length(channels)==2)
    flowDensity::.flowDensity(fr, pp_res, channels[1], channels[2], ...)
  else
    flowDensity::.flowDensity(fr, pp_res, yChannel = channels, ...)
}
registerPlugins(fun=flowDensityEx,methodName="flowDensity",dep="flowDensity")

path <- "/share/files/HIPC/Lyoplate/@files"
remotePath <- "remote_cpy/Lyoplate_Paper_Analysis"

source(file.path(path, "wrapper-functions.r"))

#' load panel-specific settings (uncomment the panel you want to gate)
source(file.path(path,"settings-tcell.r"))
#source(file.path(path,"settings-bcell.r"))
#source(file.path(path,"settings-treg.r"))
#source(file.path(path,"settings-DC.r"))
#' -----------------------------------------
#' gating
#' -----------------------------------------
#' Loads archived manual gated data
gslist <- load_gslist(gslist_path_manual)
#' remove the second node and leave only 'root' node
Rm(getNodes(gslist[[1]], showHidden = T)[2], gslist)
#' save it to a different folder
save_gslist(gslist, gslist_path_auto, cdf = "link")
#gslist <- load_gslist(gslist_path_auto)
#' Creates the gating-template object from a CSV file
gt <- gatingTemplate(gt_path, panel)
#Rm("boundary", gslist)
#popToRm <- getChildren(gslist[[1]], 'CD19andCD20', path = "auto")[1:6]
#lapply(popToRm, function(node)Rm(node, gslist))
#getNodes(gslist[[1]], showHidden = T)
#' Applies OpenCyto to GatingSet (11m with 10 cores)
gating(gt, gslist
        ,  mc.cores = 10, parallel_type = "multicore"
#    , stop.at = "*"
)
#'hide the helper gates
hideNodes(gslist, nodesToHide)
#' Archives the GatingSet
save_gslist(gslist, path = gslist_path_auto, overwrite = TRUE)

#' -----------------------------------------
#' extract stats
#' -----------------------------------------
#gs <- load_gs(gs_path)
#' get stats
pop_stats <- extractStats(gslist, subpopulations_auto)
#' save the stats
write.csv(pop_stats, file = stats_path_auto, row.names = FALSE)

#' rename pop names to the common pop names
gslist <- load_gslist(gslist_path_manual)
rename_pops(gslist, subpopulations_manual, subpopulations_common)
rename_pops(gslist, "not dead", "Live")
save_gslist(gslist, path = sub("gated_data", "gated_data/pop_renamed", gslist_path_manual), cdf = "link", overwrite = T)

gslist <- load_gslist(gslist_path_auto)
rename_pops(gslist, subpopulations_auto, subpopulations_common)
if(panel == "DC"){
  #hide the extra helper gates
   lapply(gslist, setNode, "lymph", FALSE, level = 1)
   lapply(gslist, setNode,"live_gate", FALSE, level = 1)
}


if(panel == "bcell"){
  invisible(lapply(gslist, setNode, "CD19andCD20", "CD19 AND CD20", level = 1))
  invisible(lapply(gslist, setNode, "CD19and!CD20", "CD19 AND NOT CD20", level = 1))
}
save_gslist(gslist, path = sub("gated_data", "gated_data/pop_renamed", gslist_path_auto), cdf = "link", overwrite = T)

