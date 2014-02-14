SELECT DISTINCT
 GEM.arm_name AS cohort,
 GEM.SequenceNum AS timepoint,
 LCASE( GEF.study_time_collected_unit ) AS timepointUnit,
 GEM.expression_matrix_accession
FROM
 hai,
 gene_expression_matrices AS GEM,
 gene_expression_files AS GEF
WHERE
 hai.subject_accession = GEM.subject_accession AND
 GEM.biosample_accession = GEF.biosample_accession
