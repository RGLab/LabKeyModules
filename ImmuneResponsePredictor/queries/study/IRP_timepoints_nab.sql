SELECT
    timepoint,
    timepointUnit,
    COUNT( cohort_type ) AS cohortCount
FROM
    IRP_all_neut_ab_titer
GROUP BY
    timepoint, timepointUnit
HAVING
    COUNT( cohort_type ) > 1
ORDER BY
    timepointUnit DESC, timepoint

