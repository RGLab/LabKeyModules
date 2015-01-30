SELECT DISTINCT
  GEM.arm_name AS cohort,
  GEM.timepoint,
  LCASE( GEM.timepointunit ) AS timepointUnit,
  analysis_accession
FROM
  (SELECT DISTINCT
    Biosample.arm_name AS arm_name,
    Biosample.study_time_collected AS timepoint,
    Biosample.study_time_collected_unit AS timepointunit,
    CAST(Biosample.study_time_collected AS VARCHAR(100)) || ' ' || LCASE(Biosample.study_time_collected_unit) AS coefficient,
    Run
  FROM
    assay.ExpressionMatrix.matrix.InputSamples
  WHERE
    Biosample.subject_accession IN
    (SELECT subject_accession from study.hai)
  ) AS GEM
LEFT JOIN gene_expression.gene_expression_analysis AS GEA
ON LCASE(GEA.coefficient)=GEM.coefficient AND GEA.arm_name=GEM.arm_name
