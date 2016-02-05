SELECT
    timepoint,
    timepointUnit,
    COUNT( cohort ) AS cohortCount
FROM
    IRP_all
GROUP BY
    timepoint, timepointUnit
ORDER BY
    timepointUnit DESC, timepoint

