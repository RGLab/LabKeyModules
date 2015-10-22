SELECT DISTINCT
  arm_name AS cohort
FROM
  gene_expression.gene_expression_analysis
WHERE arm_accession in (select distinct arm_accession from study.cohort_membership)
