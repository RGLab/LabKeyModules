rename_pops <- function(gslist, oldNames, newNames){

  #since parent node is subject to change during the renaming process
  #we need to record the node index as reference
  subpop_id <- match(oldNames, getNodes(gslist[[1]], path = "auto"))
  for(i in seq_along(oldNames)){
    old_id <- subpop_id[i]
    old <- getNodes(gslist[[1]], path = "auto")[old_id]
    new <- newNames[i]
    message("rename ", old, " to ", new)
    lapply(gslist, setNode, old, new, level = 1)
  }

  #' verification
  all.equal(getNodes(gslist[[1]], path = "auto")[subpop_id], newNames)
}


#' The wrapper function that extracts the population % and counts from the gated data
#'
#' It reads and combine the stats(%, count and parent count) from a GatingSet
#'
#' @param gs \code{GatingSet}
#' @param subpopulations \code{character} vector that specifies the cellular subpopulations of interest
#' @param flowJo \code{logical} see \link{getTotal}.
#'
#' @return a \code{data.table}
extractStats <- function(gs, subpopulations, flowJo = FALSE){

  pop_stats <- ldply(sampleNames(gs), function(sn){
                  ldply(subpopulations, function(pop){
                        gh <- gs[[sn]]

                        count <- getTotal(gh, pop, xml = flowJo)
                        parent <- getParent(gh, pop, path = "auto")
                        parentCount <- getTotal(gh, parent, xml = flowJo)
                        prop <- as.numeric(ifelse(parentCount == 0 ,0 ,count/parentCount))
                        data.frame(Filename = sn
                                    , Population = pop
                                    , Count = count
                                    , Proportion = prop
                                    , Parent = parent
                                    , Count_Parent = parentCount
                                    , stringsAsFactors = FALSE
                                    )
                      })
                }, .progress = "none")
  pop_stats <- merge(pop_stats, pData(gs), by.x = "Filename", by.y = "name", sort = FALSE)
  pop_stats <- data.table(pop_stats)

  pop_stats[Population == "lymph", Population:= "Lymphocytes"]
  pop_stats[, list(Population, Filename, Center, Sample, Replicate, Proportion, Count, Parent, Count_Parent)]
}


#' Preprocesses a Cytotrol flowFrame object
#'
#' Our goal here is to use swap the marker names and the channel names within a
#' \code{flowFrame} object to ensure that the \code{flowFrame} objects across
#' centers can be merged into a single \code{flowSet}.
#'
#' We also preprocess the marker names to strip out any additional information
#' added to the marker name. For instance, NHLBI uses "IgD V500", which we reduce
#' to "IgD".
#'
#' @param fr the \code{flowFrame} object to preprocess
#' @return the updated \code{flowFrame} object containing only the markers of
#' interest
preprocess_flowframe <- function(fr, use.exprs = TRUE) {

  fr_rownames <- rownames(pData(parameters(fr)))

  # Preprocesses each of the columns in the flow_frame
  for (j in seq_len(length(colnames(fr)))) {

    marker_idx <- paste0(fr_rownames[j], "S")
    channel_idx <- paste0(fr_rownames[j], "N")

    marker <- description(fr)[[marker_idx]]
    channel <- description(fr)[[channel_idx]]

    # In the case the marker name is given, we swap the marker and channel
    # names.
    if (!is.null(marker)) {
      # Converts the marker names to a common name
      marker <- as.vector(marker_conversion(marker))

      # Updates the channel with the marker
      description(fr)[[channel_idx]] <- marker
      pData(parameters(fr))[j, "name"] <- marker

      # Updates the marker information in the flow_frame with the channel
      description(fr)[[marker_idx]] <- channel
      pData(parameters(fr))[j, "desc"] <- channel
    }
  }

  if(use.exprs)
    colnames(exprs(fr)) <- colnames(fr)

  # Subset to markers of interest
  fr
}

