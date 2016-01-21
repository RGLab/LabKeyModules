SELECT
 *
FROM
 ISC_study_datasets
WHERE
 Category.Label IN ('Assays', 'Raw data files')

--UNION ALL
--
--SELECT
--  CASE
--    WHEN COUNT(*) > 0  THEN 'gene_expression_analysis_results'
--  END as name,
--  CASE
--    WHEN COUNT(*) > 0  THEN 'Gene expression'
--  END as label
--FROM
--  assay.ExpressionMatrix.matrix.Runs
--AS GE
--)
--WHERE Name IS NOT NULL
