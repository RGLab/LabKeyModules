SELECT
 Container.EntityId,
 Container.Name
FROM
 StudyProperties
WHERE
 Container.Name LIKE 'SDY%'
