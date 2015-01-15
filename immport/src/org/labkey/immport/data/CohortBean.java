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

public class CohortBean
{
    String arm_accession;
    String study_accession;
    String name;
    String population_selection_rule;
    String type;
    Integer sort_order;
    int workspace_id;

    public String getArm_accession()
    {
        return arm_accession;
    }

    public void setArm_accession(String arm_accession)
    {
        this.arm_accession = arm_accession;
    }

    public String getStudy_accession()
    {
        return study_accession;
    }

    public void setStudy_accession(String study_accession)
    {
        this.study_accession = study_accession;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getPopulation_selection_rule()
    {
        return population_selection_rule;
    }

    public void setPopulation_selection_rule(String population_selection_rule)
    {
        this.population_selection_rule = population_selection_rule;
    }

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public Integer getSort_order()
    {
        return sort_order;
    }

    public void setSort_order(Integer sort_order)
    {
        this.sort_order = sort_order;
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
