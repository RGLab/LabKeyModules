/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP TABLE IF EXISTS immport.lk_adverse_event_severity;

CREATE TABLE immport.lk_adverse_event_severity (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(1000),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_allele_status;

CREATE TABLE immport.lk_allele_status (
  name                            VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_data_completeness;

CREATE TABLE immport.lk_data_completeness (
  dcl_id                               INT NOT NULL,
  description                          VARCHAR(100),
  PRIMARY KEY (dcl_id)
);


DROP TABLE IF EXISTS immport.lk_exon_intron_interrogated;

CREATE TABLE immport.lk_exon_intron_interrogated (
  name                                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_feature_location;

CREATE TABLE immport.lk_feature_location (
  name                                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_feature_sequence_type;

CREATE TABLE immport.lk_feature_sequence_type (
  name                                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_feature_strand;

CREATE TABLE immport.lk_feature_strand (
  name                                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_feature_type;

CREATE TABLE immport.lk_feature_type (
  name                                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_file_detail;

CREATE TABLE immport.lk_file_detail (
  name                                 VARCHAR(100) NOT NULL,
  description                          VARCHAR(250),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_file_purpose;

CREATE TABLE immport.lk_file_purpose (
  name                                 VARCHAR(100) NOT NULL,
  description                          VARCHAR(250),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_locus_name;

CREATE TABLE immport.lk_locus_name (
  name                                 VARCHAR(100) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_locus_typing_method;

CREATE TABLE immport.lk_locus_typing_method (
  name                                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_personnel_role;

CREATE TABLE immport.lk_personnel_role (
  name                                     VARCHAR(40) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_plate_type;

CREATE TABLE immport.lk_plate_type (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(100),
  sort_order                           INT,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_protocol_type;

CREATE TABLE immport.lk_protocol_type (
  name                                 VARCHAR(100) NOT NULL,
  description                          VARCHAR(500),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_reason_not_completed;

CREATE TABLE immport.lk_reason_not_completed (
  name                               VARCHAR(40) NOT NULL,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_sample_type;

CREATE TABLE immport.lk_sample_type (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(100),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_source_type;

CREATE TABLE immport.lk_source_type (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(250),
  sort_order                           INT,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_study_file_type;

CREATE TABLE immport.lk_study_file_type (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(500),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_study_panel;

CREATE TABLE immport.lk_study_panel (
  name                                 VARCHAR(100) NOT NULL,
  description                          VARCHAR(250),
  visible                              VARCHAR(500),
  collapsible                          VARCHAR(1),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_study_type;

CREATE TABLE immport.lk_study_type (
  name                                 VARCHAR(20) NOT NULL,
  description                          VARCHAR(500),
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_unit_of_measure;

CREATE TABLE immport.lk_unit_of_measure (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(250),
  type                                 VARCHAR(50) NOT NULL,
  sort_order                           INT,
  PRIMARY KEY (name)
);




