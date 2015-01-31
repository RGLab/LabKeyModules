/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT
subject.subject_accession as participantid,
subject.subject_accession,
subject.description,
subject.phenotype,
subject.age_reported,
subject.age_unit,
subject.age_event,
subject.age_event_specify,
subject.strain,
subject.strain_characteristics,
subject.gender,
subject.ethnicity,
subject.population_name,
subject.race,
subject.race_specify,
subject.species,
subject.taxonomy_id,
subject.workspace_id
FROM subject
WHERE $STUDY IS NULL OR subject_accession IN (select subject_accession from q_subject_2_study s2s where s2s.study_accession=$STUDY)
