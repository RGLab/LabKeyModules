DROP SCHEMA IF EXISTS gene_expression CASCADE;
CREATE SCHEMA gene_expression;

CREATE TABLE gene_expression.gene_expression_analysis
(
    Container           ENTITYID    NOT NULL,
    analysis_accession  TEXT        NOT NULL,
    expression_matrix   TEXT        NOT NULL,
    arm_name            TEXT        NOT NULL,
    coefficient         TEXT        NOT NULL,
    description         TEXT,
    created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT PK_gene_expression_analysis PRIMARY KEY (analysis_accession)
);

CREATE TABLE gene_expression.gene_expression_analysis_results
(
    Container           ENTITYID    NOT NULL,
    key                 SERIAL      NOT NULL,
    analysis_accession  TEXT        NOT NULL,
    feature_id          TEXT,
    gene_symbol         TEXT,
    adj_p_val           DECIMAL(10,3),
    ave_expr            DECIMAL(10,3),
    log_fc              DECIMAL(10,3),
    p_value             DECIMAL(10,3),
    statistic           DECIMAL(10,3),
    created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT PK_gene_expression_analysis_results PRIMARY KEY (key),
    CONSTRAINT FK_gene_expression_analysis_results_gene_expression_analysis FOREIGN KEY (analysis_accession)
        REFERENCES gene_expression.gene_expression_analysis (analysis_accession)
        ON DELETE CASCADE
);
