SELECT
  MI.TargetProtocolApplication.Run,
  MI.TargetProtocolApplication,
  MI.Material,
  MI.Material.Name AS Biosample,
  MI.Role
FROM exp.MaterialInputs MI
WHERE
  MI.TargetProtocolApplication.Type = 'ExperimentRun'
  -- only show Runs for the current protocol
  AND MI.TargetProtocolApplication.Run.RowId IN (SELECT RowId FROM Runs)
