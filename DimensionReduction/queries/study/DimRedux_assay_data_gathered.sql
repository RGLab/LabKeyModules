SELECT 
  Name,
  Label,
  timepoint,
  CAST( SPLIT_PART(timepoint, ' ', 1) AS DOUBLE) AS study_time_collected,
  SPLIT_PART(timepoint, ' ', 2) AS study_time_collected_unit,
  COUNT( participantId ) AS subjects,
  MAX (features) AS features
FROM 
  DimRedux_assay_data_computed
GROUP BY
  Name, Label, timepoint
ORDER BY
  Name ASC, study_time_collected_unit DESC, study_time_collected ASC
