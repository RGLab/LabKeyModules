SELECT
 Label, Id
FROM
 ISC_study_datasets
WHERE
 Category.Label IN ('Assays', 'Raw data files')

