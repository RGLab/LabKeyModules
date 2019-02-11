DROP SCHEMA IF EXISTS flow_cytometry CASCADE;
CREATE SCHEMA flow_cytometry;

CREATE TABLE flow_cytometry.flow_cytometry_gating_set
(
    Container           ENTITYID    NOT NULL,
    key                 SERIAL      NOT NULL,
    analysis_accession  TEXT        NOT NULL,
    gating_set_file     TEXT        NOT NULL.
    workspace           TEXT        NOT NULL,
    num_samples         INT         NOT NULL,
    group_id            TEXT        NOT NULL,
    fw_version          TEXT        NOT NULL,
    created             TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT PK_flow_cytometry_gating_set PRIMARY KEY (key),
    CONSTRAINT UQ_flow_cytometry_gating_set UNIQUE (analysis_accession, Container)
);    
