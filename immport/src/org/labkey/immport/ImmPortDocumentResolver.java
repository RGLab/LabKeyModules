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
package org.labkey.immport;

import org.apache.commons.collections15.IteratorUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.search.SearchService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HttpView;
import org.labkey.api.webdav.SimpleDocumentResource;
import org.labkey.api.webdav.WebdavResource;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Created by matthew on 7/15/14.
 *
 * Resulve resoruces starting with "immport", eg. "immport:study:SDY161"
 */
public class ImmPortDocumentResolver implements SearchService.ResourceResolver
{
    @Override
    public WebdavResource resolve(@NotNull String resourceIdentifier)
    {
        String[] parts = StringUtils.split(resourceIdentifier,":");
        if (parts.length != 2)
            return null;
        String type = parts[0];
        String id = parts[1];
        switch (type)
        {
            case "study_accession":
                return createImmPortStudyResource(resourceIdentifier, id);
        }
        return null;
    }


    HttpView getCustomSearchResult(User user, @NotNull String resourceIdentifier)
    {
        return null;
    }



    public static WebdavResource createImmPortStudyResource(String id, String study_accession)
    {
        Path path = Path.parse("/" + id);
        Map<String, Object> properties = new HashMap<>();

        DbSchema s = DbSchema.get("immport");
        Map study = new SqlSelector(s, "SELECT * FROM immport.study WHERE study_accession = ?", study_accession).getObject(Map.class);
        ArrayList<Map> personnel = new SqlSelector(s, "SELECT organization,site_name,first_name,last_name FROM immport.study_personnel WHERE study_accession = ?", study_accession).getArrayList(Map.class);
        ArrayList<Map> pubmed = new SqlSelector(s, "SELECT * FROM immport.study_pubmed WHERE study_accession = ?", study_accession).getArrayList(Map.class);

        String title = study_accession + ": " + StringUtils.defaultString((String) study.get("brief_title"), (String) study.get("official_title"));
        properties.put(SearchService.PROPERTY.title.toString(), title);
        properties.put(SearchService.PROPERTY.categories.toString(), ImmPortModule.searchCategoryStudy.getName());

        StringBuilder html = new StringBuilder(4000);


        html.append("<HTML><HEAD></HEAD><BODY>\n");
        if (!StringUtils.isEmpty((String) study.get("condition_studied")))
        {
            html.append(PageFlowUtil.filter(study.get("condition_studied"))).append("\n");
        }
        if (!StringUtils.isEmpty((String) study.get("objectives")))
        {
            html.append(study.get("objectives")).append("\n");
        }
        if (!StringUtils.isEmpty((String) study.get("brief_description")))
        {
            html.append(study.get("brief_description")).append("\n");
        }


        for (Object key : study.keySet())
        {
            if ("condition_studied".equals(key) || "objectives".equals(key) || "brief_description".equals(key))
                continue;
            Object v = study.get(key);
            if (!(v instanceof String))
                continue;
            if ("description".equals(key) || "endpoints".equals(key) || "hypothesis".equals(key))
                html.append(v).append(" ");
            else
                html.append(PageFlowUtil.filter(v)).append(" ");
        }
        html.append("</BODY></HTML>");

        Iterator<Map> it = IteratorUtils.chainedIterator(personnel.iterator(),pubmed.iterator());
        while (it.hasNext())
        {
            Map m = it.next();
            for (Object key : m.keySet())
            {
                Object v = m.get(key);
                if (!(v instanceof String))
                    continue;
                html.append(PageFlowUtil.filter(v)).append(" ");
            }
        }
        /// append study number (w/o SDY prefix)
        if (study_accession.startsWith("SDY"))
            html.append(" ").append(study_accession.substring(3)).append(" ");

        Container home =  ImmPortDocumentProvider.getDocumentContainer();
        ActionURL url = new ActionURL(ImmPortController.StudyDetailAction.class, home).addParameter("study", study_accession);
        url.setExtraPath(home.getId());
        return new SimpleDocumentResource
        (
            path,
            id,
            home.getId(),
            "text/html",
            html.toString().getBytes(),
            url,
            properties
        );
    }
}
