SELECT DISTINCT
    GEM.arm_name AS cohort,
    GEM.study_time_collected AS timepoint,
    LCASE( GEM.study_time_collected_unit ) AS timepointUnit,
    GEM.Run AS expression_matrix_accession, --necessary for project level
    GEM.Run.featureSet.RowId AS featureSetId
FROM
    (   SELECT DISTINCT
            Biosample.arm_name,
            Biosample.study_time_collected,
            Biosample.study_time_collected_unit,
            Run
        FROM
            assay.ExpressionMatrix.matrix.InputSamples
        WHERE
            Biosample.participantId IN ( SELECT participantId from study.hai )
    ) AS GEM

