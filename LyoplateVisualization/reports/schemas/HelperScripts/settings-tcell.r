#' -----------------------------------------
#' panel configuration
#' -----------------------------------------
panel <- "tcell"
message("panel:", panel)
gslist_path_manual <- file.path(path, "gated_data/manual", paste0("gslist-", panel))
gslist_path_auto <- file.path(path, "gated_data/auto", paste0("gslist-", panel))
gt_path <- file.path(path, "gating-templates" , paste0("gt-", panel , ".csv"))
stats_path_auto <- file.path(path, "popstats/auto", paste0("popstats-", panel, ".csv"))
stats_path_manual <- file.path(path, "popstats/manual", paste0("popstats-", panel, ".csv"))

#' Cellular subpopulations of interest
subpopulations_auto <- c("lymph", "CD3", "CD4", "CD8",
                    "CD4/CD38+HLADR+", "CD8/CD38+HLADR+",
                    "CD4/CCR7+CD45RA+", "CD4/CCR7-CD45RA+", "CD4/CCR7+CD45RA-", "CD4/CCR7-CD45RA-",
                    "CD8/CCR7+CD45RA+", "CD8/CCR7-CD45RA+", "CD8/CCR7+CD45RA-", "CD8/CCR7-CD45RA-")

subpopulations_manual <- c("LYM", "CD3", "4+ 8-", "4- 8+",
                          "4+ 8-/38+ DR+", "4- 8+/38+ DR+",
                          "4+ 8-/CCR7+ 45RA+", "4+ 8-/CCR7- 45RA+", "4+ 8-/CCR7+ 45RA-", "4+ 8-/CCR7- 45RA-",
                          "4- 8+/CCR7+ 45RA+", "4- 8+/CCR7- 45RA+", "4- 8+/CCR7+ 45RA-", "4- 8+/CCR7- 45RA-")

subpopulations_common <- c("Lymphocytes", "CD3", "CD4", "CD8",
                    "CD4 Activated", "CD8 Activated",
                    "CD4 Naive", "CD4 Effector", "CD4 Central Memory", "CD4 Effector Memory",
                    "CD8 Naive", "CD8 Effector", "CD8 Central Memory", "CD8 Effector Memory")

#' Hides intermediate helper gates
nodesToHide <- c("boundary",
                "CD4+",
                "CD4-",
                "CD8+",
                "CD8-",
                "CD4_CD38",
                "CD4_HLADR",
                "CD8_CD38",
                "CD8_HLADR",
                "CD4/CD45RA-",
                "CD4/CD45RA+",
                "CD8/CD45RA-",
                "CD8/CD45RA+",
                "CD8/CD45RA+/CCR7gate",
                "CD8/CD45RA-/CCR7gate",
                "CD4/CD45RA+/CCR7gate",
                "CD4/CD45RA-/CCR7gate",
                "CD3A",
                "CD3B")


markers_of_interest <- c("FSC-A", "SSC-A", "Live", "CCR7", "CD4", "CD45RA",
    "CD3", "HLADR", "CD38", "CD8")

centers_no_singlets <- c("Yale", "CIMR")

#' rename some population name for some center so that it is consistent across centers
#' (often time it is due to the typo in workspace)
popName_alias <- list()
