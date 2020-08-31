SELECT DISTINCT
  InputSamplesWithParent.Biosample,
  InputSamplesWithParent.participantId,
  InputSamplesWithParent.study_time_collected,
  InputSamplesWithParent.study_time_collected_unit,
  rwf.features,
  rwf.featureSet,
  rwf.runId AS run
FROM (
   SELECT DISTINCT
     InputSamples_computed.Biosample.biosample_accession AS Biosample,
     InputSamples_computed.Biosample.participantId,
     InputSamples_computed.Biosample.study_time_collected,
     InputSamples_computed.Biosample.study_time_collected_unit,
     InputSamples_computed.Run,
     C.Parent AS folder_parent
   FROM
     InputSamples_computed 
   LEFT OUTER JOIN
     core.containers AS C
   ON
     folder = C.entityId ) AS InputSamplesWithParent
LEFT OUTER JOIN (
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
  InputSamplesWithParent.Run = rwf.runId
WHERE
  -- enforce samples only in /Studies, not /HIPC
  InputSamplesWithParent.folder_parent = 'abbde7af-5b0b-1033-8f62-e818307f16dd'
