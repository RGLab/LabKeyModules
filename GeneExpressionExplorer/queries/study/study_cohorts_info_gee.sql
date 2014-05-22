SELECT DISTINCT
 Biosample.arm_name AS cohort,
 Biosample.study_time_collected AS timepoint,
 LCASE( Biosample.study_time_collected_unit ) AS timepointUnit,
 Run.DataOutputs.Name AS expression_matrix_accession,
 Run.featureSet.RowId AS featureSetId
FROM
 study.hai,
 assay.ExpressionMatrix.matrix.InputSamples
WHERE
 hai.SUBJECT_ACCESSION = Biosample.SUBJECT_ACCESSION

