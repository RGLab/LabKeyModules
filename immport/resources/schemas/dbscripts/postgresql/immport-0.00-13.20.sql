/*
 * Copyright (c) 2013 LabKey Corporation
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

/* immport-0.00-13.14.sql */

--DROP SCHEMA immport CASCADE;
CREATE SCHEMA immport;


-- create the lookup tables

CREATE TABLE immport.lk_gender (
    name     VARCHAR(20) NOT NULL,
  CONSTRAINT PK_lk_gender PRIMARY KEY (name)
);


CREATE TABLE immport.lk_race (
    name     VARCHAR(50) NOT NULL,
  CONSTRAINT PK_lk_race PRIMARY KEY (name)
);


CREATE TABLE immport.lk_ethnicity (
    name     VARCHAR(50) NOT NULL,
  CONSTRAINT PK_lk_ethnicity PRIMARY KEY (name)
);

CREATE TABLE immport.lk_age_event (
    name       VARCHAR(50) NOT NULL,
    description      VARCHAR(250) NOT NULL,
    sort_order      INT,
  CONSTRAINT PK_lk_age_event PRIMARY KEY (name)
);


CREATE TABLE immport.lk_time_unit (
    name       VARCHAR(50) NOT NULL,
    description     VARCHAR(250) NOT NULL,
    sort_order      INT,
  CONSTRAINT PK_lk_time_unit PRIMARY KEY (name)
);


CREATE TABLE immport.lk_species (
    name       VARCHAR(50) NOT NULL,
    description   VARCHAR(250),
    taxonomy_id   VARCHAR(10),
  CONSTRAINT PK_lk_species PRIMARY KEY (name)
);


CREATE TABLE immport.lk_t0_event (
    name       VARCHAR(50) NOT NULL,
    description    VARCHAR(250),
    sort_order     INT,
  CONSTRAINT PK_lk_t0_event PRIMARY KEY (name)
);


CREATE TABLE immport.lk_experiment_purpose (
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
  CONSTRAINT PK_lk_experiment_purpose PRIMARY KEY (name)
);


CREATE TABLE immport.lk_exp_measurement_tech (
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NULL,
  CONSTRAINT PK_lk_exp_measurement_tech PRIMARY KEY (name)
);


CREATE TABLE immport.lk_data_format (
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
  CONSTRAINT PK_lk_data_format PRIMARY KEY (name)
);


CREATE TABLE immport.lk_expsample_result_schema (
  name                                 VARCHAR(100) NOT NULL,
  description                          VARCHAR(250) NOT NULL,
  CONSTRAINT PK_lk_expsample_result_schema PRIMARY KEY (name)
);


CREATE TABLE immport.lk_workspace_type (
    type        VARCHAR(20) NOT NULL,
    description VARCHAR(100) NOT NULL,
  CONSTRAINT PK_lk_workspace_type PRIMARY KEY (type)
);


CREATE TABLE immport.lk_workspace_category (
    category    VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
  CONSTRAINT PK_lk_workspace_category PRIMARY KEY (category)
);

-- add protocol table
CREATE TABLE immport.protocol (
    protocol_accession   VARCHAR(15) NOT NULL,
    user_defined_id      VARCHAR(100),
    name                 VARCHAR(250),
    type                 VARCHAR(100),
    keywords             VARCHAR(500),
    summary              VARCHAR(2000),
    description          VARCHAR(4000),
    file_name            VARCHAR(100),
    protocol_file        BYTEA,
    workspace_id         INT NOT NULL,
  CONSTRAINT PK_protocol PRIMARY KEY (protocol_accession)
);
CREATE INDEX idx_protocol_user_defined_id ON immport.protocol(user_defined_id);



-- add subject tables
CREATE TABLE immport.subject (
    subject_accession       VARCHAR(10) NOT NULL,
    user_defined_id         VARCHAR(100),
    description             VARCHAR(4000),
    phenotype               VARCHAR(200),
    age_value               DECIMAL(5,2),
    age_unit                VARCHAR(25) NOT NULL DEFAULT 'Not_Specified',
    age_event               VARCHAR(50) NOT NULL DEFAULT 'Not_Specified',
    age_event_specify       VARCHAR(50),
    strain                  VARCHAR(20),
    strain_characteristics  VARCHAR(500),
    gender                  VARCHAR(20) NOT NULL DEFAULT 'Not_Specified',
    ethnicity               VARCHAR(100), --  NOT NULL DEFAULT 'Not_Specified',
    population_name         VARCHAR(100),
    race                    VARCHAR(100),
    race_specify            VARCHAR(1000),
    species                 VARCHAR(50) NOT NULL,
    taxonomy_id             VARCHAR(10) NOT NULL,
    workspace_id            INT NOT NULL,
  CONSTRAINT PK_subject PRIMARY KEY (subject_accession)
);
CREATE INDEX idx_subject_user_defined_id ON immport.subject(user_defined_id);
CREATE INDEX idx_subject_gender ON immport.subject(gender);
CREATE INDEX idx_subject_race ON immport.subject(race);
CREATE INDEX idx_subject_species ON immport.subject(species);



