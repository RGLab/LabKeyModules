/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT subject_accession, study_accession, count(*) as member
FROM q_subject_2_study
GROUP BY subject_accession, study_accession
PIVOT member BY study_accession IN (SELECT study_accession, study_accession AS label from study ORDER BY CAST(substring(study_accession,4) AS INTEGER))