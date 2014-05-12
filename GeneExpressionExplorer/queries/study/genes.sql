SELECT DISTINCT
 GeneSymbol AS gene_symbol
FROM
 Microarray.FeatureAnnotation
WHERE
 GeneSymbol NOT LIKE '%///%'

