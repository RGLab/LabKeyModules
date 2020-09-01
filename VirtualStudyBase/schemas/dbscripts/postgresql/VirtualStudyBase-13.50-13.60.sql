CREATE SCHEMA IF NOT EXISTS VirtualStudyBase;
DROP TABLE IF EXISTS VirtualStudyBase.InputSamples_precompute;
CREATE TABLE VirtualStudyBase.InputSamples_precompute
(
    Container                    ENTITYID   NOT NULL,
    RowId                        BIGSERIAL  NOT NULL,
    Source_Container             VARCHAR    NOT NULL,
    Run                          INT        NOT NULL,
    TargetProtocolApplication    INT        NOT NULL,
    Material                     INT        NOT NULL,
    Biosample                    VARCHAR    NOT NULL,
    Role                         VARCHAR    NOT NULL,

    CONSTRAINT PK_InputSamples_precompute PRIMARY KEY (RowId)
);
