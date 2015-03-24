/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT 
subject.subject_accession AS participantid,
subject.subject_accession,
CAST(0 AS INTEGER) as sequencenum,
arm_or_cohort.*
FROM subject
  LEFT OUTER JOIN arm_2_subject ON subject.subject_accession = arm_2_subject.subject_accession
  LEFT OUTER JOIN arm_or_cohort ON arm_2_subject.arm_accession = arm_or_cohort.arm_accession
WHERE $STUDY IS NULL OR $STUDY = arm_or_cohort.study_accession
