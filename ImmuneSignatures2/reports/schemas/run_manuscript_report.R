
${rLabkeySessionId}
task_name <- labkey.url.params$task_name

outputDir <- "/share/files/HIPC/IS2/@files/data/html_outputs"
# Location of virtual study rds files (esets)
dataCacheDir <- "/share/files/HIPC/IS2/@files/data"
# cache directory for saving intermediate files (can help with debugging or re-running)
cache_path <- paste0("/share/files/HIPC/IS2/@files/cache/", task_name)
# use .rmd report caching?
cache = FALSE
# path for .rmd report cache (used when cache = TRUE, not relevant here)
cache.path = file.path(cache_path,)
# data timestamp: none when running on server
timestamp <- ""


if (!dir.exists(outputDir)) dir.create(outputDir, recursive = TRUE)
if (!dir.exists(dataCacheDir)) stop("could not find dataCacheDir")

inputFile <- system.file("manuscript_figures", paste0(task_name, ".Rmd"), package = "ImmuneSignatures2")
outputFile <- file.path(outputDir, paste0(task_name, ".html"))

message("Rendering ", inputFile)
message("Output will be written to ", outputFile)


rmarkdown::render(input = inputFile,
                  output_file = outputFile,
                  params = list(
                    outputDir = outputDir,
                    dataCacheDir = dataCacheDir,
                    cache_path = cache_path,
                    cache = cache,
                    cache.path = cache.path
                  ))

