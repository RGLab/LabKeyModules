library(ImmuneSignatures2)

${rLabkeySessionId}
task_name <- labkey.url.params$task_name

output_dir <- "/share/files/HIPC/IS2/@files/data/html_outputs"
data_dir <- "/share/files/HIPC/IS2/@files/data"
timestamp <- ""

if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)
if (!dir.exists(data_dir)) dir.create(data_dir, recursive = TRUE)

input <- system.file("preprocess", paste0(task_name, ".Rmd"), package = "ImmuneSignatures2")
output_file <- file.path(output_dir, paste0(task_name, ".html"))

message("Rendering ", input)
message("Output will be written to ", output_file)

rmarkdown::render(
  input = input,
  output_file = output_file,
  params = list(
    outputDir = output_dir,
    dataCacheDir = data_dir,
    timestamp = timestamp
  )
)

write_processing_metadata(
  file.path(dataCacheDir, "processing_metadata.csv"),
  task_name = task_name
)
