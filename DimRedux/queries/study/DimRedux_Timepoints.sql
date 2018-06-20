SELECT 
   GROUP_CONCAT(DISTINCT (study_time_collected || ' ' || study_time_collected_unit), ';') AS Timepoints
FROM 
    DimRedux_data_sets
GROUP BY
    study_time_collected, study_time_collected_unit 
ORDER BY
    study_time_collected_unit DESC, study_time_collected ASC
