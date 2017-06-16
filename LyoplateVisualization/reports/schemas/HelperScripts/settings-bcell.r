#' -----------------------------------------
#' panel configuration
#' -----------------------------------------

#' set up paths
panel <- "bcell"
message("panel:", panel)
#' path to save gating set
gslist_path_manual <- file.path(path, "gated_data/manual", paste0("gslist-", panel))
gslist_path_auto <- file.path(path, "gated_data/auto", paste0("gslist-", panel))
#' path of csv gating template
gt_path <- file.path(path, "gating-templates" , paste0("gt-", panel , ".csv"))
#' path to save pop stats
stats_path_auto <- file.path(path, "popstats/auto", paste0("popstats-", panel, ".csv"))
stats_path_manual <- file.path(path, "popstats/manual", paste0("popstats-", panel, ".csv"))
#' Cellular subpopulations of interest
subpopulations_auto <- c("lymph", "CD3", "CD19", "CD20", "IgD+CD27+", "IgD+CD27-",
                    "IgD-CD27+", "IgD-CD27-", "Plasmablasts", "Transitional")

subpopulations_manual <- c("LYM", "CD3", "CD19", "CD20", "27+ IgD+", "27- IgD+",
                            "27+ IgD-", "27- IgD-", "27hi 38hi", "24hi 38hi")

subpopulations_common <- c("Lymphocytes", "CD3", "CD19", "CD20", "Memory IgD+", "Naive",
                    "Memory IgD-", "IgD-CD27-", "Plasmablasts", "Transitional")
#' Hides intermediate helper gates
nodesToHide <- c("boundary"
                , "CD3gate"
                , "CD19gate"
                , "CD20gate"
                , "plasma_CD27gate"
                , "plasma_CD38gate"
                , "IgDgate"
                , "CD27gate")

#' These are the markers that we will keep after the data have been preprocessed.
markers_of_interest <- c("FSC-A", "SSC-A", "Live", "CD3", "CD19", "CD20", "IgD",
                "CD27", "CD38", "CD24")

centers_no_singlets <- "Yale"

#' rename some population name for some center so that it is consistent across centers
#' (often time it is due to the typo in workspace)
popName_alias <- list()
