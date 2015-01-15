/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP TABLE IF EXISTS immport.actual_visit;

CREATE TABLE immport.actual_visit
(
  actual_visit_accession               VARCHAR(15) NOT NULL,
  is_planned                           VARCHAR(1) NOT NULL,
  planned_visit_accession              VARCHAR(15),
  study_accession                      VARCHAR(15) NOT NULL,
  study_day_visit_starts               INT NOT NULL,
  subject_accession                    VARCHAR(15),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (actual_visit_accession)
);

CREATE INDEX idx_actual_visit_subject on immport.actual_visit(subject_accession);
CREATE INDEX idx_actual_visit_study on immport.actual_visit(study_accession);
CREATE INDEX idx_actual_visit_planned_visit on immport.actual_visit(planned_visit_accession);
CREATE INDEX idx_actual_visit_workspace on immport.actual_visit(workspace_id);


DROP TABLE IF EXISTS immport.adverse_event;

CREATE TABLE immport.adverse_event (
  adverse_event_accession              VARCHAR(15) NOT NULL,
  causality                            VARCHAR(250),
  end_study_day                        INT,
  end_time                             VARCHAR(40),
  event_description                    VARCHAR(256),
  is_serious_event                     VARCHAR(2),
  location_of_reaction_preferred       VARCHAR(126),
  location_of_reaction_reported        VARCHAR(126),
  name_preferred                       VARCHAR(126),
  name_reported                        VARCHAR(126),
  organ_or_body_system_preferred       VARCHAR(126),
  organ_or_body_system_reported       VARCHAR(126),
  outcome_preferred                    VARCHAR(40),
  outcome_reported                     VARCHAR(40),
  other_action_taken                   VARCHAR(250),
  relation_to_nonstudy_treatment       VARCHAR(250),
  relation_to_study_treatment          VARCHAR(250),
  severity_preferred                   VARCHAR(40),
  severity_reported                    VARCHAR(40),
  start_study_day                      INT,
  start_time                           VARCHAR(40),
  study_accession                      VARCHAR(15) NOT NULL,
  study_treatment_action_taken         VARCHAR(250),
  subject_accession                    VARCHAR(15) NOT NULL,
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (adverse_event_accession)
);

CREATE INDEX idx_adverse_event_subject on immport.adverse_event(subject_accession);
CREATE INDEX idx_adverse_event_study on immport.adverse_event(study_accession);
CREATE INDEX idx_adverse_event_workspace on immport.adverse_event(workspace_id);


DROP TABLE IF EXISTS immport.analyte;

CREATE TABLE immport.analyte (
  analyte_id                           INT NOT NULL,
  description                          VARCHAR(250),
  name                                 VARCHAR(200),
  reagent_accession                    VARCHAR(15),
  workspace_id                         INT,
  PRIMARY KEY (analyte_id)
);

CREATE INDEX idx_analyte_workspace on immport.analyte(workspace_id);


DROP TABLE IF EXISTS immport.assessment;

CREATE TABLE immport.assessment (
  assessment_component_accession       VARCHAR(15) NOT NULL,
  assessment_panel_accession           VARCHAR(15) NOT NULL,
  actual_visit_accession               VARCHAR(15),
  age_at_onset_preferred               DECIMAL(10,2),
  age_at_onset_unit_preferred          VARCHAR(40),
  age_at_onset_reported                VARCHAR(100),
  age_at_onset_reported_unit           VARCHAR(100),
  assessment_type                      VARCHAR(125),
  component_name_preferred             VARCHAR(40),
  component_name_reported                       VARCHAR(250),
  is_clinically_significant            VARCHAR(1),
  location_of_finding_preferred        VARCHAR(40),
  location_of_finding_reported         VARCHAR(256),
  organ_or_body_system_preferred       VARCHAR(100),
  organ_or_body_system_reported        VARCHAR(100),
  panel_name_preferred                 VARCHAR(40),
  panel_name_reported                  VARCHAR(125),
  reference_range_accession            VARCHAR(15),
  result_unit_preferred                VARCHAR(40),
  result_unit_reported                 VARCHAR(40),
  result_value_preferred               VARCHAR(40),
  result_value_reported                VARCHAR(250),
  study_accession                      VARCHAR(15) NOT NULL,
  study_day                            DECIMAL(10,2),
  study_day_from_partial_date          VARCHAR(1),
  subject_accession                    VARCHAR(15) NOT NULL,
  subject_position_preferred           VARCHAR(40),
  subject_position_reported            VARCHAR(40),
  time_of_day                          VARCHAR(40),
  verbatim_question                    VARCHAR(250),
  who_is_assessed                      VARCHAR(40),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (assessment_component_accession)
);

