SELECT
 R.analysis_accession,
 gem.description,
 ga.description AS analysis_description,
 R.feature_id,
 f2g.gene_symbol,
 round(R.log_fc,3) AS log_fc,
 round(R.ave_expr,3) AS ave_expr,
 round(R.statistic,3) AS statistic,
 round(R.p_value,4) AS p_value,
 round(R.adj_p_val,4) AS adj_p_val
FROM
 lists.features_2_genes f2g,
 lists.gene_expression_analysis_result_wide R,
 lists.gene_expression_reagents reagent,
 lists.gene_expression_analysis ga,
 lists.expression_matrix gem
WHERE 
 adj_p_val<0.2 AND
 gem.description like '%TIV%2007%' AND
 R.feature_id=f2g.feature_id AND
 f2g.gene_symbol!='NA' AND
 gem.expression_matrix_accession=ga.expression_matrix_accession AND
 ga.analysis_accession=R.analysis_accession order by p_value;
