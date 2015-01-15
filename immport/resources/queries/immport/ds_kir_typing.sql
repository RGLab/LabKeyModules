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
FROM kir_typing_result AS result
WHERE $STUDY IS NULL OR $STUDY = result.study_accession
