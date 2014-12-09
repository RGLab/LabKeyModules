DROP SCHEMA IF EXISTS lyoplate_visualization CASCADE;
CREATE SCHEMA lyoplate_visualization;

CREATE TABLE lyoplate_visualization.gsTbl
(
    Container     ENTITYID      NOT NULL,
    gsId          SERIAL        NOT NULL,
    gsName        VARCHAR(255)  NOT NULL,
    gsPath        TEXT          NOT NULL,
    gsDescription TEXT,
    xmlPaths      TEXT          NOT NULL,
    sampleGroups  TEXT          NOT NULL,
    created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT PK_gsTbl PRIMARY KEY (gsId),
    CONSTRAINT UQ_gsTbl UNIQUE (Container, gsName)
);

CREATE TABLE lyoplate_visualization.projections
(
    Container ENTITYID  NOT NULL,
    index     INT       NOT NULL,
    path      TEXT      NOT NULL,
    x_axis    VARCHAR(255),
    y_axis    VARCHAR(255),
    x_key     VARCHAR(255),
    y_key     VARCHAR(255),
    gsId      INT       NOT NULL,

    CONSTRAINT PK_projections PRIMARY KEY (index, x_axis, y_axis, gsId),
    CONSTRAINT FK_projections_gsTbl FOREIGN KEY (gsId)
        REFERENCES lyoplate_visualization.gsTbl (gsId)
        ON DELETE CASCADE
);

CREATE TABLE lyoplate_visualization.study_vars
(
    Container ENTITYID      NOT NULL,
    svId      SERIAL        NOT NULL,
    svName    VARCHAR(255)  NOT NULL,
    gsId      INT           NOT NULL,

    CONSTRAINT PK_study_vars PRIMARY KEY (svId),
    CONSTRAINT UQ_study_vars UNIQUE (svName, gsid),
    CONSTRAINT FK_study_vars_gsTbl FOREIGN KEY (gsId)
        REFERENCES lyoplate_visualization.gsTbl (gsId)
        ON DELETE CASCADE
);

CREATE TABLE lyoplate_visualization.files
(
    Container ENTITYID  NOT NULL,
    fileId    INT       NOT NULL,
    gsId      INT       NOT NULL,

    CONSTRAINT PK_files PRIMARY KEY (fileId, gsId),
    CONSTRAINT FK_files_gsTbl FOREIGN KEY (gsId)
        REFERENCES lyoplate_visualization.gsTbl (gsId)
        ON DELETE CASCADE
);
