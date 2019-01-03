SELECT 
  Name,
  Label,
  GROUP_CONCAT(DISTINCT Timepoint, ';') AS Timepoints
FROM 
  DimRedux_assay_data_gathered
GROUP BY
  Name, Label
