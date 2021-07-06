library(ImmuneSignatures2)

rLabkeySessionId <- "${rLabkeySessionId}"
task_name <- labkey.url.params$task_name

outputDir = "/share/files/HIPC/IS2/@files/data/html_outputs"
dataCacheDir = "/share/files/HIPC/IS2/@files/data"
timestamp =  strftime(Sys.time(), "%Y_%m_%d_")

if (!dir.exists(outputDir)) dir.create(outputDir, recursive = TRUE)
if (!dir.exists(dataCacheDir)) dir.create(dataCacheDir, recursive = TRUE)

rmarkdown::render(input = system.file("preprocess", paste0(task_name, ".Rmd"), package = "ImmuneSignatures2"),
       output_file = file.path(outputDir, paste0(task_name, ".html")),
       params = list(
         outputDir = outputDir,
         dataCacheDir = dataCacheDir,
         timestamp = timestamp
       ))