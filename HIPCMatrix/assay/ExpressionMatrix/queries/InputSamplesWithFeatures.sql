SELECT
  subject_accession || '.' || SPLIT_PART(study_accession, 'SDY', 2) AS participantId,
  biosample_accession AS Biosample,
  study_time_collected,
  study_time_collected_unit,
  featureSet,
  features
FROM
  immport.biosample
JOIN (
  SELECT
    Biosample,
    featureSet,
    currFeatures AS features
  FROM
    Microarray.fasMapWithFeatures
  JOIN (
    SELECT
      Inputs.Biosample,
      featureSet
    FROM 
      Runs
    JOIN (
      SELECT
        MI.TargetProtocolApplication.Run.RowId AS Row,
        MI.TargetProtocolApplication.Run,
        MI.TargetProtocolApplication,
        MI.Material.Name AS Biosample,
      FROM exp.MaterialInputs AS MI
      WHERE MI.TargetProtocolApplication.Type = 'ExperimentRun' ) AS Inputs
    ON RowId = Inputs.Row ) AS Smpls
  ON origId = Smpls.featureSet ) spf
ON biosample_accession = spf.Biosample
