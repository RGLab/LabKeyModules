SELECT
 Label, Id, Name
FROM
 ISC_study_datasets
WHERE
 Category.Label IN ('Assays')
ORDER BY Name ASC
