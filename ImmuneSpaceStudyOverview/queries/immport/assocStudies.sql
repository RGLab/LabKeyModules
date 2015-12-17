PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT DISTINCT
  study_pubmed.study_accession
FROM
  study.studyproperties AS SP,
  study_pubmed,
  (
  SELECT
    pubmed_id AS cpid,
    study_accession AS csa
  FROM
    study_pubmed
  WHERE
    study_accession = $STUDY
  )
AS curr
WHERE
  curr.cpid = study_pubmed.pubmed_id AND
  study_pubmed.study_accession != curr.csa AND
  SP.label = study_pubmed.study_accession
