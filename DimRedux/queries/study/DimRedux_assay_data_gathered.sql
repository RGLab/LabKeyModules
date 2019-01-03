SELECT 
  Name,
  Label,
  timepoint,
  COUNT( participantId ) AS subjects,
  MAX (features) AS features
FROM 
  DimRedux_assay_data
GROUP BY
  Name, Label, timepoint
ORDER BY
  Name ASC, timepoint ASC
