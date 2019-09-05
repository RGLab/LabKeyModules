CREATE SCHEMA IF NOT EXISTS HIPCMatrix;
DROP TABLE IF EXISTS HIPCMatrix.InputSamples_precompute;
CREATE TABLE HIPCMatrix.InputSamples_precompute
(
    Container                    ENTITYID   NOT NULL,
    RowId                        BIGSERIAL  NOT NULL,
    Run                          INT        NOT NULL,
    TargetProtocolApplication    INT        NOT NULL,
    Material                     INT        NOT NULL,
    Biosample                    VARCHAR    NOT NULL,
    Role                         VARCHAR    NOT NULL,
    Material_Folder              VARCHAR    NOT NULL,
    Material_RowId               VARCHAR    NOT NULL,


    CONSTRAINT PK_InputSamples_precompute PRIMARY KEY (RowId)
);