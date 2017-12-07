SELECT DISTINCT
  GEM.cohort AS cohort,
  GEM.timepoint AS timepoint,
  LCASE( GEM.timepointUnit ) AS timepointUnit,
  analysis_accession
FROM
(
  SELECT DISTINCT
    cohort,
    study_time_collected AS timepoint,
    study_time_collected_unit AS timepointUnit,
    CAST(study_time_collected AS VARCHAR(100)) || ' ' || LCASE(study_time_collected_unit) AS coefficient,
    Run
  FROM
    study.HM_InputSamplesQuery
  WHERE
    participantid IN ( SELECT participantid FROM study.neut_ab_titer )
) AS GEM
LEFT JOIN gene_expression.gene_expression_analysis AS GEA
ON LCASE(GEA.coefficient) = GEM.coefficient AND GEA.arm_name = GEM.cohort
