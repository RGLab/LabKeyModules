CREATE SCHEMA IF NOT EXISTS HIPCMatrix;
CREATE TABLE IF NOT EXISTS HIPCMatrix.InputSamples_precompute
(
    Run                          INT        NOT NULL,
    RowId               BIGSERIAL   NOT NULL,
    TargetProtocolApplication    INT        NOT NULL,
    Material                     INT        NOT NULL,
    Biosample                    VARCHAR    NOT NULL,
    Role                         TEXT       NOT NULL,
    Container                    ENTITYID   NOT NULL,
    Folder                       VARCHAR    NOT NULL,

    PRIMARY KEY (RowId)
);