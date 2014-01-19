# TODO: get input rows and generate matrix
# for now fake an input: ${input.CEL}

# and create a dummy output matrix
data <- data.frame(ID_REF=c("1007_s_at", "1053_at"), BS586100=c(1.0, 2.0), BS586156=c(3.0, 4.0))

write.table(data, file = "${output.tsv}", sep = "\t", qmethod = "double", col.names=TRUE, row.names=FALSE)

