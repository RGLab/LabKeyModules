ALTER TABLE gene_expression.gene_expression_analysis DROP COLUMN IF EXISTS arm_accession;
ALTER TABLE gene_expression.gene_expression_analysis ADD COLUMN arm_accession VARCHAR(15);