CREATE TABLE immport.subject_2_treatment (
  subject_accession        VARCHAR(10) NOT NULL,
  treatment_accession      VARCHAR(10) NOT NULL,
  CONSTRAINT PK_subject_2_treatment PRIMARY KEY (subject_accession,treatment_accession)
);
CREATE INDEX idx_subject_2_treatment_1 ON immport.subject_2_treatment(treatment_accession,subject_accession);


CREATE TABLE immport.subject_2_protocol (
  protocol_accession   VARCHAR(10) NOT NULL,
  subject_accession    VARCHAR(10) NOT NULL,
  CONSTRAINT PK_subject_2_protocol PRIMARY KEY (subject_accession,protocol_accession)
);
CREATE INDEX idx_subject_2_protocol_2 ON immport.subject_2_protocol(protocol_accession,subject_accession);

-- create tables for biosample
CREATE TABLE immport.biosample (
    biosample_accession           VARCHAR(15) NOT NULL,
    subject_accession             VARCHAR(15) NOT NULL,
    user_defined_id               VARCHAR(100),
    biosampling_acc_num           VARCHAR(15),
    description                   VARCHAR(4000),
    name                          VARCHAR(200),
    type                          VARCHAR(50),
    subtype                       VARCHAR(50),
    study_time_collected          DECIMAL(10,2),
    study_time_collected_unit     VARCHAR(25) NOT NULL DEFAULT 'Not_Specified',
    study_time_t0_event           VARCHAR(50) NOT NULL DEFAULT 'Not_Specified',
    study_time_t0_event_specify   VARCHAR(50),
    study_accession               VARCHAR(15),
    workspace_id                  INT NOT NULL,
  CONSTRAINT PK_biosample PRIMARY KEY (biosample_accession)
);
CREATE INDEX idx_biosample_user on immport.biosample(user_defined_id);
CREATE INDEX idx_biosample_subject on immport.biosample(subject_accession,biosample_accession);

CREATE TABLE immport.biosample_2_expsample (
  biosample_accession       VARCHAR(10) NOT NULL,
  expsample_accession       VARCHAR(10) NOT NULL,
  CONSTRAINT PK_biosample_2_expsample PRIMARY KEY (biosample_accession,expsample_accession)
);
CREATE INDEX idx_biosample_2_expsample_1 on immport.biosample_2_expsample(expsample_accession,biosample_accession);

CREATE TABLE immport.biosample_2_treatment (
  biosample_accession        VARCHAR(10) NOT NULL,
  treatment_accession        VARCHAR(10) NOT NULL,
  CONSTRAINT PK_biosample_2_treatment PRIMARY KEY(biosample_accession,treatment_accession)
);
CREATE INDEX idx_biosample_2_treatment on immport.biosample_2_treatment(treatment_accession,biosample_accession);

CREATE TABLE immport.biosample_2_protocol (
  biosample_accession        VARCHAR(10) NOT NULL,
  protocol_accession         VARCHAR(10) NOT NULL,
  CONSTRAINT PK_biosample_2_protocol PRIMARY KEY(biosample_accession,protocol_accession)
);
CREATE INDEX idx_biosample_2_protocol on immport.biosample_2_protocol(protocol_accession,biosample_accession);

-- create table for treatment
CREATE TABLE immport.treatment (
    treatment_accession       VARCHAR(10) NOT NULL,
    name                      VARCHAR(200),
    weight_value              VARCHAR(50),
    weight_unit               VARCHAR(50),
    concentration_value       VARCHAR(50),
    concentration_unit        VARCHAR(50),
    volume_value              VARCHAR(50),
    volume_unit               VARCHAR(50),
    time_value                VARCHAR(200),
    time_unit                 VARCHAR(50),
    temperature_value         VARCHAR(50),
    temperature_unit          VARCHAR(50),
    other                     VARCHAR(500),
    workspace_id              INT NOT NULL,
  CONSTRAINT PK_treatment PRIMARY KEY (treatment_accession)
);

-- create tables for experiment
CREATE TABLE immport.experiment (
    experiment_accession    VARCHAR(10) NOT NULL,
    user_defined_id         VARCHAR(100),
    purpose                    VARCHAR(50),
    measurement_technique   VARCHAR(50) NOT NULL,
    title                   VARCHAR(500),
    hypothesis              VARCHAR(4000),
    rationale               VARCHAR(4000),
    keywords                VARCHAR(500),
    qc_measures             VARCHAR(500),
    description             VARCHAR(4000),
    workspace_id            INT NOT NULL,
  CONSTRAINT PK_experiment PRIMARY KEY (experiment_accession)
);
CREATE INDEX idx_experiment_1 on immport.experiment(user_defined_id);

