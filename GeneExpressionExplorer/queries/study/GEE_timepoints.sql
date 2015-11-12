SELECT
    timepoint,
    timepointUnit
FROM
(
    SELECT DISTINCT
        cohort,
        study_time_collected AS timepoint,
        LCASE( study_time_collected_unit ) AS timepointUnit
    FROM
        study.HM_InputSamplesQuerySnapshot
    WHERE
        participantId IN ( SELECT participantId from study.hai )
) AS HM_IS
GROUP BY
    timepoint, timepointUnit
ORDER BY
    timepointUnit DESC, timepoint

