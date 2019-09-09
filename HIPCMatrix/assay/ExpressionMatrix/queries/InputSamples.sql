SELECT
  MI.TargetProtocolApplication.Run,
  MI.TargetProtocolApplication,
  MI.Material,
  MI.Material.Name AS Biosample,
  MI.Role,
  -- NOTE:  "Folder" will be copied into InputSamples_precompute as the "source_container" column
  -- and then into InputSamples_computed as the "Folder" column again
  MI.TargetProtocolApplication.Run.Folder as Folder
FROM exp.MaterialInputs MI
WHERE
  MI.TargetProtocolApplication.Type = 'ExperimentRun'
  -- only show Runs for the current protocol
  --AND MI.TargetProtocolApplication.Run.RowId IN (SELECT RowId FROM Runs)
  AND EXISTS (SELECT RowId FROM Runs Where RowId=MI.TargetProtocolApplication.Run.RowId)
