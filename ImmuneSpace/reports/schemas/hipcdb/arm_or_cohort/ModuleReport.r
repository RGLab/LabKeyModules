# This sample code returns the query data in tab-separated values format, which LabKey then
# renders as HTML. Replace this code with your R script. See the Help tab for more details.
write.table(labkey.data, file = "${tsvout:tsvfile}", sep = "\t", qmethod = "double", col.names=NA)
