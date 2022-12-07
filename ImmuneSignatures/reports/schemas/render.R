output_dir <- "/share/files/HIPC/IS1/@files/html_outputs"

if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)

input_file0 <- system.file("manuscript_figures/analysis.Rmd", package = "ImmuneSignatures", mustWork = TRUE)
input_file <- file.path(output_dir, "analysis.Rmd")
file.copy(input_file0, input_file)

output_file <- file.path(output_dir, "analysis.html")

message("Rendering ", input_file0)
message("Output will be written to ", output_file)

rmarkdown::render(
  input = input_file,
  output_file = output_file,
  output_options = list(
    self_contained = TRUE,
    df_print = "paged"
  )
)