CREATE TABLE immport.experiment_2_protocol (
  experiment_accession    VARCHAR(10) NOT NULL,
  protocol_accession      VARCHAR(10) NOT NULL,
  CONSTRAINT PK_experiment_2_protocol PRIMARY KEY(experiment_accession,protocol_accession)
);
CREATE INDEX idx_experiment_2_protocol_1 on immport.experiment_2_protocol(protocol_accession,experiment_accession);

-- create tables for expsample
CREATE TABLE immport.expsample (
  expsample_accession        VARCHAR(10) NOT NULL,
  experiment_accession       VARCHAR(10) NOT NULL,
  name                       VARCHAR(200),
  description                VARCHAR(500),
  user_defined_id            VARCHAR(100),
  data_format                VARCHAR(100) NOT NULL,
  result_schema              VARCHAR(50)  NOT NULL,
  result_name                VARCHAR(200),
  upload_result_status       VARCHAR(20),
  result_total_recs          INT,
  workspace_id               INT,
  CONSTRAINT PK_expsample PRIMARY KEY (expsample_accession)
);
CREATE INDEX idx_expsample_2 on immport.expsample(user_defined_id);
CREATE INDEX idx_expsample_1 on immport.expsample(experiment_accession,expsample_accession);

CREATE TABLE immport.expsample_2_protocol (
  expsample_accession       VARCHAR(10) NOT NULL,
  protocol_accession        VARCHAR(10) NOT NULL,
  CONSTRAINT PK_expsample_2_protocol PRIMARY KEY (expsample_accession,protocol_accession)
);
CREATE INDEX idx_expsample_2_protocol_1 on immport.expsample_2_protocol(protocol_accession,expsample_accession);

CREATE TABLE immport.expsample_2_file_info (
  expsample_accession   VARCHAR(10) NOT NULL,
  file_info_id          INT,
  CONSTRAINT PK_expsample_2_file_info PRIMARY KEY(expsample_accession,file_info_id)
);
CREATE INDEX idx_expsample_2_file_info_1 on immport.expsample_2_file_info(file_info_id,expsample_accession);

-- create tables for reagent
CREATE TABLE immport.reagent (
    reagent_accession      VARCHAR(10) NOT NULL,
    user_defined_id        VARCHAR(100),
    name                   VARCHAR(200),
    type                   VARCHAR(50),
    description            VARCHAR(4000),
    manufacturer           VARCHAR(100),
    weblink                VARCHAR(250),
    catalog_number         VARCHAR(250),
    lot_number             VARCHAR(250),
    reporter_name          VARCHAR(200),
    detector_name          VARCHAR(200),
    is_set                 VARCHAR(1),
    workspace_id           INT NOT NULL,
    CONSTRAINT PK_reagent PRIMARY KEY (reagent_accession)
);
CREATE INDEX idx_reagent_1 on immport.reagent(user_defined_id);

CREATE TABLE immport.expsample_2_reagent (
    expsample_accession             VARCHAR(10) NOT NULL,
    reagent_accession               VARCHAR(10) NOT NULL,
    CONSTRAINT PK_expsample_2_reagent PRIMARY KEY(expsample_accession,reagent_accession)
);
CREATE INDEX idx_expsample_2_reagent_1 on immport.expsample_2_reagent(reagent_accession,expsample_accession);

-- create tables for study
CREATE TABLE immport.study (
    study_accession                      VARCHAR(15) NOT NULL,
    user_defined_id                      VARCHAR(100),
    brief_title                          VARCHAR(250),
    official_title                       VARCHAR(500),
    study_type                           VARCHAR(20),
    brief_description                    VARCHAR(4000),
    sponsoring_organization              VARCHAR(250),
    target_enrollment                    INT,
    condition_studied                    VARCHAR(600),  -- TODO schema says 500
    hypothesis                           VARCHAR(4000),
    objectives                           text,
    endpoints                            text,
    intervention_agent                   VARCHAR(1000),
    workspace_id                         INT NOT NULL,
    CONSTRAINT PK_study PRIMARY KEY (study_accession)
);
CREATE INDEX idx_study_user_defined_id on immport.study(user_defined_id);
CREATE INDEX idx_study_workspace_id on immport.study(workspace_id);

CREATE TABLE immport.arm_or_cohort (
    arm_accession            VARCHAR(15) NOT NULL,
    user_defined_id                    VARCHAR(100),
    study_accession                    VARCHAR(15),
    name                               VARCHAR(126),
    description                        VARCHAR(500),
    population_selection_rule          VARCHAR(500),
    type                               VARCHAR(20),
    sort_order                         INT,
    workspace_id                       INT,
    CONSTRAINT PK_arm_or_cohort PRIMARY KEY (arm_accession)
);
CREATE INDEX idx_arm_or_cohort_1 on immport.arm_or_cohort(study_accession,arm_accession);
CREATE INDEX idx_arm_or_cohort_2 on immport.arm_or_cohort(workspace_id);

