SELECT
 COUNT( DISTINCT subject_accession ) AS subject_count
FROM
 summarySubjectAssayStudy, study.studies
WHERE
 Name = study_accession
