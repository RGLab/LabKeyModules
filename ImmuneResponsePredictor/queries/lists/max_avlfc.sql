PARAMETERS( AA VARCHAR )
SELECT
 MAX( ABS( log_fc ) ) AS max_avlfc
FROM
 gene_expression_analysis_result_wide
WHERE
 analysis_accession = AA
