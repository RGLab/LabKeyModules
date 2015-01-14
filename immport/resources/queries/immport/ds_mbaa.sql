/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT
  subject_accession as participantid,
  COALESCE(study_time_collected,9999.0000) as sequencenum,
  result.*
FROM mbaa_result AS result
WHERE subject_accession IS NOT NULL -- the mbaa_result table contains control and standard sample records as well
  AND ($STUDY IS NULL OR $STUDY = result.study_accession)
