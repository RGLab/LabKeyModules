SELECT
COUNT( DISTINCT subjectid) AS subject_count
FROM
  dimdemographic,
  lists.Studies
WHERE
  Name = study

