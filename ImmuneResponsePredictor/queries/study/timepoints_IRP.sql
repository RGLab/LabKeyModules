SELECT
 timepoint,
 timepointUnit,
 COUNT( cohort ) AS cohortCount
FROM
(
  SELECT DISTINCT
    cohort,
    study_time_collected AS timepoint,
    LCASE( study_time_collected_unit ) AS timepointUnit
  FROM
    study.HM_InputSamplesQuerySnapshot
) AS HM_IS
GROUP BY
 timepoint, timepointUnit
ORDER BY
 timepointUnit DESC, timepoint