CREATE INDEX idx_assessment_study on immport.assessment(study_accession);
CREATE INDEX idx_assessment_subject on immport.assessment(subject_accession);
CREATE INDEX idx_assessment_actual_visit on immport.assessment(actual_visit_accession);
CREATE INDEX idx_assessment_workspace on immport.assessment(workspace_id);


DROP TABLE IF EXISTS immport.contract_grant;

CREATE TABLE immport.contract_grant (
  contract_grant_id                    INT NOT NULL,
  deputy_project_officer               VARCHAR(50),
  end_date                             DATE NOT NULL,
  extended_date                        DATE,
  keywords                             VARCHAR(300),
  name                                 VARCHAR(50) NOT NULL,
  program_id                           INT NOT NULL,
  project_officer                      VARCHAR(50),
  type                                 VARCHAR(50),
  start_date                           DATE NOT NULL,
  status                               VARCHAR(1),
  summary                              VARCHAR(4000),
  title                                VARCHAR(200),
  PRIMARY KEY (contract_grant_id)
);

CREATE INDEX idx_contract_program on immport.contract_grant(program_id);


DROP TABLE IF EXISTS immport.control_sample;

CREATE TABLE immport.control_sample (
  control_sample_accession             VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  assay_group_id                       VARCHAR(100),
  assay_id                             VARCHAR(100),
  catalog_id                           VARCHAR(100),
  data_format                          VARCHAR(100) NOT NULL,
  dilution_factor                      VARCHAR(100),
  lot_number                           VARCHAR(100),
  resultset_name                       VARCHAR(200),
  result_schema                        VARCHAR(50)  NOT NULL,
  result_tot_recs                      INT,
  source                               VARCHAR(100),
  workspace_id                         INT,
  PRIMARY KEY (control_sample_accession)
);

CREATE INDEX idx_ctrlsample_experiment on immport.control_sample(experiment_accession);
CREATE INDEX idx_ctrlsample_workspace on immport.control_sample(workspace_id);


DROP TABLE IF EXISTS immport.control_sample_2_file_info;

CREATE TABLE immport.control_sample_2_file_info (
  control_sample_accession              VARCHAR(15) NOT NULL,
  experiment_accession                  VARCHAR(15) NOT NULL,
  file_info_id                         INT,
  PRIMARY KEY(control_sample_accession,file_info_id)
);

CREATE INDEX idx_ctrlsample_2_file_info on immport.control_sample_2_file_info(file_info_id,control_sample_accession);


DROP TABLE IF EXISTS immport.expsample_2_treatment;

CREATE TABLE immport.expsample_2_treatment (
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  treatment_accession                  VARCHAR(15) NOT NULL,
  PRIMARY KEY (expsample_accession,treatment_accession)
);

CREATE INDEX idx_expsample_2_treatment on immport.expsample_2_treatment(treatment_accession,expsample_accession);


DROP TABLE IF EXISTS immport.expsample_mbaa_detail;

CREATE TABLE immport.expsample_mbaa_detail (
  expsample_accession                  VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  assay_group_id                       VARCHAR(100),
  assay_id                             VARCHAR(100),
  dilution_factor                      VARCHAR(100),
  plate_type                           VARCHAR(100),
  workspace_id                         INT,
  PRIMARY KEY (expsample_accession)
);

CREATE INDEX idx_expsample_mbaa_experiment on immport.expsample_mbaa_detail(experiment_accession,expsample_accession);
CREATE INDEX idx_expsample_mbaa_workspace on immport.expsample_mbaa_detail(workspace_id);


DROP TABLE IF EXISTS immport.hla_allele_status;

CREATE TABLE immport.hla_allele_status (
  allele_name                          VARCHAR(250),
  allele_set_num                       INT NOT NULL,
  ambiguous_unambiguous_status         VARCHAR(50),
  locus_genotyped                      VARCHAR(15) NOT NULL,
  reagent_accession                    VARCHAR(15) NOT NULL,
  workspace_id                         INT,
  PRIMARY KEY (reagent_accession,locus_genotyped,allele_name,ambiguous_unambiguous_status,allele_set_num)
);

