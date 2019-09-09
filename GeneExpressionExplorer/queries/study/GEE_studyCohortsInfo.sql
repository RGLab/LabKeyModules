SELECT DISTINCT
    cohort,
    cohort_type,
    cohort_type || ' (' || container.Name || ')' AS display,
    study_time_collected AS timepoint,
    LCASE( study_time_collected_unit ) AS timepointUnit,
    expression_matrix_accession,
    Run,
    featureset.RowId AS featureSetId
FROM
    HM_InputSamplesQuery
WHERE
    participantid IN ( SELECT participantid FROM study.hai )

