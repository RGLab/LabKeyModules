SELECT DISTINCT
arm_name AS cohort
FROM
assay.ExpressionMatrix.matrix.InputDatas AS matrix,
gene_expression_files
WHERE
matrix.Data.Name = gene_expression_files.file_info_name
