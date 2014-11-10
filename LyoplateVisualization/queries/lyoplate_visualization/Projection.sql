SELECT
 x_axis || ' / ' || y_axis  AS Projection,
 gsid                       AS AnalysisId,
 path                       AS Path,
 index                      AS Index
FROM
 projections
WHERE
 y_key != ' '
