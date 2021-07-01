library(AnalyteExplorer)

rLabkeySessionId <- "${rLabkeySessionId}"
data_name <- labkey.url.params$data_name

data <- process_data(data_name)
check_data(data_name, data)
update_table(data_name, data)
