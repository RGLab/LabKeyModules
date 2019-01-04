SELECT DISTINCT
  timepoint,
  study_time_collected,
  study_time_collected_unit
FROM
  DimRedux_assay_data_gathered
WHERE
  -- Excluding timepoints with decimal because of conflict in .js grid
  timepoint NOT LIKE '%\.%' ESCAPE '\'
ORDER BY
  study_time_collected_unit DESC, study_time_collected ASC
