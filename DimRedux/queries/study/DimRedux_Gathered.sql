SELECT
    Name,
    Label,
    GROUP_CONCAT(DISTINCT (study_time_collected || ' ' || study_time_collected_unit), ';') AS Timepoints
FROM
    DimRedux_data_sets
GROUP BY
    Name, Label
