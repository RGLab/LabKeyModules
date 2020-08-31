SELECT
  DI.TargetProtocolApplication.Run,
  DI.TargetProtocolApplication,
  DI.Data,
  DI.Role
FROM
  exp.DataInputs DI
WHERE
    DI.TargetProtocolApplication.Type = 'ExperimentRunOutput'
    -- only show Runs for the current protocol
    AND DI.TargetProtocolApplication.Run.RowId IN (SELECT RowId FROM Runs)
    AND DI.Role NOT IN ('log')

