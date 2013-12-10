SELECT DISTINCT
 GEM.matrix_description.description AS cohort,
 GEM.study_time_reported AS timepoint,
 GEA.analysis_accession,
 GEA.description,
 GEM.expression_matrix_accession
FROM
 hai,
 study.gene_expression_matrices AS GEM,
 lists.gene_expression_analysis AS GEA
WHERE
 hai.subject_accession = GEM.subject_accession AND
 GEA.expression_matrix_accession = GEM.expression_matrix_accession AND
 GEA.description like CONCAT(CONCAT('%', SUBSTRING(CONVERT(GEM.study_time_reported, VARCHAR), 1, 1)), '%') AND
 GEM.study_time_reported > 0
