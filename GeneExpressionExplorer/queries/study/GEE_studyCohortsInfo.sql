SELECT DISTINCT
    cohort,
    cohort || ' (' || container.Name || ')' AS display,
    study_time_collected AS timepoint,
    LCASE( study_time_collected_unit ) AS timepointUnit,
    expression_matrix_accession,
    Run,
    featureset.RowId AS featureSetId
FROM
    study.HM_InputSamplesQuerySnapshot
WHERE
    participantid IN ( SELECT participantid FROM study.hai )