CREATE INDEX idx_hla_allele_reagent_accession on immport.hla_allele_status(reagent_accession);


DROP TABLE IF EXISTS immport.hla_typing_sys_feature;

CREATE TABLE immport.hla_typing_sys_feature (
  reagent_accession                    VARCHAR(15) NOT NULL,
  feature_location                     VARCHAR(100) NOT NULL,
  feature_name                         VARCHAR(100) NOT NULL,
  feature_sequence                     VARCHAR(4000) NOT NULL,
  feature_type                         VARCHAR(100) NOT NULL,
  locus_genotyped                      VARCHAR(15) NOT NULL,
  nucleotide_peptide                   VARCHAR(100) NOT NULL,
  strand_complementarity               VARCHAR(100),
  start_position                       INT NOT NULL,
  workspace_id                         INT,
  PRIMARY KEY (reagent_accession,locus_genotyped,feature_name)
);

CREATE INDEX idx_hla_typing_reagent_accession on immport.hla_typing_sys_feature(reagent_accession);


DROP TABLE IF EXISTS immport.hla_typing_system;

CREATE TABLE immport.hla_typing_system (
  reagent_accession                    VARCHAR(15) NOT NULL,
  exons_intron_interrogated            VARCHAR(250) NOT NULL,
  hla_typing_date                      VARCHAR(100) NOT NULL,
  last_who_report_update               VARCHAR(100) NOT NULL,
  locus_genotyped                      VARCHAR(15) NOT NULL,
  typing_method                        VARCHAR(100) NOT NULL,
  typing_system_manufacturer           VARCHAR(100) NOT NULL,
  typing_system_version                VARCHAR(150) NOT NULL,
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (reagent_accession,locus_genotyped)
);

CREATE INDEX idx_hla_system_reagent_accession on immport.hla_typing_system(reagent_accession);


DROP TABLE IF EXISTS immport.inclusion_exclusion;

CREATE TABLE immport.inclusion_exclusion (
  criterion_accession                  VARCHAR(15) NOT NULL,
  criterion                            VARCHAR(750),
  criterion_category                   VARCHAR(40),
  study_accession                      VARCHAR(15) NOT NULL,
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (criterion_accession)
);

CREATE INDEX idx_inc_exc_study on immport.inclusion_exclusion(study_accession);
CREATE INDEX idx_inc_exc_workspace on immport.inclusion_exclusion(workspace_id);


DROP TABLE IF EXISTS immport.kir_typing_system;

CREATE TABLE immport.kir_typing_system (
  reagent_accession                    VARCHAR(15) NOT NULL,
  alleles_detected                     VARCHAR(500) NOT NULL,
  comments                             VARCHAR(500),
  exons_intron_interrogated            VARCHAR(250) NOT NULL,
  kir_typing_date                      VARCHAR(100) NOT NULL,
  last_pertinent_kir_release           VARCHAR(100) NOT NULL,
  locus_genotyped                      VARCHAR(15) NOT NULL,
  lot_number                           VARCHAR(100),
  primer_probe_seq                     VARCHAR(1000) NOT NULL,
  reagent_type                         VARCHAR(25) NOT NULL,
  typing_method                        VARCHAR(100) NOT NULL,
  typing_system_manufacturer           VARCHAR(100) NOT NULL,
  typing_system_version                VARCHAR(150) NOT NULL,
  workspace_id                         INT,
  PRIMARY KEY (reagent_accession,locus_genotyped)
);

CREATE INDEX idx_kir_system_reagent_accession on immport.kir_typing_system(reagent_accession);


DROP TABLE IF EXISTS immport.lab_test;

CREATE TABLE immport.lab_test (
  lab_test_accession                   VARCHAR(15) NOT NULL,
  lab_test_panel_accession             VARCHAR(15) NOT NULL,
  biosample_accession                  VARCHAR(15),
  name_preferred                       VARCHAR(40),
  name_reported                        VARCHAR(40),
  panel_name_preferred                 VARCHAR(125),
  panel_name_reported                  VARCHAR(125),
  reference_range_accession            VARCHAR(15),
  result_value_reported                VARCHAR(250),
  result_unit_reported                          VARCHAR(40),
  result_value_preferred                         VARCHAR(40),
  result_unit_preferred                          VARCHAR(40),
  study_accession                      VARCHAR(15),
  workspace_id                         INT,
  PRIMARY KEY (lab_test_accession)
);

