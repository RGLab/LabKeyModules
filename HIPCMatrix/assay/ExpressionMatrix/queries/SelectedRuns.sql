SELECT *
FROM Runs
WHERE Folder IN (SELECT Container FROM study.participant)
