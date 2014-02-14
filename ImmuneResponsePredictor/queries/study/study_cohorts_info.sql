SELECT DISTINCT
 GEM.arm_name AS cohort,
 GEM.SequenceNum AS timepoint,
 LCASE( GEF.study_time_collected_unit ) AS timepointUnit,
 GEA.analysis_accession,
 GEM.expression_matrix_accession
FROM
 hai,
 study.gene_expression_matrices AS GEM,
 lists.gene_expression_analysis AS GEA,
 gene_expression_files AS GEF
WHERE
 hai.subject_accession = GEM.subject_accession AND
 GEA.expression_matrix_accession = GEM.expression_matrix_accession AND
 GEA.description like CONCAT(CONCAT('%', SUBSTRING(CONVERT(GEM.SequenceNum, VARCHAR), 1, 1)), '%') AND
 GEM.SequenceNum > 0 AND
 GEM.biosample_accession = GEF.biosample_accession
