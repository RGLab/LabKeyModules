SELECT
  Name,
  Label
FROM
  DataSets
WHERE
  CategoryId.Label = 'Assays' AND
  ShowByDefault = TRUE AND
  Name != 'hla_typing'

