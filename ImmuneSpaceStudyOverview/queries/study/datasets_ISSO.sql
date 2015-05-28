SELECT
 *
FROM
(
 SELECT
  Name,
  Label
 FROM
  DataSets
 WHERE
  CategoryId.Label = 'Assays' AND
  ShowByDefault = TRUE

UNION ALL

SELECT
  CASE
    WHEN COUNT(*) > 0  THEN 'gene_expression_analysis_results'
  END as name,
  CASE
    WHEN COUNT(*) > 0  THEN 'Gene expression'
  END as label
FROM
  assay.ExpressionMatrix.matrix.Runs
AS GE
)
WHERE Name IS NOT NULL
