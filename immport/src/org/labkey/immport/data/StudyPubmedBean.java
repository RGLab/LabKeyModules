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

public class StudyPubmedBean
{
    String study_accession;
    String pubmed_id;
    String authors;
    String issue;
    String journal;
    String pages;
    String title;
    String year;
    int worksspace_id;

    public String getStudy_accession()
    {
        return study_accession;
    }

    public void setStudy_accession(String study_accession)
    {
        this.study_accession = study_accession;
    }

    public String getPubmed_id()
    {
        return pubmed_id;
    }

    public void setPubmed_id(String pubmed_id)
    {
        this.pubmed_id = pubmed_id;
    }

    public String getAuthors()
    {
        return authors;
    }

    public void setAuthors(String authors)
    {
        this.authors = authors;
    }

    public String getIssue()
    {
        return issue;
    }

    public void setIssue(String issue)
    {
        this.issue = issue;
    }

    public String getJournal()
    {
        return journal;
    }

    public void setJournal(String journal)
    {
        this.journal = journal;
    }

    public String getPages()
    {
        return pages;
    }

    public void setPages(String pages)
    {
        this.pages = pages;
    }

    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public String getYear()
    {
        return year;
    }

    public void setYear(String year)
    {
        this.year = year;
    }

    public int getWorksspace_id()
    {
        return worksspace_id;
    }

    public void setWorksspace_id(int worksspace_id)
    {
        this.worksspace_id = worksspace_id;
    }
}
