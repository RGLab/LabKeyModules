  /*
 * Copyright (c) 2013-2014 LabKey Corporation
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
   CASE file_info.purpose
     WHEN 'Gene expression result' THEN 'Gene Expression'
     WHEN 'CyTOF result' THEN 'CyTOF'
     ELSE 'UNKNOWN'
   END as assay,
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
  file_info.purpose IN ('Gene expression result', 'CyTOF result')
) X;

/*
UNION ALL

SELECT 'measure' AS assay,
NULL AS arm_accession,NULL AS biosample_accession,NULL AS expsample_accession,NULL AS experiment_accession,study_accession,NULL AS study_time_collected,NULL AS study_time_collected_unit,subject_accession,workspace_id
FROM subject_measure_result
*/


CREATE OR REPLACE FUNCTION immport.fn_populateDimensions() RETURNS INTEGER AS $$
BEGIN


  -- dimAssay

  DELETE FROM immport.dimAssay;
  INSERT INTO immport.dimAssay (Study, Assay)
  SELECT DISTINCT
    study_accession AS Study,
    assay as Assay
  FROM immport.v_results_union;


  -- dimDemographic

  DELETE FROM immport.dimDemographic;
  INSERT INTO immport.dimDemographic
  SELECT DISTINCT
    subject_accession AS ParticipantId,
    CASE age_unit
    WHEN 'Years' THEN floor(age_reported)
      WHEN 'Weeks' THEN 0
      WHEN 'Months' THEN 0
      ELSE NULL
    END as AgeInYears,
    species As Species,
    gender AS Gender,
    coalesce(race,'Not_Specified') AS Race,
    CASE
      WHEN floor(age_reported) < 10 THEN '0-10'
      WHEN floor(age_reported) < 20 THEN '11-20'
      WHEN floor(age_reported) < 30 THEN '21-30'
      WHEN floor(age_reported) < 40 THEN '31-40'
      WHEN floor(age_reported) < 50 THEN '41-50'
      WHEN floor(age_reported) < 60 THEN '51-60'
      WHEN floor(age_reported) < 70 THEN '61-70'
      WHEN floor(age_reported) >= 70 THEN '> 70'
      ELSE 'Unknown'
    END AS Age
  FROM immport.subject;


  -- dimStudy

  DELETE FROM immport.dimStudy;

  INSERT INTO immport.dimStudy (ParticipantId, Study, Type, Program, SortOrder)
    SELECT DISTINCT
      subject_accession AS ParticipantId,
      study.study_accession as Study,
      study.type as Type,
      P.title as Program,
      cast(substring(study.study_accession,4) as integer) as SortOrder
    FROM immport.subject_2_study _ss
      INNER JOIN immport.study ON _ss.study_accession = study.study_accession
      LEFT OUTER JOIN immport.workspace W ON study.workspace_id = W.workspace_id
      LEFT OUTER JOIN immport.contract_grant C ON W.contract_id = C.contract_grant_id
      LEFT OUTER JOIN immport.program P on C.program_id = P.program_id;


  -- dimStudyCondition

  DELETE FROM immport.dimStudyCondition;
  INSERT INTO immport.dimStudyCondition (Study, Condition)

      SELECT study_accession AS Study, 'Ragweed Allergy' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%ragweed%'

      UNION ALL

      SELECT study_accession AS Study, 'Atopic Dermatitis' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%atopic dermatitis%'

      UNION ALL

      SELECT study_accession AS Study, 'Clostridium difficile' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%clostridium difficile%' OR
        lower(official_title || ' ' || condition_studied) like '%c. difficile%'

      UNION ALL

      SELECT study_accession AS Study, 'Renal transplant' as Condition
      FROM immport.study
      WHERE
        (lower(official_title || ' ' || condition_studied) like '%renal%' OR
        lower(official_title || ' ' || condition_studied) like '%kidney%') AND
        lower(official_title || ' ' || condition_studied) like '%transplant%'


      UNION ALL

      SELECT study_accession AS Study, 'Arthritis' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%arthritis%'


      UNION ALL

      SELECT study_accession AS Study, 'Hepatitis C' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%hepatitis c%'

      UNION ALL

      SELECT study_accession AS Study, 'Influenza' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%flu%'

      UNION ALL

      SELECT study_accession AS Study, 'Smallpox' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%smallpox%'


      UNION ALL

      SELECT study_accession AS Study, 'Tuberculosis' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%tuberculosis%'

      UNION ALL

      SELECT study_accession AS Study, 'Lupus' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%lupus%'

      UNION ALL

      SELECT study_accession AS Study, 'West Nile virus' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%west nile%' OR
        lower(official_title || ' ' || condition_studied) like '%WNv%'

      UNION ALL

      SELECT study_accession AS Study, 'Asthma' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%asthma%'


      UNION ALL

      SELECT study_accession AS Study, 'Typhoid' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%typhoid%'

      UNION ALL

      SELECT study_accession AS Study, 'Cholera' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%cholera%'

      UNION ALL

      SELECT study_accession AS Study, 'Vasculitis' as Condition
      FROM immport.study
      WHERE
        lower(official_title || ' ' || condition_studied) like '%vasculitis%'
      ;


  -- dimStudyTimepoint

  DELETE FROM immport.dimStudyTimepoint;
  INSERT INTO immport.dimStudyTimepoint (Study, Timepoint, SortOrder)
   SELECT DISTINCT
    study_accession as Study,
    CASE
      WHEN study_day < 0 THEN '<0'
      WHEN study_day <= 14 THEN CAST(study_day AS VARCHAR)
      WHEN study_day < 28 THEN '15-27'
      WHEN study_day = 28 THEN '28'
      WHEN study_day < 56 THEN '29-55'
      WHEN study_day = 56 THEN '56'
      WHEN study_day > 56 THEN '>56'
      ELSE 'Unknown'
    END as Timepoint,
    CASE
      WHEN study_day < 0 THEN -1
      WHEN study_day <= 14 THEN study_day
      WHEN study_day < 28 THEN 15
      WHEN study_day = 28 THEN 28
      WHEN study_day < 56 THEN 29
      WHEN study_day = 56 THEN 56
      WHEN study_day > 56 THEN 57
      ELSE -2
    END as sortorder
  FROM immport.v_results_union
  ORDER BY study_accession, sortorder;


  -- summarySubjectAssayStudy
  DELETE FROM immport.summarySubjectAssayStudy;
  INSERT INTO  immport.summarySubjectAssayStudy (subject_accession, assay, study_accession)
  SELECT DISTINCT subject_accession, assay, study_accession
  FROM immport.v_results_union
  WHERE subject_accession IS NOT NULL AND assay IS NOT NULL AND study_accession IS NOT NULL;


  RETURN 1;
  END;
$$ LANGUAGE plpgsql;
