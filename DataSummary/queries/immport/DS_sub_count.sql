SELECT
COUNT( DISTINCT subjectid) AS subject_count
FROM
  immport.dimdemographic,
  study.allStudies
WHERE
  Name = study

