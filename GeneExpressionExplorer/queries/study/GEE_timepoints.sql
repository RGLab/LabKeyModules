SELECT
    timepoint,
    timepointUnit,
    COUNT( cohort ) AS cohortCount
FROM
    GEE_studyCohortsInfoLatest
GROUP BY
    timepoint, timepointUnit
ORDER BY
    timepointUnit DESC, timepoint

