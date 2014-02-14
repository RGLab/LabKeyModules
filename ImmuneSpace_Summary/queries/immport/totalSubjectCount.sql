SELECT
 COUNT( DISTINCT subject_accession ) AS subject_count
FROM
 v_results_union, study.studies
WHERE
 Name = study_accession
