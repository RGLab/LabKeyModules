/*
 * Copyright (c) 2013-2014 LabKey Corporation
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

CREATE TABLE immport.lk_research_focus (
  name                                 VARCHAR(50) NOT NULL,
  description                          VARCHAR(250),
  PRIMARY KEY (name)
);

CREATE TABLE immport.study_categorization (
  study_categorization_id              INT NOT NULL,
  study_accession                      VARCHAR(15) NOT NULL,
  research_focus                       VARCHAR(50) NOT NULL,
  PRIMARY KEY(study_categorization_id)
);

-- change length of a few varchar fields because of changes to ImmPort archive or data loading issues
ALTER TABLE immport.arm_or_cohort ALTER COLUMN description TYPE VARCHAR(2000);
ALTER TABLE immport.study_pubmed ALTER COLUMN month TYPE VARCHAR(3);
-- TODO: schema says length 20
ALTER TABLE immport.elispot_result ALTER COLUMN cell_type TYPE VARCHAR(30);

-- changes to treatment table based on ImmPort archive changes from 09-26-2013
ALTER TABLE immport.treatment DROP COLUMN concentration_unit;
ALTER TABLE immport.treatment DROP COLUMN concentration_value;
ALTER TABLE immport.treatment DROP COLUMN other;
ALTER TABLE immport.treatment DROP COLUMN time_unit;
ALTER TABLE immport.treatment DROP COLUMN time_value;
ALTER TABLE immport.treatment DROP COLUMN volume_unit;
ALTER TABLE immport.treatment DROP COLUMN volume_value;
ALTER TABLE immport.treatment DROP COLUMN weight_unit;
ALTER TABLE immport.treatment DROP COLUMN weight_value;
ALTER TABLE immport.treatment ADD COLUMN amount_unit VARCHAR(50);
ALTER TABLE immport.treatment ADD COLUMN amount_value VARCHAR(50);
ALTER TABLE immport.treatment ADD COLUMN duration_unit VARCHAR(50);
ALTER TABLE immport.treatment ADD COLUMN duration_value VARCHAR(200);