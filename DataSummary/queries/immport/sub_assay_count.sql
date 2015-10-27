SELECT
  assay_type,
  COUNT( DISTINCT subjectid) AS subject_count
FROM
(
  SELECT 
    assay AS assay_type,
    dimassay.subjectid AS subjectid,
    study
  FROM
    immport.dimassay,
    immport.dimdemographic,
    lists.Studies
  WHERE
    Name = study AND 
    dimdemographic.subjectid = dimassay.subjectid
) a
GROUP BY
  assay_type
