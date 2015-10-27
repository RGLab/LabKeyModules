SELECT
COUNT( DISTINCT subjectid) AS subject_count
FROM
  immport.dimdemographic,
  lists.Studies
WHERE
  Name = study