#' Converts the Lyoplate marker names to a common name
#'
#' For the following list of marker names, we manually update the names so
#' that they are standard across centers.
marker_conversion <- Vectorize(function(marker) {
      # If marker name contains additional info, remove everything after the
      # space. (e.g., "IgD V500" to "IgD")
      marker <- strsplit(marker, " ")[[1]][1]

      if (marker == "19") {
        marker <- "CD19"
      } else if (marker %in% c("LIVE", "LIVE_GREEN", "Live/Dead")) {
        marker <- "Live"
      } else if (marker == "IGD") {
        marker <- "IgD"
      } else if (marker %in% c("HLA", "HLADR", "HLA-DR")) {
        marker <- "HLADR"
      } else if (marker == "CD197") {
        marker <- "CCR7"
      } else if (marker == "CD194") {
        marker <- "CCR4"
      } else if (marker == "CD11C") {
        marker <- "CD11c"
      } else if (marker %in% c("CD3CD19CD20", "CD3+19+20", "CD3_CD19_CD20",
          "CD3+CD19+CD20+", "CD3+CD19+CD20", "CD3+19+20")) {
        marker <- "Lineage"
      } else if (marker == "CD196") {
        marker <- "CCR6"
      } else if (marker == "CD183") {
        marker <- "CXCR3"
      }

      marker
    })
#' update the gate parameters for a GatingSet
#'
#' It actually reconstructs a new GatingSet by copying all the gates with their parameters changed.
#'
#'
#' @param gs \code{GatingSet} to work with
#' @param pd \code{data.frame} contains the mapping between old and new channel names
#' @return  a new \code{GatingSet} object with the new gate added but share the same flow data with the input 'GatingSet'
updateGateParameter <- function(gs, map){

  if(!identical(colnames(map), c("old", "new")))
    stop("'map' must contain two columns: 'old' and 'new'!")

  #copy the entire tree structure
  message("cloning tree structure...")
  clone <- gs
  clone@pointer <- .Call("R_CloneGatingSet",gs@pointer,sampleNames(gs))
  #clear the tree
  nodes <- getNodes(gs)
  Rm(nodes[2], clone)

  nodesToadd <- nodes[-1]

  lapply(nodesToadd, function(node){
        #copy the other nodes to its parent
        thisParent <- getParent(gs, node)
        popName <- basename(node)

        lapply(sampleNames(gs),function(sn){
              gh <- gs[[sn]]
              gate <- getGate(gh, node)

              if(!flowWorkspace:::.isBoolGate(gh,node)){
                params <- parameters(gate)

                #update according to the map
                params <- sapply(params, function(param){
                      param <- gsub("<|>", "", param) #remove prefix
                      ind <- match(param, map[, "old"])
                      ifelse(is.na(ind), param, map[ind, "new"])
                    })
                names(params) <- params
                parameters(gate) <- params
              }
              negated <- flowWorkspace:::isNegated(gh, node)
              add(clone[[sn]], gate, name = popName, parent = thisParent, negated = negated)
            })
      })

  recompute(clone)
  clone
}

#'hide the helper gates
hideNodes <- function(gs, nodesToHide){
  invisible(lapply(nodesToHide, function(node){
            message("hide ", node)
            lapply(gslist, function(gh)setNode(gh, node, F))
          })
  )
}

#' match the gated cell population based on their gating path
#'
#' Due to the different gating scheme, the population name and its path may be
#' different between two GatingSets (e.g. manual vs automated gating scheme)
#' It is helpful to do some sort of automated matching in order to compare the
#' gating results between the two.
#'
#' @param ref the populations of interest
#' @param paths the populations to be matched with
#' @return a \code{data.table} that contains the mapping between \code{ref} and \code{paths}
##TODO: there is currently no good solution for a decent matching
## e.g. CD4 vs 4+ 8-
map.gates <- function(ref, paths){

  toMatch <- paths
  matched <- NULL
  for(node in ref){
        matchInd <- which.min(adist(node, toMatch, ignore.case = TRUE))
        thisMatch <- toMatch[matchInd]
        toMatch <- toMatch[-matchInd]
        matched <- c(matched, thisMatch)
        browser()
      }
  data.table(ref, matched)
}
