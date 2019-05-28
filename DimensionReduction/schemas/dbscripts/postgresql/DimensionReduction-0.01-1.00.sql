CREATE SCHEMA DimensionReduction;
CREATE TABLE DimensionReduction.DimRedux_Assay_Data_PreCompute
(
  Container           ENTITYID    NOT NULL,
  RowId               BIGSERIAL   NOT NULL,
  ParticipantId       TEXT        NOT NULL,
  Name                TEXT        NOT NULL,
  Label               TEXT        NOT NULL,
  Timepoint           TEXT        NOT NULL,
  Features            INT         NOT NULL,

PRIMARY KEY (RowId)
);
