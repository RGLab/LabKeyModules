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

-- we basically pretend this is part of the immport schema, it's calcuated at immport archive load time
-- see q_subject_2_study.sql
CREATE TABLE immport.subject_2_study
(
  subject_accession       VARCHAR(10) NOT NULL,
  study_accession         VARCHAR(15) NOT NULL
);
CREATE UNIQUE INDEX idx_subject_2_study_1 ON immport.subject_2_study(subject_accession,study_accession);
CREATE UNIQUE INDEX idx_subject_2_study_2 ON immport.subject_2_study(study_accession,subject_accession);

-- this is more or less the fact table of the study finder cube, it joins subject,assays,studies
-- it is populated along with the other cube dimension tables
-- see immport-create.sql
CREATE TABLE immport.summarySubjectAssayStudy
(
  subject_accession       VARCHAR(10) NOT NULL,
  study_accession         VARCHAR(15) NOT NULL,
  assay                   VARCHAR(15) NOT NULL
);
CREATE UNIQUE INDEX idx_summary_sas ON immport.summarySubjectAssayStudy(study_accession, assay, subject_accession);
