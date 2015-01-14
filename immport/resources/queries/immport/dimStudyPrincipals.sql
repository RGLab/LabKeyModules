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
SELECT
  study_accession AS study,
  /* (CASE WHEN honorific IS NULL THEN '' ELSE honorific || ' ' END) ||*/ first_name || ' ' || last_name AS full_name,
  last_name || '_' || first_name AS sortorder
FROM immport.study_personnel
WHERE role_in_study IN ('Co-Principal Investigator','Principal Investigator')
ORDER BY sortorder
