 SELECT DISTINCT
    arm_accession,
    cohort,
    cohort_type,
    CASE WHEN C.Name IS NULL THEN cohort_type ELSE (cohort_type || ' (' || C.Name || ')') END AS display,
    study_time_collected AS timepoint,
    LCASE( study_time_collected_unit ) AS timepointUnit,
    expression_matrix_accession,
    Run,
    featureset.RowId AS featureSetId
FROM
    HM_InputSamplesQuery LEFT OUTER JOIN core.containers C on container = C.entityId
WHERE
    participantid IN ( SELECT participantid FROM study.hai )
