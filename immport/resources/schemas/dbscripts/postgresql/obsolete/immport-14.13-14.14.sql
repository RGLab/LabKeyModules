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


DROP TABLE IF EXISTS immport.dimAssay;
CREATE TABLE immport.dimAssay (Study VARCHAR(100), Assay VARCHAR(100));
CREATE INDEX studyassay ON immport.dimAssay (Study,Assay);
CREATE INDEX assaystudy ON immport.dimAssay (Assay,Study);

/* remove below this line in consolidated script */

CREATE OR REPLACE VIEW immport.v_results_union AS

  SELECT
    assay,arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id,
    CASE study_time_collected_unit
    WHEN 'Days' THEN FLOOR(study_time_collected)
    WHEN 'Hours' THEN FLOOR(study_time_collected/24)
    ELSE NULL
    END as study_day
  FROM (

         SELECT 'ELISA' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.elisa_result

         UNION ALL

         SELECT 'ELISPOT' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.elispot_result

         UNION ALL

         SELECT 'Flow Cytometry' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.fcs_analyzed_result

         UNION ALL

         SELECT 'HAI' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.hai_result

         UNION ALL

         SELECT 'HLA Typing' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.hla_typing_result

         UNION ALL

         SELECT 'KIR' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.kir_typing_result

         UNION ALL

         SELECT 'MBAA' AS assay,
           arm_accession,biosample_accession,NULL AS expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.mbaa_result


         UNION ALL

         SELECT 'Neutralizing Antibody' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.neut_ab_titer_result

         UNION ALL

         SELECT 'PCR' AS assay,
           arm_accession,biosample_accession,expsample_accession,experiment_accession,study_accession,study_time_collected,study_time_collected_unit,subject_accession,workspace_id
         FROM immport.pcr_result

         UNION ALL

         SELECT
           'Gene Expression' as assay,
           arm_or_cohort.arm_accession,
           biosample.biosample_accession,
           biosample_2_expsample.expsample_accession,
           biosample_2_expsample.experiment_accession,
           biosample.study_accession,
           biosample.study_time_collected,
           biosample.study_time_collected_unit,
           biosample.subject_accession,
           biosample.workspace_id
         FROM
           immport.biosample
           JOIN immport.biosample_2_expsample ON biosample.biosample_accession = biosample_2_expsample.biosample_accession
           JOIN immport.expsample_2_file_info ON biosample_2_expsample.expsample_accession = expsample_2_file_info.expsample_accession
           JOIN immport.file_info ON expsample_2_file_info.file_info_id = file_info.file_info_id
           JOIN immport.arm_2_subject ON biosample.subject_accession = arm_2_subject.subject_accession
           JOIN immport.arm_or_cohort ON arm_2_subject.arm_accession = arm_or_cohort.arm_accession AND biosample.study_accession = arm_or_cohort.study_accession
         WHERE
           file_info.purpose = 'Gene expression result'
       ) X;


INSERT INTO immport.dimAssay (Study, Assay)
  SELECT DISTINCT
    study_accession AS Subject,
    assay as Assay
  FROM immport.v_results_union;


DROP VIEW immport.v_results_union;