CREATE INDEX idx_lab_test_study on immport.lab_test(study_accession);
CREATE INDEX idx_lab_test_biosample on immport.lab_test(biosample_accession);
CREATE INDEX idx_lab_test_workspace on immport.lab_test(workspace_id);


DROP TABLE IF EXISTS immport.period;

CREATE TABLE immport.period (
  period_accession                     VARCHAR(15) NOT NULL,
  order_number                         INT,
  study_accession                      VARCHAR(15),
  title                                VARCHAR(250),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (period_accession)
);

CREATE INDEX idx_period_study on immport.period(study_accession);
CREATE INDEX idx_period_workspace on immport.period(workspace_id);


DROP TABLE IF EXISTS immport.planned_visit;

CREATE TABLE immport.planned_visit (
  planned_visit_accession              VARCHAR(15) NOT NULL,
  end_rule                             VARCHAR(256),
  max_start_day                        DECIMAL(10,2),
  min_start_day                        DECIMAL(10,2),
  order_number                   INT,
  period_accession                     VARCHAR(15),
  start_rule                           VARCHAR(256),
  study_accession                      VARCHAR(15),
  visit_name                           VARCHAR(125),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (planned_visit_accession)
);

CREATE INDEX idx_planned_visit_workspace on immport.planned_visit(workspace_id);
CREATE INDEX idx_planned_visit_period on immport.planned_visit(period_accession);


DROP TABLE IF EXISTS immport.planned_visit_2_arm;

CREATE TABLE immport.planned_visit_2_arm (
  planned_visit_accession              VARCHAR(15) NOT NULL,
  arm_accession                        VARCHAR(15) NOT NULL,
  PRIMARY KEY(planned_visit_accession,arm_accession)
);

CREATE INDEX idx_planned_visit_2_arm on immport.planned_visit_2_arm(arm_accession);


DROP TABLE IF EXISTS immport.program;

CREATE TABLE immport.program (
  program_id                           INT NOT NULL,
  deputy_project_officer               VARCHAR(50),
  end_date                             DATE NOT NULL,
  extended_date                        DATE,
  project_officer                      VARCHAR(50),
  start_date                           DATE NOT NULL,
  summary                              VARCHAR(1000),
  title                                VARCHAR(200) NOT NULL,
  PRIMARY KEY (program_id)
);


DROP TABLE IF EXISTS immport.protocol_deviation;

CREATE TABLE immport.protocol_deviation (
  protocol_deviation_accession         VARCHAR(15) NOT NULL,
  deviation_description                VARCHAR(500) NOT NULL,
  deviation_study_end_day              DECIMAL(10,2),
  deviation_study_start_day            DECIMAL(10,2) NOT NULL,
  is_adverse_event_related             VARCHAR(1),
  reason_for_deviation                 VARCHAR(250),
  resolution_of_deviation              VARCHAR(500),
  study_accession                      VARCHAR(15),
  subject_accession                    VARCHAR(15),
  subject_continued_study              VARCHAR(1),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (protocol_deviation_accession)
);

CREATE INDEX idx_procotol_deviation_workspace on immport.protocol_deviation(workspace_id);
CREATE INDEX idx_procotol_deviation_subject on immport.protocol_deviation(subject_accession);
CREATE INDEX idx_procotol_deviation_study on immport.protocol_deviation(study_accession);


DROP TABLE IF EXISTS immport.reagent_set_2_reagent;

CREATE TABLE immport.reagent_set_2_reagent (
  reagent_set_accession                VARCHAR(15) NOT NULL,
  reagent_accession                    VARCHAR(15) NOT NULL,
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (reagent_set_accession)
);

CREATE INDEX idx_reagent_set_reagent on immport.reagent_set_2_reagent(reagent_accession);
CREATE INDEX idx_reagent_set_workspace on immport.reagent_set_2_reagent(workspace_id);


DROP TABLE IF EXISTS immport.reference_range;

CREATE TABLE immport.reference_range (
  reference_range_accession            VARCHAR(15) NOT NULL,
  category                             VARCHAR(40),
  lab_or_study_source                  VARCHAR(256),
  lower_limit                          VARCHAR(40) NOT NULL,
  study_accession                      VARCHAR(15),
  subject_condition                    VARCHAR(40),
  unit_of_measure                      VARCHAR(40) NOT NULL,
  upper_limit                          VARCHAR(40) NOT NULL,
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (reference_range_accession)
);

