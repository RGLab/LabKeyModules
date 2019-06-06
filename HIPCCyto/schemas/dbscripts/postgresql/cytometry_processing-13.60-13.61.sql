DROP SCHEMA IF EXISTS cytometry_processing CASCADE;
CREATE SCHEMA cytometry_processing;

CREATE TABLE cytometry_processing.gatingSetMetaData
(
    Container           ENTITYID    NOT NULL,
    key                 SERIAL      NOT NULL,
    gating_set          TEXT        NOT NULL,
    workspace           TEXT        NOT NULL,
    wsid                TEXT        NOT NULL,
    group_id            TEXT        NOT NULL,
    group_name          TEXT        NOT NULL,
    num_samples         TEXT        NOT NULL,
    num_unique_days     TEXT        NOT NULL,
    num_unique_trt      TEXT        NOT NULL,
    num_unique_tube     TEXT        NOT NULL,
    panels              TEXT        NOT NULL,
    fw_version          TEXT        NOT NULL,
    study               TEXT        NOT NULL,
    created             TEXT        NOT NULL,

    CONSTRAINT PK_gatingSetMetaData PRIMARY KEY (key),
    CONSTRAINT UQ_gatingSetMetaData UNIQUE (Container, gating_set)
);

CREATE TABLE cytometry_processing.gatingSetInputFiles
(
    Container           ENTITYID    NOT NULL,
    key                 SERIAL      NOT NULL,
    file_info_name      TEXT        NOT NULL,
    ParticipantId       TEXT        NOT NULL,
    biosample_accession TEXT        NOT NULL,
    expsample_accession TEXT        NOT NULL,
    study_accession     TEXT        NOT NULL,
    wsid                TEXT        NOT NULL,
    gating_set          TEXT        NOT NULL,
    gsdir               TEXT        NOT NULL, 
    
    CONSTRAINT PK_gatingSetInputFiles PRIMARY KEY (key)
--    CONSTRAINT FK_gatingSetInputFiles_gatingSetMetaData FOREIGN KEY (Container, gating_set)
--        REFERENCES cytometry_processing.gatingSetMetaData (Container, gating_set)
--        ON DELETE CASCADE
);

