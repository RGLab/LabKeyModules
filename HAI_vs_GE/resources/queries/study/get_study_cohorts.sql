SELECT DISTINCT
  gene_expression_matrices.matrix_description.description AS cohort
FROM
  hai,
  gene_expression_matrices
WHERE
  hai.subject_accession = gene_expression_matrices.subject_accession
