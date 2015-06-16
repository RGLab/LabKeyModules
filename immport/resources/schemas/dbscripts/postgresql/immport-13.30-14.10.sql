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


/* immport-13.30-13.31.sql */

ALTER TABLE immport.study ALTER gender_included TYPE VARCHAR(40);
ALTER TABLE immport.study_pubmed ALTER month TYPE VARCHAR(40);


CREATE TABLE immport.dimAssay (ParticipantId VARCHAR(100), Assay VARCHAR(100));
CREATE INDEX participantassay ON immport.dimAssay (ParticipantId,Assay);
CREATE INDEX assayparticipant ON immport.dimAssay (Assay,ParticipantId);


CREATE TABLE immport.dimDemographic
(
   ParticipantId VARCHAR(100),
   AgeInYears INTEGER,
   Species VARCHAR(100),
   Gender VARCHAR(100),
   Race VARCHAR(100),
   Age VARCHAR(100)
);
CREATE INDEX participantage ON immport.dimDemographic (ParticipantId,AgeInYears);
CREATE INDEX ageparticipant ON immport.dimDemographic (AgeInYears,ParticipantId);
CREATE INDEX participantagegroup ON immport.dimDemographic (ParticipantId,Age);
CREATE INDEX agegroupparticipant ON immport.dimDemographic (Age,ParticipantId);
CREATE INDEX participantspecies ON immport.dimDemographic (ParticipantId,Species);
CREATE INDEX speciesparticipant ON immport.dimDemographic (Species,ParticipantId);
CREATE INDEX participantgender ON immport.dimDemographic (ParticipantId,Gender);
CREATE INDEX genderparticipant ON immport.dimDemographic (Gender,ParticipantId);
CREATE INDEX participantrace ON immport.dimDemographic (ParticipantId,Race);
CREATE INDEX raceparticipant ON immport.dimDemographic (Race,ParticipantId);


-- DROP TABLE immport.dimStudy;
CREATE TABLE immport.dimStudy (ParticipantId VARCHAR(100), Study VARCHAR(100), Type VARCHAR(100), SortOrder INTEGER);
CREATE INDEX participantstudy ON immport.dimStudy (ParticipantId,Study);
CREATE INDEX studyparticipant ON immport.dimStudy (Study,ParticipantId);
CREATE INDEX participanttype ON immport.dimStudy (ParticipantId,Type);
CREATE INDEX typeparticipant ON immport.dimStudy (Type,ParticipantId);


CREATE TABLE immport.dimStudyCondition (Study VARCHAR(100), Condition VARCHAR(100));
CREATE INDEX studycondition ON immport.dimStudyCondition (Study,Condition);
CREATE INDEX conditionstudy ON immport.dimStudyCondition (Condition,Study);


-- DROP TABLE immport.dimStudyTimepoint
CREATE TABLE immport.dimStudyTimepoint (Study VARCHAR(100), Timepoint VARCHAR(100), SortOrder INTEGER);
CREATE INDEX studytme ON immport.dimStudyTimepoint (Study,Timepoint);
CREATE INDEX timestudy ON immport.dimStudyTimepoint (Timepoint,Study);

/* immport-13.31-13.32.sql */

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
  assay                   VARCHAR(40) NOT NULL
);
CREATE UNIQUE INDEX idx_summary_sas ON immport.summarySubjectAssayStudy(study_accession, assay, subject_accession);
