#' -----------------------------------------
#' panel configuration
#' -----------------------------------------
panel <- "treg"
message("panel:", panel)
gslist_path_manual <- file.path(path, "gated_data/manual", paste0("gslist-", panel))
gslist_path_auto <- file.path(path, "gated_data/auto", paste0("gslist-", panel))
gt_path <- file.path(path, "gating-templates" , paste0("gt-", panel , ".csv"))
stats_path_auto <- file.path(path, "popstats/auto", paste0("popstats-", panel, ".csv"))
stats_path_manual <- file.path(path, "popstats/manual", paste0("popstats-", panel, ".csv"))
#' Cellular subpopulations of interest
subpopulations_auto <- c("lymph", "CD3", "CD4", "CD25+CD127-", "CCR4+CD45RO+",
                    "CCR4-CD45RO+", "CCR4+CD45RO-", "CCR4-CD45RO-",
                    "CCR4+HLADR+", "CCR4-HLADR+", "CCR4+HLADR-", "CCR4-HLADR-",
                    "Memory", "Naive", "Total", "Activated")

subpopulations_manual <- c("LYM", "CD3", "CD4", "127lo 25+", "CCR4+ 45RO+",
                    "CCR4- 45RO+", "CCR4+ 45RO-", "CCR4- 45RO-",
                    "CCR4+ DR+", "CCR4- DR+", "CCR4+ DR-", "CCR4- DR-",
                    "memory", "naive", "total", "activated")

subpopulations_common <- c("Lymphocytes", "CD3", "CD4", "Lo127Hi25", "CCR4+CD45RO+",
                    "CCR4-CD45RO+", "CCR4+CD45RO-", "CCR4-CD45RO-",
                    "CCR4+HLADR+", "CCR4-HLADR+", "CCR4+HLADR-", "CCR4-HLADR-",
                    "Memory", "Naive", "Total Treg", "Activated")

#' Hides intermediate helper gates
nodesToHide <- c("boundary"
                  , "CD25CD127_transitional"
                  , "CD25"
                  , "HLADR+"
                  , "HLADR-"
                  , "CD45RO+"
                  , "CD45RO-"
                  , "CCR4+"
                  , "CCR4-")

markers_of_interest <- c("FSC-A", "SSC-A", "Live", "CD25", "CD4", "CCR4",
    "CD127", "CD45RO", "CD3", "HLADR")

centers_no_singlets <- "Yale"

#' rename some population name for some center so that it is consistent across centers
#' (often time it is due to the typo in workspace)
popName_alias <- list("Miami" = list("CCD4- DR+" = "CCR4- DR+"))
