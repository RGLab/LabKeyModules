SELECT
    timepoint,
    timepointUnit,
    COUNT( cohort ) AS cohortCount
FROM
    IRP_all_hai
GROUP BY
    timepoint, timepointUnit
HAVING
    COUNT( cohort ) > 1
ORDER BY
    timepointUnit DESC, timepoint

