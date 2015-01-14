/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT DISTINCT
biosample.subject_accession,
biosample.study_accession
FROM biosample
WHERE subject_accession IS NOT NULL AND study_accession IS NOT NULL
