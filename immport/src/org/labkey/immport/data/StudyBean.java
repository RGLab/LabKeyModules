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
package org.labkey.immport.data;

import java.util.Date;

/**
 * User: matthew
 * Date: 10/14/13
 * Time: 10:23 AM
 */
public class StudyBean
{
    String study_accession;
    String brief_title;
    String official_title;
    String type;
    String brief_description;
    String sponsoring_organization;
    Integer target_enrollment;
    String condition_studied;
    String hypothesis;      // HTML
    String objectives;      // HTML
    String endpoints;       // HTML
    String intervention_agent;
    int workspace_id;
    Date actual_completion_date;
    Integer actual_enrollment;
    Date actual_start_date;
    String age_unit;
    Integer dcl_id;
    String description;     // HTML
    String download_page_available;
    Date final_public_release_date;
    String gender_included;
    String maximum_age;
    String minimum_age;
    Date planned_public_release_date;

    // not in study table, but can be joined if desired
    String pi_names;

    public String getStudy_accession()
    {
        return study_accession;
    }

    public void setStudy_accession(String study_accession)
    {
        this.study_accession = study_accession;
    }

    public String getBrief_title()
    {
        return brief_title;
    }

    public void setBrief_title(String brief_title)
    {
        this.brief_title = brief_title;
    }

    public String getOfficial_title()
    {
        return official_title;
    }

    public void setOfficial_title(String official_title)
    {
        this.official_title = official_title;
    }

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public String getBrief_description()
    {
        return brief_description;
    }

    public void setBrief_description(String brief_description)
    {
        this.brief_description = brief_description;
    }

    public String getSponsoring_organization()
    {
        return sponsoring_organization;
    }

    public void setSponsoring_organization(String sponsoring_organization)
    {
        this.sponsoring_organization = sponsoring_organization;
    }

    public Integer getTarget_enrollment()
    {
        return target_enrollment;
    }

    public void setTarget_enrollment(Integer target_enrollment)
    {
        this.target_enrollment = target_enrollment;
    }

    public String getCondition_studied()
    {
        return condition_studied;
    }

    public void setCondition_studied(String condition_studied)
    {
        this.condition_studied = condition_studied;
    }

    public String getHypothesis()
    {
        return hypothesis;
    }

    public void setHypothesis(String hypothesis)
    {
        this.hypothesis = hypothesis;
    }

    public String getObjectives()
    {
        return objectives;
    }

    public void setObjectives(String objectives)
    {
        this.objectives = objectives;
    }

    public String getEndpoints()
    {
        return endpoints;
    }

    public void setEndpoints(String endpoints)
    {
        this.endpoints = endpoints;
    }

    public String getIntervention_agent()
    {
        return intervention_agent;
    }

    public void setIntervention_agent(String intervention_agent)
    {
        this.intervention_agent = intervention_agent;
    }

    public int getWorkspace_id()
    {
        return workspace_id;
    }

    public void setWorkspace_id(int workspace_id)
    {
        this.workspace_id = workspace_id;
    }

    public Date getActual_completion_date()
    {
        return actual_completion_date;
    }

    public void setActual_completion_date(Date actual_completion_date)
    {
        this.actual_completion_date = actual_completion_date;
    }

    public Integer getActual_enrollment()
    {
        return actual_enrollment;
    }

    public void setActual_enrollment(Integer actual_enrollment)
    {
        this.actual_enrollment = actual_enrollment;
    }

    public Date getActual_start_date()
    {
        return actual_start_date;
    }

    public void setActual_start_date(Date actual_start_date)
    {
        this.actual_start_date = actual_start_date;
    }

    public String getAge_unit()
    {
        return age_unit;
    }

    public void setAge_unit(String age_unit)
    {
        this.age_unit = age_unit;
    }

    public Integer getDcl_id()
    {
        return dcl_id;
    }

    public void setDcl_id(Integer dcl_id)
    {
        this.dcl_id = dcl_id;
    }

    public String getDescription()
    {
        return description;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public String getDownload_page_available()
    {
        return download_page_available;
    }

    public void setDownload_page_available(String download_page_available)
    {
        this.download_page_available = download_page_available;
    }

    public Date getFinal_public_release_date()
    {
        return final_public_release_date;
    }

    public void setFinal_public_release_date(Date final_public_release_date)
    {
        this.final_public_release_date = final_public_release_date;
    }

    public String getGender_included()
    {
        return gender_included;
    }

    public void setGender_included(String gender_included)
    {
        this.gender_included = gender_included;
    }

    public String getMaximum_age()
    {
        return maximum_age;
    }

    public void setMaximum_age(String maximum_age)
    {
        this.maximum_age = maximum_age;
    }

    public String getMinimum_age()
    {
        return minimum_age;
    }

    public void setMinimum_age(String minimum_age)
    {
        this.minimum_age = minimum_age;
    }

    public Date getPlanned_public_release_date()
    {
        return planned_public_release_date;
    }

    public void setPlanned_public_release_date(Date planned_public_release_date)
    {
        this.planned_public_release_date = planned_public_release_date;
    }

    public String getPi_names()
    {
        return pi_names;
    }

    public void setPi_names(String pi_names)
    {
        this.pi_names = pi_names;
    }
}
