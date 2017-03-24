SELECT
  Name,
  Label
FROM
  ISC_study_datasets
WHERE
  Category.Label = 'Assays' AND
  Name != 'hla_typing'

