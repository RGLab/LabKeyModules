SELECT
*,
Name || '.tsv' AS download_link,
Folder.EntityId AS Container
FROM
Runs
WHERE
Runs.Folder IN (SELECT Container FROM study.participant)
AND Runs.cohort IN (SELECT name FROM study.cohort_membership)
