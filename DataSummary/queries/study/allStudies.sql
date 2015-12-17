SELECT DISTINCT
 CAST( REPLACE( Container.Name, 'SDY', '' ) AS INTEGER ) AS Num
FROM
 StudyProperties
WHERE
 Container.Name LIKE 'SDY%' AND
 Container.Name != 'SDY_template'
ORDER BY
 Num

