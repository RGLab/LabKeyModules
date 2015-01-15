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
PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT

biosample_accession AS global_unique_specimen_id,
0 AS originating_location,
0 AS lab_id,
subject_accession as ptid,
COALESCE(study_time_collected_in_days, 9999.0000) as visit_value,
primary_type_id AS primary_type_id,
LTRIM(RTRIM(COALESCE(description,'') || ' ' || COALESCE(subtype,''))) AS specimenDerivativeType,

-- passthrough --
biosample_accession,
biosampling_accession,
description,
name,
type,
subtype,
study_time_collected,
study_time_collected_unit,
study_time_t0_event,
study_time_t0_event_specify,
study_accession,
workspace_id,
actual_visit_accession

FROM
(
    SELECT biosample.*,

    CASE
      WHEN study_time_collected IS NULL THEN NULL
      WHEN ('days'=LOWER(COALESCE(study_time_collected_unit,'days'))) THEN study_time_collected
      WHEN ('hours'=LOWER(study_time_collected_unit)) THEN (study_time_collected/24.0)
      WHEN ('minutes'=LOWER(study_time_collected_unit)) THEN (study_time_collected/(24.0*60.0))
      ELSE NULL
    END AS study_time_collected_in_days,

    CASE type
      WHEN 'Body_Fluid' THEN 1
      WHEN 'Carbohydrate' THEN 2
      WHEN 'Cell' THEN 3
      WHEN 'DNA' THEN 4
      WHEN 'Lipid' THEN 5
      WHEN 'Organ' THEN 6
      WHEN 'Other' THEN 7
      WHEN 'Protein' THEN 8
      WHEN 'RNA' THEN 9
      WHEN 'Small_Molecule' THEN 10
      WHEN 'Subcellular_Structure' THEN 11
      WHEN 'Subject' THEN 12
      WHEN 'Tissue' THEN 13
      ELSE NULL
    END AS primary_type_id


    FROM biosample
) AS _
WHERE $STUDY IS NULL OR $STUDY = study_accession

--ORDER BY biosample_accession, sequenceNum LIMIT 2500
