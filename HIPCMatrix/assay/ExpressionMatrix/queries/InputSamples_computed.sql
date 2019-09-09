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
-- Must use full path to access data held in /Studies 
  Project."hipcmatrix".InputSamples_precompute
