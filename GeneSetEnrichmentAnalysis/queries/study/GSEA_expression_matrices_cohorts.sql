SELECT DISTINCT
    arm_name AS cohort, arm_name || ' (' || container.Name || ')' AS studyCohort
FROM
    gene_expression.gene_expression_analysis
WHERE arm_accession IN
    (   SELECT DISTINCT
            arm_accession
        FROM
            study.cohort_membership
    )

