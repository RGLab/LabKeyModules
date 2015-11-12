SELECT DISTINCT
gef.SequenceNum,
gef.study_time_collected,
gef.study_time_collected_unit,
gef.ParticipantId AS ParticipantId,
gef.arm_name AS cohort,
gef.biosample_accession as biosample_accession @title='biosample_accession',
mat.container.entityid as container,
mat.Run,
mat.Run.featureset as featureset
FROM
assay.ExpressionMatrix.matrix.InputSamples AS mat,
study.gene_expression_files AS gef
WHERE
mat.biosample = gef.biosample_accession
