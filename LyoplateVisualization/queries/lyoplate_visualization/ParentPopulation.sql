SELECT DISTINCT
 path   AS Path,
 index  AS Index,
 gsid   AS AnalysisId
FROM
 projections
WHERE
 y_key != ' '
