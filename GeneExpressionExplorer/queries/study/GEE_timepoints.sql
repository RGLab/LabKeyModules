SELECT
    timepoint,
    timepointUnit,
    COUNT( cohort_type ) AS cohortCount
FROM
    GEE_studyCohortsInfo
GROUP BY
    timepoint, timepointUnit
ORDER BY
    timepointUnit DESC, timepoint

