SELECT DISTINCT
 GEM.Biosample.arm_name AS cohort,
 GEM.Biosample.study_time_collected AS timepoint,
 GEM.Biosample.study_time_collected_unit AS timepointUnit,
 GEA.analysis_accession,
 GEM.Run.DataOutputs.Name AS expression_matrix_accession
FROM
 assay.ExpressionMatrix.matrix.InputSamples AS GEM,
 gene_expression.gene_expression_analysis AS GEA,
 study.hai AS HAI
WHERE
 HAI.SUBJECT_ACCESSION = GEM.Biosample.subject_accession AND
 GEM.Biosample.arm_name = GEA.arm_name AND
 GEM.Biosample.study_time_collected > 0 AND
 CAST(REPLACE( GEA.coefficient, 'study_time_collected', '') AS INTEGER) = GEM.Biosample.study_time_collected

