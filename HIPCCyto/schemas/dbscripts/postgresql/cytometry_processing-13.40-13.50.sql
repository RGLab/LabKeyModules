DROP SCHEMA IF EXISTS cytometry_processing;
CREATE SCHEMA cytometry_processing;

CREATE TABLE cytometry_processing.gatingSetInputFiles
(
    Container           ENTITYID    NOT NULL,
    key                 SERIAL      NOT NULL,
    file_info_name      TEXT        NOT NULL,
    ParticipantId       TEXT        NOT NULL,
    biosample_accession TEXT        NOT NULL,
    expsample_accession TEXT        NOT NULL,
    study_accession     TEXT        NOT NULL,
    gsdir               TEXT        NOT NULL,
    
    CONSTRAINT PK_gatingSetInputFiles PRIMARY KEY (key),
    CONSTRAINT UQ_gatingSetInputFiles UNIQUE (file_info_name, Container)
);    
