/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT
fcc.participantid                   AS participantid,
fcc.sequencenum                     AS sequencenum,
fcc.biosample_accession             AS biosample_accession,
fcc.expsample_accession             AS expsample_accession,
ds_fcs_sample_files.file_info_name  AS sample_file,
fcc.file_info_name                  AS control_file,
fcc.study_time_collected            AS study_time_collected,
fcc.study_time_collected_unit       AS study_time_collected_unit,
fcc.arm_accession                   AS arm_accession
FROM
(
  SELECT DISTINCT
  file_info.name AS file_info_name,
  --file_info.purpose AS file_info_purpose,
  biosample_2_expsample.expsample_accession AS expsample_accession,
  biosample.biosample_accession,
  biosample.subject_accession as participantid,
  COALESCE(biosample.study_time_collected,9999.0000) as sequencenum,
  --biosample.biosampling_accession,
  --biosample.description,
  --biosample.name AS biosample_name,
  --biosample.type,
  --biosample.subtype,
  biosample.study_time_collected,
  biosample.study_time_collected_unit,
  --biosample.study_time_t0_event,
  --biosample.study_time_t0_event_specify,
  --biosample.study_accession,
  --arm_or_cohort.arm_accession,
  arm_or_cohort.arm_accession AS arm_accession
   FROM
  biosample, biosample_2_expsample, expsample_2_file_info, file_info, arm_2_subject, arm_or_cohort
   WHERE
  biosample.biosample_accession = biosample_2_expsample.biosample_accession AND
  biosample_2_expsample.expsample_accession = expsample_2_file_info.expsample_accession AND
  expsample_2_file_info.file_info_id = file_info.file_info_id AND
  biosample.subject_accession = arm_2_subject.subject_accession AND
  arm_2_subject.arm_accession = arm_or_cohort.arm_accession AND
  biosample.study_accession = arm_or_cohort.study_accession AND
  file_info.name LIKE '%.fcs' AND
  file_info.purpose = 'Flow cytometry compensation or control'
  AND ($STUDY IS NULL OR $STUDY = biosample.study_accession)
) AS fcc,
ds_fcs_sample_files
WHERE
ds_fcs_sample_files.expsample_accession = fcc.expsample_accession
