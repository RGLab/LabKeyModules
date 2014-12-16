SELECT DISTINCT
    GEM.arm_name AS cohort,
    GEM.study_time_collected AS timepoint,
    LCASE( GEM.study_time_collected_unit ) AS timepointUnit,
    GEA.analysis_accession,
    GEM.Run.DataOutputs.Name AS expression_matrix_accession
FROM
    (   SELECT DISTINCT
            Biosample.arm_name,
            Biosample.study_time_collected,
            Biosample.study_time_collected_unit,
            Run
        FROM
            assay.ExpressionMatrix.matrix.InputSamples
        WHERE
            Biosample.study_time_collected > 0 AND
            Biosample.subject_accession IN
        (   SELECT subject_accession from study.hai )
    ) AS GEM,
    (   SELECT DISTINCT
            analysis_accession,
            arm_name,
            CAST( REPLACE( coefficient, 'study_time_collected', '' ) AS DECIMAL ) AS study_time_collected
        FROM
            gene_expression.gene_expression_analysis
    ) AS GEA
WHERE
    GEM.arm_name = GEA.arm_name AND
    GEA.study_time_collected = GEM.study_time_collected

