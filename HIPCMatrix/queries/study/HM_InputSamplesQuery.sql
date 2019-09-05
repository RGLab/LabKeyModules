SELECT DISTINCT
gef.SequenceNum,
gef.study_time_collected,
gef.study_time_collected_unit,
gef.ParticipantId AS ParticipantId,
gef.arm_name AS cohort,
gef.arm_name || '_' || gef.type AS cohort_type,
gef.biosample_accession as biosample_accession @title='biosample_accession',
mat.container.entityid as container,
mat.Run,
runs.Name AS expression_matrix_accession,
runs.featureset as featureset
FROM
hipcmatrix.InputSamples_precompute AS mat,
study.gene_expression_files AS gef,
assay.ExpressionMatrix.matrix.Runs AS runs
WHERE
mat.biosample = gef.biosample_accession AND
mat.run = runs.rowId

