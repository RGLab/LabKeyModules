DROP SCHEMA IF EXISTS analyte_explorer CASCADE;
CREATE SCHEMA analyte_explorer;

CREATE TABLE analyte_explorer.blood_transcription_modules
(
    id                              INT         NOT NULL,
    name                            TEXT        NOT NULL,
    genes                           TEXT        NOT NULL,
    matched_gene_ontology_terms     TEXT        NOT NULL,
    number_of_genes                 INT         NOT NULL,
    module_category                 TEXT,

    CONSTRAINT PK_blood_transcription_modules PRIMARY KEY (id)
);

CREATE TABLE analyte_explorer.gene_signatures
(
    id                              INT         NOT NULL,
    genes                           TEXT        NOT NULL,
    disease_studied                 TEXT        NOT NULL,
    response_behavior               TEXT        NOT NULL,
    timepoint_with_units            TEXT        NOT NULL,
    publication_reference           TEXT        NOT NULL,
    subgroup                        TEXT        NOT NULL,
    comparison                      TEXT        NOT NULL,
    cohort                          TEXT        NOT NULL,

    CONSTRAINT PK_gene_signatures PRIMARY KEY (id)
);

CREATE TABLE analyte_explorer.gene_expression
(
    id                              INT                     NOT NULL,
    cohort                          TEXT                    NOT NULL,
    sample_type                     TEXT                    NOT NULL,
    study_accession                 TEXT                    NOT NULL,
    condition                       TEXT                    NOT NULL,
    timepoint                       FLOAT                   NOT NULL,
    analyte_id                      TEXT                    NOT NULL,
    analyte_type                    TEXT                    NOT NULL,
    mean_fold_change                DOUBLE PRECISION,
    sd_fold_change                  DOUBLE PRECISION,
    
    CONSTRAINT PK_gene_expression PRIMARY KEY (id)
);