CREATE TABLE immport.arm_2_subject (
    arm_accession        VARCHAR(15) NOT NULL,
    subject_accession              VARCHAR(15) NOT NULL,
    study_enrollment_day           INT,
    age_at_enrollment              DOUBLE PRECISION,
    age_unit                       VARCHAR(50),
    CONSTRAINT PK_arm_2_subject PRIMARY KEY (arm_accession,subject_accession)
);
CREATE INDEX idx_arm_2_subject_1 on immport.arm_2_subject(subject_accession,arm_accession);



CREATE TABLE immport.study_2_protocol (
  study_accession      VARCHAR(10) NOT NULL,
  protocol_accession   VARCHAR(10) NOT NULL,
  CONSTRAINT PK_study_2_protocol PRIMARY KEY (study_accession,protocol_accession)
);
CREATE INDEX idx_study_2_protocol_1 on immport.study_2_protocol(protocol_accession,study_accession);



CREATE TABLE immport.workspace (
  workspace_id INT NOT NULL,
  contract_id INT NOT NULL,
  description VARCHAR(4000),
  goal VARCHAR(256),
  keywords VARCHAR(200),
  title VARCHAR(200) NOT NULL,
  CONSTRAINT PK_workspace PRIMARY KEY (workspace_id)
);
CREATE INDEX idx_workspace_contract on immport.workspace(contract_id);


