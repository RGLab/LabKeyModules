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
package org.labkey.immport.data;

public class StudyPersonnelBean
{
    String person_accession;
    String email;
    String first_name;
    String last_name;
    String honorific;
    String organization;
    String role_in_study;
    String study_accession;
    int workspace_id;

    public String getPerson_accession()
    {
        return person_accession;
    }

    public void setPerson_accession(String person_accession)
    {
        this.person_accession = person_accession;
    }

    public String getEmail()
    {
        return email;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    public String getFirst_name()
    {
        return first_name;
    }

    public void setFirst_name(String first_name)
    {
        this.first_name = first_name;
    }

    public String getLast_name()
    {
        return last_name;
    }

    public void setLast_name(String last_name)
    {
        this.last_name = last_name;
    }

    public String getHonorific()
    {
        return honorific;
    }

    public void setHonorific(String honorific)
    {
        this.honorific = honorific;
    }

    public String getOrganization()
    {
        return organization;
    }

    public void setOrganization(String organization)
    {
        this.organization = organization;
    }

    public String getRole_in_study()
    {
        return role_in_study;
    }

    public void setRole_in_study(String role_in_study)
    {
        this.role_in_study = role_in_study;
    }

    public String getStudy_accession()
    {
        return study_accession;
    }

    public void setStudy_accession(String study_accession)
    {
        this.study_accession = study_accession;
    }

    public int getWorkspace_id()
    {
        return workspace_id;
    }

    public void setWorkspace_id(int workspace_id)
    {
        this.workspace_id = workspace_id;
    }
}
