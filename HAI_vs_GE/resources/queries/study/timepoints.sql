PARAMETERS( COHORT_VALUE VARCHAR )
SELECT DISTINCT
 timepoint,
 timepoint || ' ' || LCASE( biosample_accession.study_time_collected_unit ) AS displayTimepoint
FROM
 study_cohorts_info,
 expression_matrix_2_biosample_query
WHERE
 cohort = COHORT_VALUE AND
 study_cohorts_info.expression_matrix_accession = expression_matrix_2_biosample_query.expression_matrix_accession
