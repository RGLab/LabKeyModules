SELECT
    assay AS assay_type,
    COUNT( DISTINCT subjectid ) AS subject_count
FROM
(
  SELECT 
    assay,
    dimassay.subjectid AS subjectid,
    study
  FROM
    dimassay,
    dimdemographic,
    lists.Studies
  WHERE
    Name = study AND 
    dimdemographic.subjectid = dimassay.subjectid
) a
GROUP BY
    assay

