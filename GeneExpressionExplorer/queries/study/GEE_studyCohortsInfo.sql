SELECT DISTINCT
  GEM.cohort AS cohort,
  GEM.study_time_collected AS timepoint,
  LCASE( GEM.study_time_collected_unit ) AS timepointUnit,
  GEM.Run AS expression_matrix_accession,
  GEM.featureset.RowId AS featureSetId
FROM
(
  SELECT DISTINCT
    cohort,
    study_time_collected,
    study_time_collected_unit,
    Run,
    featureset
  FROM
    study.HM_InputSamplesQuerySnapshot
  WHERE
    participantid IN ( SELECT participantid FROM study.hai )
) AS GEM
