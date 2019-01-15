SELECT DISTINCT
  InputSamples.Biosample.biosample_accession AS Biosample,
  InputSamples.Biosample.participantId,
  InputSamples.Biosample.study_time_collected,
  InputSamples.Biosample.study_time_collected_unit,
  features,
  featureSet,
  rwf.runId AS run
FROM
  InputSamples
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
  InputSamples.Run = rwf.runId
WHERE
  -- enforce samples only in /Studies, not /HIPC
  InputSamples.Folder.Parent = 'abbde7af-5b0b-1033-8f62-e818307f16dd'
