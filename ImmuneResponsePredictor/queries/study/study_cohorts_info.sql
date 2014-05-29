SELECT DISTINCT
 Biosample.arm_name AS cohort,
 Biosample.study_time_collected AS timepoint,
 LCASE( Biosample.study_time_collected_unit ) AS timepointUnit,
 GEA.analysis_accession,
 Run.DataOutputs.Name AS expression_matrix_accession
FROM
 study.hai,
 assay.ExpressionMatrix.matrix.InputSamples AS GEM,
 lists.gene_expression_analysis AS GEA
WHERE
 hai.SUBJECT_ACCESSION = Biosample.subject_accession AND
 GEA.expression_matrix = GEM.Run.DataOutputs.Name AND
 GEA.timepoint = Biosample.study_time_collected AND
 Biosample.study_time_collected > 0

