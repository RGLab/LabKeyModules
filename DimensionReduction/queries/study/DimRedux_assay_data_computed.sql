SELECT 
  RowId,
  ParticipantId,
  Name,
  Label,
  Timepoint,
  Features
FROM
-- Must use full path to access data held in /Studies 
  Project."DimensionReduction".DimRedux_Assay_Data_PreCompute
-- Then use IN filter to 'inherit' the global study/participant filter
WHERE 
  ParticipantId IN (SELECT ParticipantId from study.Participant)
