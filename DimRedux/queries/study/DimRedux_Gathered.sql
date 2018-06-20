SELECT
    Name,
    Label,
    GROUP_CONCAT(DISTINCT Timepoint, ';') AS Timepoints
FROM
    DimRedux_data_sets
GROUP BY
    Name, Label
