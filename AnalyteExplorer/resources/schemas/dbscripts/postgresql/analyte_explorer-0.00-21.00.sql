DROP SCHEMA IF EXISTS analyte_explorer CASCADE;
CREATE SCHEMA analyte_explorer;

CREATE TABLE analyte_explorer.blood_transcript_modules
(
    id                              INT         NOT NULL,
    module_name                     TEXT        NOT NULL,
    genes                           TEXT,
    matched_gene_ontology_terms     TEXT        NOT NULL,
    number_of_genes                 INT         NOT NULL,
    module_category                 TEXT,

    CONSTRAINT PK_blood_transcript_modules PRIMARY KEY (id)
);

CREATE TABLE analyte_explorer.gene_signatures
(
    id                              INT         NOT NULL,
    uid                             TEXT        NOT NULL,
    subgroup                        TEXT        NOT NULL,
    comparison                      TEXT        NOT NULL,
    cohort                          TEXT        NOT NULL,
    publication_reference           TEXT        NOT NULL,
    disease_studied                 TEXT        NOT NULL,
    updated_symbols                 TEXT        NOT NULL,
    updated_response_behavior       TEXT        NOT NULL,
    pubmed_titles                   TEXT        NOT NULL,
    timepoint_concat                TEXT        NOT NULL,
    
    CONSTRAINT PK_gene_signatures PRIMARY KEY (id)
);

CREATE TABLE analyte_explorer.gene_expression
(
    id                              INT                     NOT NULL,
    cohort                          TEXT                    NOT NULL,
    cell_type                       TEXT                    NOT NULL,
    study                           TEXT                    NOT NULL,
    mapped_condition                TEXT                    NOT NULL,
    timepoint                       FLOAT                   NOT NULL,
    analyte                         TEXT                    NOT NULL,
    mean_fold_change                DOUBLE PRECISION,
    sd_fold_change                  DOUBLE PRECISION,
    feature                         TEXT                    NOT NULL,
    
    CONSTRAINT PK_gene_expression PRIMARY KEY (id)
);