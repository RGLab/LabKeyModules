SELECT
 timepoint,
 timepointUnit,
 COUNT( cohort ) AS cohortCount
FROM
(
   SELECT DISTINCT
     Biosample.arm_name AS cohort,
     Biosample.study_time_collected AS timepoint,
     LCASE( Biosample.study_time_collected_unit ) AS timepointUnit
    FROM
     assay.ExpressionMatrix.matrix.InputSamples
    WHERE
     Biosample.participantId IN ( SELECT participantId from study.hai )
)
GROUP BY
 timepoint, timepointUnit
ORDER BY
 timepointUnit DESC, timepoint

