SELECT DISTINCT
  InputSamples_computed.Biosample.biosample_accession AS Biosample,
  InputSamples_computed.Biosample.participantId,
  InputSamples_computed.Biosample.study_time_collected,
  InputSamples_computed.Biosample.study_time_collected_unit,
  features,
  featureSet,
  rwf.runId AS run
FROM
  InputSamples_computed 
JOIN (
  SELECT
    currFeatures AS features,
    Runs.featureSet AS featureSet,
    Runs.RowId AS runId
  FROM
    Runs
  JOIN
    Microarray.fasMapWithFeatures
  ON
    Runs.featureSet = origId ) AS rwf
ON
  InputSamples_computed.Run = rwf.runId
WHERE
  -- enforce samples only in /Studies, not /HIPC
  InputSamples_computed.Folder.Parent = 'abbde7af-5b0b-1033-8f62-e818307f16dd'
