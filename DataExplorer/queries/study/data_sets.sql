SELECT
 DataSetId,
 Name,
 Label
FROM
 DataSets
WHERE
 CategoryId.Label = 'Assays' AND
 ShowByDefault = TRUE AND
 Name != 'fcs_analyzed_result' AND
 Name != 'hla_typing'