CREATE INDEX idx_reference_range_workspace on immport.reference_range(workspace_id);
CREATE INDEX idx_reference_range_study on immport.reference_range(study_accession);


DROP TABLE IF EXISTS immport.reported_early_termination;

CREATE TABLE immport.reported_early_termination (
  early_termination_accession          VARCHAR(15) NOT NULL,
  is_adverse_event_related             VARCHAR(1),
  is_subject_requested                 VARCHAR(1),
  reason_preferred                     VARCHAR(40),
  reason_reported                      VARCHAR(250),
  study_accession                      VARCHAR(15),
  study_day_reported                   INT,
  subject_accession                    VARCHAR(15),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (early_termination_accession)
);

CREATE INDEX idx_early_termination_workspace on immport.reported_early_termination(workspace_id);
CREATE INDEX idx_early_termination_study on immport.reported_early_termination(study_accession);
CREATE INDEX idx_early_termination_subject on immport.reported_early_termination(subject_accession);


DROP TABLE IF EXISTS immport.standard_curve;

CREATE TABLE immport.standard_curve (
  standard_curve_accession             VARCHAR(15) NOT NULL,
  experiment_accession                 VARCHAR(15) NOT NULL,
  analyte_name                         VARCHAR(100),
  assay_group_id                       VARCHAR(100),
  assay_id                             VARCHAR(100),
  comments                             VARCHAR(500),
  data_format                          VARCHAR(100),
  formula                              VARCHAR(500),
  lower_limit                          VARCHAR(100),
  lower_limit_unit                     VARCHAR(100),
  resultset_name                       VARCHAR(200),
  result_schema                        VARCHAR(50),
  result_tot_recs                      INT,
  upper_limit                          VARCHAR(100),
  upper_limit_unit                     VARCHAR(100),
  workspace_id                         INT,
  PRIMARY KEY (standard_curve_accession)
);

CREATE INDEX idx_stdcurve_experiment on immport.standard_curve(experiment_accession);
CREATE INDEX idx_stdcurve_workspace on immport.standard_curve(workspace_id);


DROP TABLE IF EXISTS immport.standard_curve_2_file_info;

CREATE TABLE immport.standard_curve_2_file_info (
  standard_curve_accession              VARCHAR(15) NOT NULL,
  experiment_accession                  VARCHAR(15) NOT NULL,
  file_info_id                         INT,
  PRIMARY KEY(standard_curve_accession,file_info_id)
);

CREATE INDEX idx_stdcurve_2_file_info on immport.standard_curve_2_file_info(file_info_id,standard_curve_accession);


DROP TABLE IF EXISTS immport.study_2_panel;

CREATE TABLE immport.study_2_panel (
  study_accession                      VARCHAR(15) NOT NULL,
  panel_name                           VARCHAR(100) NOT NULL,
  PRIMARY KEY(study_accession,panel_name)
);


DROP TABLE IF EXISTS immport.study_file;

CREATE TABLE immport.study_file (
  study_file_accession                 VARCHAR(15) NOT NULL,
  description                          VARCHAR(1000),
  file_name                            VARCHAR(100),
  study_accession                      VARCHAR(15) NOT NULL,
  study_file                           BYTEA,
  study_file_type                      VARCHAR(50),
  title                                VARCHAR(250),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY(study_file_accession)
);

CREATE INDEX idx_study_file_type on immport.study_file(study_file_type);
CREATE INDEX idx_study_file_workspace on immport.study_file(workspace_id);
CREATE INDEX idx_study_file_study on immport.study_file(study_accession);


DROP TABLE IF EXISTS immport.study_glossary;

CREATE TABLE immport.study_glossary (
  study_accession                      VARCHAR(15) NOT NULL,
  definition                           VARCHAR(500) NOT NULL,
  term                                 VARCHAR(125) NOT NULL,
  workspace_id                         INT,
  PRIMARY KEY (study_accession, term)
);


DROP TABLE IF EXISTS immport.study_image;

CREATE TABLE immport.study_image (
  schematic_accession                  VARCHAR(15) NOT NULL,
  description                          VARCHAR(1000),
  image                                BYTEA,
  image_filename                       VARCHAR(100),
  image_map                            BYTEA,
  image_map_filename                         VARCHAR(100),
  image_type                           VARCHAR(40),
  study_accession                      VARCHAR(15) NOT NULL,
  title                                VARCHAR(250),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY(schematic_accession)
);

