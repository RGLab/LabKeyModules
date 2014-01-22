SELECT DISTINCT
 timepoint,
 CAST( timepoint AS INTEGER ) || ' ' || LCASE( biosample_accession.study_time_collected_unit ) AS displayTimepoint
FROM
 study_cohorts_info,
 expression_matrix_2_biosample_query
WHERE
 study_cohorts_info.expression_matrix_accession = expression_matrix_2_biosample_query.expression_matrix_accession
