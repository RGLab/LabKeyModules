task_name <- labkey.url.params$task_name
data_dir <- "/share/files/HIPC/IS2/@files/data"
extra_data_dir <- paste0("/share/files/HIPC/IS2/@files/data/", task_name)
report_cache_dir <- paste0("/share/files/HIPC/IS2/@files/data/", task_name, "/report_cache/")
output_dir <- "/share/files/HIPC/IS2/@files/data/html_outputs"

if (!dir.exists(extra_data_dir)) dir.create(extra_data_dir, recursive = TRUE)
if (!dir.exists(report_cache_dir)) dir.create(report_cache_dir, recursive = TRUE)
if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)

input_file <- system.file(paste0("manuscript_figures/", task_name, ".Rmd"), package = "ImmuneSignatures2", mustWork = TRUE)
output_file <- file.path(output_dir, paste0(task_name, ".html"))

message("Rendering ", input_file)
message("Output will be written to ", output_file)

rmarkdown::render(
  input = input_file,
  output_file = output_file,
  output_options = list(
    self_contained = TRUE,
    toc = TRUE,
    toc_float = TRUE,
    df_print = "paged",
    code_folding = "hide"
  ),
  params = list(
    data_dir = data_dir,
    extra_data_dir = extra_data_dir,
    report_cache_dir = report_cache_dir,
    cache = FALSE,
    date_prefix = ""
  )
)

ImmuneSignatures2::write_processing_metadata(
  file.path(extra_data_dir, "processing_metadata.csv"),
  task_name = task_name
)
