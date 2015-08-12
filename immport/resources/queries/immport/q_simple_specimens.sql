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
biosample_accession AS "Global Unique Id",
biosample_accession AS "Sample Id",
NULL AS "Draw Timestamp",
COALESCE(study_time_collected_in_days, 9999.0000) as "Visit",
subject_accession || '.' || SUBSTRING(study_accession,4) as "Subject Id",
NULL AS "Volume",
primary_type AS "Primary Type",
derivative_type AS "Derivative Type",
NULL AS "Additive Type"

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

    CASE WHEN type = 'Body_Fluid' THEN (
      CASE subtype
        WHEN 'Periperal Blood' THEN 'Peripheral Blood'
        WHEN 'Plasma' THEN 'Plasma'
        WHEN 'Whole_Blood' THEN 'Whole Blood'
        WHEN 'Whole blood' THEN 'Whole Blood'
        WHEN 'blood' THEN 'Blood'
        WHEN 'saliva' THEN 'Saliva'
        WHEN 'serum' THEN 'Serum'
        WHEN 'urine' THEN 'Urine'
        ELSE subtype
      END
    ) ELSE NULL
    END as derivative_type,

    CASE type
      WHEN 'Body_Fluid' THEN 'Body Fluid'
      ELSE type
    END AS primary_type


    FROM biosample
) AS _
WHERE $STUDY IS NULL OR $STUDY = study_accession

--ORDER BY biosample_accession, sequenceNum LIMIT 2500
