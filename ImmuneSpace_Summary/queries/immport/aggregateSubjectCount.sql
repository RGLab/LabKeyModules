SELECT
 assay AS assay_type,
 CAST( SUM( subject_count ) AS INTEGER ) AS subject_count
FROM
(
  SELECT
   assay,
   study_accession,
   COUNT( DISTINCT subject_accession ) AS subject_count
  FROM
   v_results_union, study.studies
  WHERE
   Name = study_accession
  GROUP BY
   assay,
   study_accession
  ) a
GROUP BY
 assay
