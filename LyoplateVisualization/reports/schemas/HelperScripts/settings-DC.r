#' -----------------------------------------
#' panel configuration
#' -----------------------------------------
panel <- "DC"
message("panel:", panel)
gslist_path_manual <- file.path(path, "gated_data/manual", paste0("gslist-", panel))
gslist_path_auto <- file.path(path, "gated_data/auto", paste0("gslist-", panel))
gt_path <- file.path(path, "gating-templates" , paste0("gt-", panel , ".csv"))
stats_path_auto <- file.path(path, "popstats/auto", paste0("popstats-", panel, ".csv"))
stats_path_manual <- file.path(path, "popstats/manual", paste0("popstats-", panel, ".csv"))
#' Cellular subpopulations of interest
subpopulations_auto <- c("Monocytes", "CD14-Lineage-", "CD14+Lineage-", "CD14+CD16+",
                  "CD16+CD56+", "CD16+CD56-", "CD16-CD56+", "CD16-CD56-", "HLADR+",
                  "CD11c+CD123+", "CD11c+CD123-", "CD11c-CD123+", "CD11c-CD123-")

subpopulations_manual <- c("MNC", "Lin- 14-", "Lin- 14+", "14+ 16+",
                        "16+ 56+", "16+ 56-", "16- 56+", "16- 56-", "DR+",
                        "11c+ 123+", "11c+ 123-", "11c- 123+", "11c- 123-")

subpopulations_common <- c("Monocytes", "Lin-CD14-", "Lin-CD14+", "CD14+CD16+",
    "CD16+CD56+", "CD16+CD56-", "CD16-CD56+", "CD16-CD56-", "HLADR+",
    "CD11c+CD123+", "CD11c+CD123-", "CD11c-CD123+", "CD11c-CD123-")

#' Hides intermediate helper gates
nodesToHide <- c("boundary"
                , "CD14+"
                , "CD14-"
                , "Lineage1"
                , "Lineage2"
                , "CD56+"
                , "CD16+"
            )

#' These are the markers that we will keep after the data have been preprocessed.
markers_of_interest <- c("FSC-A", "SSC-A", "Live", "CD56", "CD123", "CD11c",
    "CD16", "Lineage", "CD14", "HLADR")

centers_no_singlets <- "Yale"

#' rename some population name for some center so that it is consistent across centers
#' (often time it is due to the typo in workspace)
popName_alias <- list("Stanford" = list("11c - 123+" = "11c- 123+"))
