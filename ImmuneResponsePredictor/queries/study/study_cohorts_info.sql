SELECT
 timepoint,
 timepointUnit,
 cohort
FROM
(
   SELECT DISTINCT
     Biosample.arm_name AS cohort,
     Biosample.study_time_collected AS timepoint,
     LCASE( Biosample.study_time_collected_unit ) AS timepointUnit
    FROM
     assay.ExpressionMatrix.matrix.InputSamples
    WHERE
     Biosample.subject_accession IN ( SELECT subject_accession from study.hai )
)
ORDER BY
 timepointUnit DESC, timepoint

