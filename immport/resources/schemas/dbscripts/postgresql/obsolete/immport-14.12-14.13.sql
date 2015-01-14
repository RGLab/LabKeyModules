/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

DROP TABLE IF EXISTS immport.fcs_analyzed_result_marker;
CREATE TABLE immport.fcs_analyzed_result_marker (
  fcs_analyzed_result_marker_id        INT NOT NULL,
  fcs_analyzed_result_id               INT,
  population_marker_reported           VARCHAR(500),
  population_marker_preferred          VARCHAR(500),
  marker_preferred_term_id             VARCHAR(50),
  PRIMARY KEY (fcs_analyzed_result_marker_id)
);


DROP TABLE IF EXISTS immport.fcs_header;
CREATE TABLE immport.fcs_header (
  fcs_header_id                        INT NOT NULL,
  experiment_accession                 VARCHAR(15),
  expsample_accession                  VARCHAR(15),
  file_info_id                         INT,
  fcs_file_name                        VARCHAR(200),
  fcs_version                          DOUBLE PRECISION,
  compensation_flag                    VARCHAR(1),
  panel_reported                       VARCHAR(2000),
  panel_preferred                      VARCHAR(2000),
  number_of_events                     INT,
  minimum_intensity                    DOUBLE PRECISION,
  maximum_intensity                    DOUBLE PRECISION,
  number_of_markers                    INT,
  fcs_header_text                      TEXT,
  PRIMARY KEY (fcs_header_id)
);
CREATE INDEX idx_fcs_header_expsample_accession on immport.fcs_header(expsample_accession);
CREATE INDEX idx_fcs_header_experiment_accession on immport.fcs_header(experiment_accession);
CREATE INDEX idx_fcs_header_file_info_id on immport.fcs_header(file_info_id);


DROP TABLE IF EXISTS immport.fcs_header_marker;
CREATE TABLE immport.fcs_header_marker (
  fcs_header_id                        INT NOT NULL,
  parameter_number                     INT,
  pnn_reported                         VARCHAR(50),
  pns_reported                         VARCHAR(50),
  pnn_preferred                        VARCHAR(50),
  pnn_preferred_term_id                VARCHAR(50),
  pns_preferred                        VARCHAR(50),
  pns_preferred_term_id                VARCHAR(50),
  PRIMARY KEY (fcs_header_id)
);


DROP TABLE IF EXISTS immport.expsample_public_repository;
CREATE TABLE immport.expsample_public_repository (
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  repository_name                      VARCHAR(50),
  repository_accession                 VARCHAR(20),
  PRIMARY KEY (expsample_accession,repository_accession)
);
CREATE INDEX idx_expsample_public on immport.expsample_public_repository(experiment_accession,expsample_accession);


DROP TABLE IF EXISTS immport.lk_public_repository;
CREATE TABLE immport.lk_public_repository (
  name                            VARCHAR(50) NOT NULL,
  link                            VARCHAR(100),
  description                     VARCHAR(300),
  sort_order                      INT,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.lk_reagent_type;
CREATE TABLE immport.lk_reagent_type (
  name                            VARCHAR(50) NOT NULL,
  description                     VARCHAR(250),
  link                            VARCHAR(2000),
  sort_order                      INT,
  PRIMARY KEY (name)
);


DROP TABLE IF EXISTS immport.reagent_2_fcs_marker;
CREATE TABLE immport.reagent_2_fcs_marker (
  fcs_header_id                    INT NOT NULL,
  parameter_number                 INT NOT NULL,
  reagent_accession                    VARCHAR(15) NOT NULL,
  PRIMARY KEY (fcs_header_id)
);


ALTER TABLE immport.biosample ADD COLUMN planned_visit_accession VARCHAR(15);
ALTER TABLE immport.lk_adverse_event_severity ADD COLUMN sort_order INT;
ALTER TABLE immport.study ADD COLUMN clinical_trial VARCHAR(1);

ALTER TABLE immport.expsample_2_file_info ADD COLUMN data_format VARCHAR(100);
ALTER TABLE immport.expsample_2_file_info ADD COLUMN result_schema VARCHAR(50);
ALTER TABLE immport.control_sample_2_file_info ADD COLUMN data_format VARCHAR(100);
ALTER TABLE immport.control_sample_2_file_info ADD COLUMN result_schema VARCHAR(50);
ALTER TABLE immport.standard_curve_2_file_info ADD COLUMN data_format VARCHAR(100);
ALTER TABLE immport.standard_curve_2_file_info ADD COLUMN result_schema VARCHAR(50);

ALTER TABLE immport.lk_exp_measurement_tech ADD COLUMN link VARCHAR(2000);
ALTER TABLE immport.lk_gender ADD COLUMN link VARCHAR(2000);
ALTER TABLE immport.lk_sample_type ADD COLUMN link VARCHAR(2000);
ALTER TABLE immport.lk_time_unit ADD COLUMN link VARCHAR(2000);
ALTER TABLE immport.lk_unit_of_measure ADD COLUMN link VARCHAR(2000);

ALTER TABLE immport.elisa_mbaa_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.elispot_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.hai_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.hla_typing_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.kir_typing_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.mbaa_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.neut_ab_titer_result ADD COLUMN file_info_id INT;
ALTER TABLE immport.pcr_result ADD COLUMN file_info_id INT;

ALTER TABLE immport.reagent ADD COLUMN analyte_reported VARCHAR(200);
ALTER TABLE immport.reagent ADD COLUMN analyte_reported_description VARCHAR(250);
ALTER TABLE immport.reagent ADD COLUMN analyte_preferred VARCHAR(200);
ALTER TABLE immport.reagent ADD COLUMN analyte_preferred_term_id VARCHAR(50);
ALTER TABLE immport.reagent ADD COLUMN antibody_registry_id VARCHAR(20);

ALTER TABLE immport.fcs_analyzed_result ADD COLUMN population_cell_number_unit VARCHAR(50);
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN population_definition_reported VARCHAR(500);
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN population_definition_preferred VARCHAR(500);
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN population_name_reported VARCHAR(500);
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN population_name_preferred VARCHAR(500);
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN population_name_preferred_id VARCHAR(50);
ALTER TABLE immport.fcs_analyzed_result ADD COLUMN workspace_file_info_id INT;


ALTER TABLE immport.elisa_mbaa_result RENAME TO elisa_result;