CREATE INDEX idx_study_image_workspace on immport.study_image(workspace_id);
CREATE INDEX idx_study_image_study on immport.study_image(study_accession);


DROP TABLE IF EXISTS immport.study_link;

CREATE TABLE immport.study_link (
  study_link_id                        INT NOT NULL,
  name                                 VARCHAR(500),
  study_accession                      VARCHAR(15) NOT NULL,
  type                                 VARCHAR(50),
  value                                VARCHAR(2000),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY(study_link_id)
);

CREATE INDEX idx_study_link_workspace on immport.study_link(workspace_id);
CREATE INDEX idx_study_link_study on immport.study_link(study_accession);


DROP TABLE IF EXISTS immport.study_personnel;

CREATE TABLE immport.study_personnel (
  person_accession                     VARCHAR(15) NOT NULL,
  email                                VARCHAR(40),
  first_name                           VARCHAR(40),
  honorific                            VARCHAR(20),
  last_name                            VARCHAR(40),
  organization                         VARCHAR(125),
  role_in_study                        VARCHAR(40),
  site_name                            VARCHAR(100),
  study_accession                      VARCHAR(15) NOT NULL,
  suffixes                             VARCHAR(40),
  title_in_study                       VARCHAR(100),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY(person_accession)
);

CREATE INDEX idx_study_personnel_workspace on immport.study_personnel(workspace_id);
CREATE INDEX idx_study_personnel_study on immport.study_personnel(study_accession);


DROP TABLE IF EXISTS immport.study_pubmed;

CREATE TABLE immport.study_pubmed (
  study_accession                      VARCHAR(15) NOT NULL,
  pubmed_id                            VARCHAR(16) NOT NULL,
  authors                              VARCHAR(4000),
  issue                                VARCHAR(20),
  journal                              VARCHAR(250),
  month                                VARCHAR(2),
  pages                                VARCHAR(20),
  title                                VARCHAR(4000),
  year                                 VARCHAR(4),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY(study_accession,pubmed_id)
);

CREATE INDEX idx_study_pubmed_workspace on immport.study_pubmed(workspace_id);
CREATE INDEX idx_study_pubmed_pubmed_id on immport.study_pubmed(pubmed_id);


DROP TABLE IF EXISTS immport.subject_measure_definition;

CREATE TABLE immport.subject_measure_definition (
  subject_measure_accession            VARCHAR(15) NOT NULL,
  algorithm                            VARCHAR(1024),
  category_title                       VARCHAR(125),
  description                          VARCHAR(256),
  measureofcentraltendency             VARCHAR(40),
  measureofdispersion                  VARCHAR(40),
  measuretype                          VARCHAR(40),
  outcometype                          VARCHAR(70),
  study_accession                      VARCHAR(15),
  timeframe                            VARCHAR(256),
  title                                VARCHAR(125),
  unitofmeasure                        VARCHAR(2),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (subject_measure_accession)
);

CREATE INDEX idx_subject_measure_workspace on immport.subject_measure_definition(workspace_id);
CREATE INDEX idx_subject_measure_study on immport.subject_measure_definition(study_accession);


DROP TABLE IF EXISTS immport.substance_merge;

CREATE TABLE immport.substance_merge (
  merge_accession                      VARCHAR(15) NOT NULL,
  actual_visit_accession               VARCHAR(15),
  compound_name_reported               VARCHAR(250),
  compound_other_name_reported         VARCHAR(125),
  compound_role                        VARCHAR(40) NOT NULL,
  dose                                 DECIMAL(10,2),
  dose_freq_per_interval               VARCHAR(40),
  dose_reported                        VARCHAR(150),
  dose_units                           VARCHAR(40),
  duration                             DECIMAL(10,2),
  duration_unit                        VARCHAR(10),
  end_day                              DECIMAL(10,2),
  end_day_from_partial_date            VARCHAR(1),
  end_time                             VARCHAR(40),
  formulation                          VARCHAR(125),
  is_ongoing                           VARCHAR(40),
  merge_name_preferred                 VARCHAR(40),
  merge_name_reported                  VARCHAR(125) NOT NULL,
  reported_indication                  VARCHAR(255),
  route_of_admin_preferred             VARCHAR(40),
  route_of_admin_reported              VARCHAR(40),
  start_day                            DECIMAL(10,2),
  start_day_from_partial_date          VARCHAR(1),
  start_time                           VARCHAR(40),
  status                               VARCHAR(40),
  study_accession                      VARCHAR(15) NOT NULL,
  subject_accession                    VARCHAR(15),
  workspace_id                         INT NOT NULL,
  PRIMARY KEY (merge_accession)
);

