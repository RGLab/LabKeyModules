library(Rlabkey)
source("utils.R")

${rLabkeySessionId}
data_name <- labkey.url.params$data_name

data <- process_data(data_name)
res <- update_table(data_name, data)
