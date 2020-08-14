-- View of InputSamples_precompute in assay.ExpressionMatrix.matrix
-- so container filters can be applied and additional columns defined
-- in qview.xml from the Runs table will show up

SELECT 
  RowId,
  Run,
  TargetProtocolApplication,
  Material,
  Biosample,
  Role,
  Source_Container AS folder
FROM
-- Only want to work within each virtual study, not at project level
-- as in /Studies
  virtualstudybase.InputSamples_precompute
