library(ImmuneSignatures2)

${rLabkeySessionId}
task_name <- labkey.url.params$task_name

outputDir <- "/share/files/HIPC/IS2/@files/data/html_outputs"
dataCacheDir <- "/share/files/HIPC/IS2/@files/data"
timestamp <- ""

if (!dir.exists(outputDir)) dir.create(outputDir, recursive = TRUE)
if (!dir.exists(dataCacheDir)) dir.create(dataCacheDir, recursive = TRUE)

inputFile <- system.file("preprocess", paste0(task_name, ".Rmd"), package = "ImmuneSignatures2")
outputFile <- file.path(outputDir, paste0(task_name, ".html"))

message("Rendering ", inputFile)
message("Output will be written to ", outputFile)


rmarkdown::render(input = inputFile,
                  output_file = outputFile,
                  params = list(
                    outputDir = outputDir,
                    dataCacheDir = dataCacheDir,
                    timestamp = timestamp
                  ))


write_processing_metadata(file.path(dataCacheDir, "processing_metadata.csv"),
                          task_name = task_name)