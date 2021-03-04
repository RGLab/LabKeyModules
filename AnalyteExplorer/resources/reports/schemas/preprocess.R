suppressPackageStartupMessages(library(Rlabkey))
suppressPackageStartupMessages(library(UpdateAnno))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(ImmuneSpaceR))
suppressPackageStartupMessages(library(Biobase))

source("utils.R")
source("blood_transcript_modules.R")
source("gene_signatures.R")
source("gene_expression.R")

${rLabkeySessionId}
data_name <- labkey.url.params$data_name

data <- process_data(data_name)
check_data(data_name, data)
update_table(data_name, data)
