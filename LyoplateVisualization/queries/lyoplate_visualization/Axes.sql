SELECT DISTINCT
 x_key  AS Key,
 x_axis AS Display,
 gsid   AS AnalysisId
FROM
 projections
WHERE
 x_key  != ' ' AND
 x_axis != 'Time'
UNION
SELECT DISTINCT
 y_key  AS Key,
 y_axis AS Display,
 gsid   AS AnalysisId
FROM
 projections
WHERE
 y_key  != ' ' AND
 y_axis != 'Time'