-- create tables for results
CREATE TABLE immport.elisa_mbaa_result (
  result_id                            INT NOT NULL,
  analyte                              VARCHAR(50) NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  comments                             VARCHAR(100),
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  qualitative_result                   VARCHAR(100),
  study_accession                      VARCHAR(15) NOT NULL,
  study_time_collected                 DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  unit_preferred                       VARCHAR(20),
  unit_reported                        VARCHAR(100),  -- TODO schema says (20)
  value_preferred                      DOUBLE PRECISION,
  value_reported                       VARCHAR(20),
  workspace_id                         INT NOT NULL,
  CONSTRAINT PK_elisa_mbaa_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_elias_study_accession on immport.elisa_mbaa_result(study_accession);
CREATE INDEX idx_elias_arm_accession on immport.elisa_mbaa_result(arm_accession);
CREATE INDEX idx_elisa_expsample_accession on immport.elisa_mbaa_result(expsample_accession);
CREATE INDEX idx_elisa_experiment_accession on immport.elisa_mbaa_result(experiment_accession);
CREATE INDEX idx_elisa_subject_accession on immport.elisa_mbaa_result(subject_accession);
CREATE INDEX idx_elisa_biosample_accession on immport.elisa_mbaa_result(biosample_accession);
CREATE INDEX idx_elisa_analyte on immport.elisa_mbaa_result(analyte);
CREATE INDEX idx_elisa_workspace on immport.elisa_mbaa_result(workspace_id);



CREATE TABLE immport.elispot_result (
  result_id                            INT NOT NULL,
  analyte                              VARCHAR(50) NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  comments                             VARCHAR(200),
  cell_number_reported                 VARCHAR(20),
  cell_type                            VARCHAR(20),
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  spot_number_reported                 DOUBLE PRECISION,
  study_accession                      VARCHAR(15) NOT NULL,
  study_time_collected                 DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  unit_preferred                       VARCHAR(20),
  value_preferred                      DOUBLE PRECISION,
  workspace_id                         INT NOT NULL,
  CONSTRAINT PK_elispot_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_elispot_study_accession on immport.elispot_result(study_accession);
CREATE INDEX idx_elispot_arm_accession on immport.elispot_result(arm_accession);
CREATE INDEX idx_elispot_expsample_accession on immport.elispot_result(expsample_accession);
CREATE INDEX idx_elispot_experiment_accession on immport.elispot_result(experiment_accession);
CREATE INDEX idx_elispot_subject_accession on immport.elispot_result(subject_accession);
CREATE INDEX idx_elispot_biosample_accession on immport.elispot_result(biosample_accession);
CREATE INDEX idx_elispot_analyte on immport.elispot_result(analyte);
CREATE INDEX idx_elispot_workspace on immport.elispot_result(workspace_id);



CREATE TABLE immport.hai_result (
  result_id                            INT NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  study_accession                      VARCHAR(15),
  study_time_collected                 DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  value_reported                       VARCHAR(20),
  value_preferred                      DOUBLE PRECISION,
  unit_reported                        VARCHAR(20),
  unit_preferred                       VARCHAR(20),
  virus_strain                         VARCHAR(100),
  workspace_id                         INT NOT NULL,
  CONSTRAINT PK_hai_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_hai_study_accession on immport.hai_result(study_accession);
CREATE INDEX idx_hai_arm_accession on immport.hai_result(arm_accession);
CREATE INDEX idx_hai_expsample_accession on immport.hai_result(expsample_accession);
CREATE INDEX idx_hai_experiment_accession on immport.hai_result(experiment_accession);
CREATE INDEX idx_hai_subject_accession on immport.hai_result(subject_accession);
CREATE INDEX idx_hai_biosample_accession on immport.hai_result(biosample_accession);
CREATE INDEX idx_hai_virus_strain on immport.hai_result(virus_strain);
CREATE INDEX idx_hai_workspace on immport.hai_result(workspace_id);



-- create tables for fcs
CREATE TABLE immport.fcs_analyzed_result (
  result_id                            INT NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  base_parent_population               VARCHAR(500),
  biosample_accession                  VARCHAR(15) NOT NULL,
  comments                             VARCHAR(500),
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  gating_combination                   VARCHAR(500),
  gating_parameter_statistics          VARCHAR(4000),
  other_population_statistics          VARCHAR(500),
  population_cell_number               VARCHAR(500),
  population_description               VARCHAR(500),
  population_percent                   DECIMAL(10,2),
  study_accession                      VARCHAR(15) NOT NULL,
  study_time_collected                 DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  workspace_id                         INT NOT NULL,
  CONSTRAINT PK_fcs_analyzed_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_fcs_study_accession on immport.fcs_analyzed_result(study_accession);
CREATE INDEX idx_fcs_arm_accession on immport.fcs_analyzed_result(arm_accession);
CREATE INDEX idx_fcs_expsample_accession on immport.fcs_analyzed_result(expsample_accession);
CREATE INDEX idx_fcs_experiment_accession on immport.fcs_analyzed_result(experiment_accession);
CREATE INDEX idx_fcs_subject_accession on immport.fcs_analyzed_result(subject_accession);
CREATE INDEX idx_fcs_biosample_accession on immport.fcs_analyzed_result(biosample_accession);
CREATE INDEX idx_fcs_experiment_workspace on immport.fcs_analyzed_result(workspace_id);



CREATE TABLE immport.hla_typing_result (
  result_id                            INT NOT NULL,
  result_set_id                       INT NOT NULL,
  allele_1                             VARCHAR(250),
  allele_2                             VARCHAR(250),
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  locus_name                           VARCHAR(25),
  pop_area_name                        VARCHAR(30),
  study_accession                      VARCHAR(15) NOT NULL,
  study_time_collected DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  workspace_id INT,
  CONSTRAINT pk_hla_typing_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_hla_study_accession on immport.hla_typing_result(study_accession);
CREATE INDEX idx_hla_arm_accession on immport.hla_typing_result(arm_accession);
CREATE INDEX idx_hla_expsample_accession on immport.hla_typing_result(expsample_accession);
CREATE INDEX idx_hla_experiment_accession on immport.hla_typing_result(experiment_accession);
CREATE INDEX idx_hla_subject_accession on immport.hla_typing_result(subject_accession);
CREATE INDEX idx_hla_biosample_accession on immport.hla_typing_result(biosample_accession);
CREATE INDEX idx_hla_workspace on immport.hla_typing_result(workspace_id);



CREATE TABLE immport.kir_typing_result (
  result_id                            INT NOT NULL,
  result_set_id                        INT NOT NULL,
  allele                               VARCHAR(500),
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  comments                             VARCHAR(500),
  copy_number INT,
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  gene_name                            VARCHAR(25) NOT NULL,
  interpretation_report                VARCHAR(4000),
  pop_area_name                        VARCHAR(30) NOT NULL,
  present_absent                       VARCHAR(10),
  study_accession                      VARCHAR(15) NOT NULL,
  study_time_collected DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  workspace_id INT,
  CONSTRAINT pk_kir_typing_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_kir_study_accession on immport.kir_typing_result(study_accession);
CREATE INDEX idx_kir_arm_accession on immport.kir_typing_result(arm_accession);
CREATE INDEX idx_kir_expsample_accession on immport.kir_typing_result(expsample_accession);
CREATE INDEX idx_kir_experiment_accession on immport.kir_typing_result(experiment_accession);
CREATE INDEX idx_kir_subject_accession on immport.kir_typing_result(subject_accession);
CREATE INDEX idx_kir_biosample_accession on immport.kir_typing_result(biosample_accession);
CREATE INDEX idx_kir_workspace on immport.kir_typing_result(workspace_id);



CREATE TABLE immport.mbaa_result (
  result_id                            INT NOT NULL,
  analyte_name                         VARCHAR(15),
  arm_accession                        VARCHAR(15),
  assay_id                             VARCHAR(15),
  assay_group_id                       VARCHAR(15),
  biosample_accession                  VARCHAR(15),
  comments                             VARCHAR(500),
  concentration_unit                   VARCHAR(100),
  concentration_value                  VARCHAR(100),
  experiment_accession                 VARCHAR(15) NOT NULL,
  mfi                                  VARCHAR(100),
  mfi_coordinate                       VARCHAR(100),
  source_accession                     VARCHAR(15),
  source_type                          VARCHAR(30),
  study_accession                      VARCHAR(15),
  study_time_collected                 DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15),
  workspace_id                         INT NOT NULL,
  CONSTRAINT pk_mbaa_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_mbaa_study_accession on immport.mbaa_result(study_accession);
CREATE INDEX idx_mbaa_arm_accession on immport.mbaa_result(arm_accession);
CREATE INDEX idx_mbaa_source_accession on immport.mbaa_result(source_accession);
CREATE INDEX idx_mbaa_experiment_accession on immport.mbaa_result(experiment_accession);
CREATE INDEX idx_mbaa_subject_accession on immport.mbaa_result(subject_accession);
CREATE INDEX idx_mbaa_biosample_accession on immport.mbaa_result(biosample_accession);
CREATE INDEX idx_mbaa_workspace on immport.mbaa_result(workspace_id);



CREATE TABLE immport.neut_ab_titer_result (
  result_id                            INT NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  study_accession                      VARCHAR(15),
  study_time_collected DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  unit_preferred                       VARCHAR(20),
  unit_reported                        VARCHAR(20),
  value_preferred DOUBLE PRECISION,
  value_reported                       VARCHAR(20),
  virus_strain                         VARCHAR(100),
  workspace_id INT,
  CONSTRAINT pk_neut_ab_titer_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_neut_study_accession on immport.neut_ab_titer_result(study_accession);
CREATE INDEX idx_neut_arm_accession on immport.neut_ab_titer_result(arm_accession);
CREATE INDEX idx_neut_expsample_accession on immport.neut_ab_titer_result(expsample_accession);
CREATE INDEX idx_neut_experiment_accession on immport.neut_ab_titer_result(experiment_accession);
CREATE INDEX idx_neut_subject_accession on immport.neut_ab_titer_result(subject_accession);
CREATE INDEX idx_neut_biosample_accession on immport.neut_ab_titer_result(biosample_accession);
CREATE INDEX idx_nuet_virus_strain on immport.neut_ab_titer_result(virus_strain);
CREATE INDEX idx__workspace on immport.neut_ab_titer_result(workspace_id);



CREATE TABLE immport.pcr_result (
  result_id                            INT NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15) NOT NULL,
  entrez_gene_id                       VARCHAR(15),         -- TODO schema says INT, but dump has AF206518
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  gene_name                            VARCHAR(4000),
  gene_symbol                          VARCHAR(100),
  other_gene_accession                 VARCHAR(250),
  study_accession                      VARCHAR(15) NOT NULL,
  study_time_collected DOUBLE PRECISION,
  study_time_collected_unit            VARCHAR(25),
  subject_accession                    VARCHAR(15) NOT NULL,
  threshold_cycles                     VARCHAR(50),
  value_reported                       VARCHAR(20),
  value_preferred DOUBLE PRECISION,
  unit_reported                        VARCHAR(20),
  unit_preferred                       VARCHAR(20),
  workspace_id                         INT NOT NULL,

  CONSTRAINT pk_pcr_result PRIMARY KEY (result_id)
);
CREATE INDEX idx_pcr_study_accession on immport.pcr_result(study_accession);
CREATE INDEX idx_pcr_arm_accession on immport.pcr_result(arm_accession);
CREATE INDEX idx_pcr_expsample_accession on immport.pcr_result(expsample_accession);
CREATE INDEX idx_pcr_experiment_accession on immport.pcr_result(experiment_accession);
CREATE INDEX idx_pcr_subject_accession on immport.pcr_result(subject_accession);
CREATE INDEX idx_pcr_biosample_accession on immport.pcr_result(biosample_accession);
CREATE INDEX idx_pcr_entrez on immport.pcr_result(entrez_gene_id);
CREATE INDEX idx_pcr_workspace on immport.pcr_result(workspace_id);



CREATE TABLE immport.subject_measure_result (
  subject_measure_res_accession        VARCHAR(15) NOT NULL,
  centraltendencymeasurevalue          VARCHAR(40),
  datavalue                            VARCHAR(40),
  dispersionmeasurevalue               VARCHAR(40),
  study_accession                      VARCHAR(15),
  study_day DOUBLE PRECISION,
  subject_accession                    VARCHAR(15) NOT NULL,
  subject_measure_accession            VARCHAR(15) NOT NULL,
  time_of_day                          VARCHAR(40),
  year_of_measure DATE,
  workspace_id INT                     NOT NULL,
  CONSTRAINT pk_subject_measure_result PRIMARY KEY (subject_measure_res_accession)
);
CREATE INDEX idx_subject_measure_result_workspace on immport.subject_measure_result(workspace_id);
CREATE INDEX idx_subject_measure_result_study on immport.subject_measure_result(study_accession);



-- create tables for fileinfo
CREATE TABLE immport.file_info (
  file_info_id           INT NOT NULL,
  detail                 VARCHAR(100),
  name                   VARCHAR(500),
  purpose                VARCHAR(100),
  filesize_bytes         INT,
  workspace_id           INT,
  CONSTRAINT PK_file_info PRIMARY KEY (file_info_id)
);

-- add foreign key constraints
ALTER TABLE immport.subject ADD CONSTRAINT fk_subject_age_unit
    FOREIGN KEY (age_unit)
    REFERENCES immport.lk_time_unit (name);

ALTER TABLE immport.subject ADD CONSTRAINT fk_subject_age_event
    FOREIGN KEY (age_event)
    REFERENCES immport.lk_age_event (name);

ALTER TABLE immport.subject ADD CONSTRAINT fk_subject_gender
    FOREIGN KEY (gender)
    REFERENCES immport.lk_gender (name);

ALTER TABLE immport.subject ADD CONSTRAINT fk_subject_ethnicity
    FOREIGN KEY (ethnicity)
    REFERENCES immport.lk_ethnicity (name);

ALTER TABLE immport.subject ADD CONSTRAINT fk_subject_race
    FOREIGN KEY (race)
    REFERENCES immport.lk_race (name);

ALTER TABLE immport.subject ADD CONSTRAINT fk_subject_species
    FOREIGN KEY (species)
    REFERENCES immport.lk_species (name);

ALTER TABLE immport.subject_2_treatment ADD CONSTRAINT fk_subject_2_treatment_1
    FOREIGN KEY (subject_accession)
    REFERENCES immport.subject(subject_accession);

ALTER TABLE immport.subject_2_treatment ADD CONSTRAINT fk_subject_2_treatment_2
    FOREIGN KEY (treatment_accession)
    REFERENCES immport.treatment(treatment_accession);

ALTER TABLE immport.subject_2_protocol ADD CONSTRAINT fk_subject_2_protocol_1
    FOREIGN KEY (subject_accession)
    REFERENCES immport.subject(subject_accession);

ALTER TABLE immport.subject_2_protocol ADD CONSTRAINT fk_subject_2_protocol_2
    FOREIGN KEY (protocol_accession)
    REFERENCES immport.protocol(protocol_accession);

ALTER TABLE immport.biosample ADD CONSTRAINT fk_biosample_time_unit
    FOREIGN KEY (study_time_collected_unit)
    REFERENCES immport.lk_time_unit (name);

ALTER TABLE immport.biosample ADD CONSTRAINT fk_biosample_t0_event
    FOREIGN KEY (study_time_t0_event)
    REFERENCES immport.lk_t0_event (name);

ALTER TABLE immport.biosample_2_expsample ADD CONSTRAINT fk_biosample_2_expsample_1
    FOREIGN KEY (expsample_accession)
    REFERENCES immport.expsample(expsample_accession);

ALTER TABLE immport.biosample_2_expsample ADD CONSTRAINT fk_biosample_2_expsample_2
    FOREIGN KEY (biosample_accession)
    REFERENCES immport.biosample(biosample_accession);

ALTER TABLE immport.biosample_2_treatment ADD CONSTRAINT fk_biosample_2_treatment_1
    FOREIGN KEY (biosample_accession)
    REFERENCES immport.biosample(biosample_accession);

ALTER TABLE immport.biosample_2_treatment ADD CONSTRAINT fk_biosample_2_treatment_2
    FOREIGN KEY (treatment_accession)
    REFERENCES immport.treatment(treatment_accession);

ALTER TABLE immport.biosample_2_protocol ADD CONSTRAINT fk_biosample_2_protocol_1
    FOREIGN KEY (biosample_accession)
    REFERENCES immport.biosample(biosample_accession);

ALTER TABLE immport.biosample_2_protocol ADD CONSTRAINT fk_biosample_2_protocol_2
    FOREIGN KEY (protocol_accession)
    REFERENCES immport.protocol(protocol_accession);

ALTER TABLE immport.experiment ADD CONSTRAINT fk_exp_exp_type
    FOREIGN KEY (purpose)
    REFERENCES immport.lk_experiment_purpose (name);

ALTER TABLE immport.experiment ADD CONSTRAINT fk_exp_exp_mea_tech
    FOREIGN KEY (measurement_technique)
    REFERENCES immport.lk_exp_measurement_tech (name);

ALTER TABLE immport.experiment_2_protocol ADD CONSTRAINT fk_experiment_2_protocol_1
    FOREIGN KEY (experiment_accession)
    REFERENCES immport.experiment(experiment_accession);

ALTER TABLE immport.experiment_2_protocol ADD CONSTRAINT fk_exp_2_protocol_2
    FOREIGN KEY (protocol_accession)
    REFERENCES immport.protocol(protocol_accession);

ALTER TABLE immport.expsample ADD CONSTRAINT fk_expsample_data_format
    FOREIGN KEY (data_format)
    REFERENCES immport.lk_data_format (name);

ALTER TABLE immport.expsample ADD CONSTRAINT fk_expsample_result_schema
    FOREIGN KEY (result_schema)
    REFERENCES immport.lk_expsample_result_schema (name);

ALTER TABLE immport.expsample_2_reagent ADD CONSTRAINT fk_expsample_2_reagent_1
    FOREIGN KEY (expsample_accession)
    REFERENCES immport.expsample(expsample_accession);

ALTER TABLE immport.expsample_2_reagent ADD CONSTRAINT fk_expsample_2_reagent_2
    FOREIGN KEY (reagent_accession)
    REFERENCES immport.reagent(reagent_accession);

ALTER TABLE immport.arm_or_cohort ADD CONSTRAINT fk_arm_or_cohort_1
    FOREIGN KEY (study_accession)
    REFERENCES immport.study(study_accession);

ALTER TABLE immport.arm_2_subject ADD CONSTRAINT fk_arm_2_subject_1
    FOREIGN KEY (arm_accession)
    REFERENCES immport.arm_or_cohort(arm_accession);

ALTER TABLE immport.arm_2_subject ADD CONSTRAINT fk_arm_2_subject_2
    FOREIGN KEY (subject_accession)
    REFERENCES immport.subject(subject_accession);

ALTER TABLE immport.study_2_protocol ADD CONSTRAINT fk_study_2_protocol_1
    FOREIGN KEY (study_accession)
    REFERENCES immport.study(study_accession);

ALTER TABLE immport.study_2_protocol ADD CONSTRAINT fk_study_2_protocol_2
    FOREIGN KEY (protocol_accession)
    REFERENCES immport.protocol(protocol_accession);

ALTER TABLE immport.elisa_mbaa_result ADD CONSTRAINT fk_exp_elisa_mbaa_result_1
    FOREIGN KEY (expsample_accession)
    REFERENCES immport.expsample (expsample_accession);

ALTER TABLE immport.elisa_mbaa_result ADD CONSTRAINT fk_exp_elisa_mbaa_result_2
    FOREIGN KEY (experiment_accession)
    REFERENCES immport.experiment (experiment_accession);

ALTER TABLE immport.elispot_result ADD CONSTRAINT fk_exp_elispot_result_1
    FOREIGN KEY (expsample_accession)
    REFERENCES immport.expsample (expsample_accession);

ALTER TABLE immport.elispot_result ADD CONSTRAINT fk_exp_elispot_result_2
    FOREIGN KEY (experiment_accession)
    REFERENCES immport.experiment (experiment_accession);

ALTER TABLE immport.hai_result ADD CONSTRAINT fk_exp_hai_result_1
    FOREIGN KEY (expsample_accession)
    REFERENCES immport.expsample (expsample_accession);

ALTER TABLE immport.hai_result ADD CONSTRAINT fk_exp_hai_result_2
    FOREIGN KEY (experiment_accession)
    REFERENCES immport.experiment (experiment_accession);

ALTER TABLE immport.fcs_analyzed_result ADD CONSTRAINT fk_facs_analyzed_result_1
    FOREIGN KEY (expsample_accession)
    REFERENCES immport.expsample (expsample_accession);

ALTER TABLE immport.fcs_analyzed_result ADD CONSTRAINT fk_facs_analyzed_result_2
    FOREIGN KEY (experiment_accession)
    REFERENCES immport.experiment (experiment_accession);

/* immport-13.14-13.15.sql */

DROP TABLE IF EXISTS immport.fcs_annotation;

CREATE TABLE immport.fcs_annotation (
  fcs_annotation_id                    INT NOT NULL,
  compensation_flag                    VARCHAR(1),
  experiment_accession                 VARCHAR(15),
  expsample_accession                  VARCHAR(15),
  file_info_id                         INT,
  maximum_intensity                    DOUBLE PRECISION,
  minimum_intensity                    DOUBLE PRECISION,
  number_of_events                     INT,
  number_of_markers                    INT,
  panel                                VARCHAR(2000),
  workspace_id                         INT,
  PRIMARY KEY (fcs_annotation_id)
);

CREATE INDEX idx_fcs_annotation_workspace on immport.fcs_annotation(workspace_id);
CREATE INDEX idx_fcs_annotation_expsample_accession on immport.fcs_annotation(expsample_accession);
CREATE INDEX idx_fcs_annotation_experiment_accession on immport.fcs_annotation(experiment_accession);
CREATE INDEX idx_fcs_annotation_file_info_id on immport.fcs_annotation(file_info_id);