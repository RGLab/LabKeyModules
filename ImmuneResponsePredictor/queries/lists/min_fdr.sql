PARAMETERS( AA VARCHAR )
SELECT
 MIN( adj_p_val ) AS min_fdr
FROM
 gene_expression_analysis_result_wide
WHERE
 analysis_accession = AA