CREATE INDEX idx_substance_merge_study on immport.substance_merge(study_accession);
CREATE INDEX idx_substance_merge_workspace on immport.substance_merge(workspace_id);
CREATE INDEX idx_substance_subject on immport.substance_merge(subject_accession);


-- some tables have changed (i.e. fields added, renamed, or removed)
ALTER TABLE immport.lk_data_format ADD COLUMN parsed_data_table VARCHAR(100);
ALTER TABLE immport.lk_exp_measurement_tech ADD COLUMN display VARCHAR(1);
ALTER TABLE immport.lk_exp_measurement_tech ADD COLUMN display_order INT;
ALTER TABLE immport.lk_gender ADD COLUMN description VARCHAR(200);
ALTER TABLE immport.biosample ADD COLUMN actual_visit_accession VARCHAR(15);
ALTER TABLE immport.biosample_2_expsample ADD COLUMN experiment_accession VARCHAR(15);
ALTER TABLE immport.expsample_2_file_info ADD COLUMN experiment_accession VARCHAR(15);
ALTER TABLE immport.expsample_2_reagent ADD COLUMN experiment_accession VARCHAR(15);
ALTER TABLE immport.study ADD COLUMN actual_completion_date DATE;
ALTER TABLE immport.study ADD COLUMN actual_enrollment INT;
ALTER TABLE immport.study ADD COLUMN actual_start_date DATE;
ALTER TABLE immport.study ADD COLUMN age_unit VARCHAR(40);
ALTER TABLE immport.study ADD COLUMN dcl_id INT;
ALTER TABLE immport.study ADD COLUMN description TEXT;
ALTER TABLE immport.study ADD COLUMN download_page_available VARCHAR(1);
ALTER TABLE immport.study ADD COLUMN final_public_release_date DATE;
ALTER TABLE immport.study ADD COLUMN gender_included VARCHAR(15);
ALTER TABLE immport.study ADD COLUMN maximum_age VARCHAR(40);
ALTER TABLE immport.study ADD COLUMN minimum_age VARCHAR(40);
ALTER TABLE immport.study ADD COLUMN planned_public_release_date DATE;

-- fields removed from ImmPort archive that are in LabKey's immport schema:
ALTER TABLE immport.subject DROP COLUMN user_defined_id;
ALTER TABLE immport.biosample DROP COLUMN user_defined_id;
ALTER TABLE immport.experiment DROP COLUMN user_defined_id;
ALTER TABLE immport.expsample DROP COLUMN upload_result_status;
ALTER TABLE immport.expsample DROP COLUMN result_name;
ALTER TABLE immport.expsample DROP COLUMN user_defined_id;
ALTER TABLE immport.reagent DROP COLUMN user_defined_id;
ALTER TABLE immport.protocol DROP COLUMN user_defined_id;
ALTER TABLE immport.study DROP COLUMN user_defined_id;
ALTER TABLE immport.arm_or_cohort DROP COLUMN user_defined_id;
ALTER TABLE immport.arm_2_subject DROP COLUMN study_enrollment_day;

-- fields renamed in ImmPort archive that are in LabKey's immport schema:
ALTER TABLE immport.lk_species RENAME COLUMN description TO common_name;
ALTER TABLE immport.biosample RENAME COLUMN biosampling_acc_num TO biosampling_accession;
ALTER TABLE immport.study RENAME COLUMN study_type TO type;
ALTER TABLE immport.arm_2_subject RENAME COLUMN age_unit TO age_at_enrollment_unit;

-- change length of a few varchar fields because of data loading issues
-- TODO: schema says length 20
ALTER TABLE immport.pcr_result ALTER COLUMN unit_reported TYPE VARCHAR(100);
-- TODO: schema says length 20
ALTER TABLE immport.lk_study_type ALTER COLUMN name TYPE VARCHAR(40);
-- TODO: schema says length 40
ALTER TABLE immport.lab_test ALTER COLUMN name_reported TYPE VARCHAR(100);
-- TODO: schema says length 2
ALTER TABLE immport.subject_measure_definition ALTER COLUMN unitofmeasure TYPE VARCHAR(20);
