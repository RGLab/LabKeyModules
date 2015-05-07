/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
biosample.subject_accession,
biosample.study_accession
FROM biosample
WHERE subject_accession IS NOT NULL AND study_accession IS NOT NULL

UNION

SELECT
  subject.subject_accession,
  arm_or_cohort.study_accession
FROM subject
  INNER JOIN arm_2_subject ON subject.subject_accession = arm_2_subject.subject_accession
  INNER JOIN arm_or_cohort ON arm_2_subject.arm_accession = arm_or_cohort.arm_accession
WHERE subject.subject_accession IS NOT NULL AND arm_or_cohort.study_accession IS NOT NULL