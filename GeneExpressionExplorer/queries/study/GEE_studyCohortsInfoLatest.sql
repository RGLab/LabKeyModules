SELECT 
    geeCohorts.cohort,
    geeCohorts.display,
    geeCohorts.timepoint,
    geeCohorts.timepointUnit,
    geeCohorts.expression_matrix_accession,
    geeCohorts.Run,
    lfas.latestId AS featureSetId
FROM (
    SELECT DISTINCT
        cohort,
        cohort || ' (' || Containers.Name || ')' AS display,
        study_time_collected AS timepoint,
        LCASE( study_time_collected_unit ) AS timepointUnit,
        expression_matrix_accession,
        Run,
        featureset.RowId AS featureSetId
    FROM
        HM_InputSamplesQuery
    JOIN
        core.Containers ON HM_InputSamplesQuery.container = Containers.EntityId
    WHERE
        participantid IN ( SELECT participantid FROM study.hai )
    ) as geeCohorts
JOIN microarray.latestFAS AS lfas ON lfas.featureset = geeCohorts.featureSetId
