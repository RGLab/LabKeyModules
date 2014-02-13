SELECT DISTINCT
 GEM.arm_name AS cohort,
 GEM.study_time_reported AS timepoint,
 GEM.expression_matrix_accession
FROM
 hai,
 study.gene_expression_matrices AS GEM
WHERE
 hai.subject_accession = GEM.subject_accession
