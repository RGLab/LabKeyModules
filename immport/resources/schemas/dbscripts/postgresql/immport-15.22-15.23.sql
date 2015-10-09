/*
* Copyright (c) 2015 LabKey Corporation
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

ALTER TABLE immport.reagent_set_2_reagent
    DROP CONSTRAINT reagent_set_2_reagent_pkey;

ALTER TABLE immport.reagent_set_2_reagent
    ADD CONSTRAINT reagent_set_2_reagent_pkey PRIMARY KEY (reagent_set_accession, reagent_accession);


ALTER TABLE immport.fcs_header_marker
    DROP CONSTRAINT fcs_header_marker_pkey;

ALTER TABLE immport.fcs_header_marker
    ADD CONSTRAINT fcs_header_marker_pkey PRIMARY KEY (fcs_header_id, parameter_number);


