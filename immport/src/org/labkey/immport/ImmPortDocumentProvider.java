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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.search.SearchService;
import org.labkey.api.services.ServiceRegistry;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;

/**
 * Created by matthew on 7/15/14.
 *
 * TODO implement/support lastIndexed
 */
public class ImmPortDocumentProvider implements SearchService.DocumentProvider
{
    public static Container getDocumentContainer()
    {
        return ContainerManager.getHomeContainer();
    }

    public static void reindex()
    {
        ImmPortDocumentProvider dp = new ImmPortDocumentProvider();
        SearchService ss = ServiceRegistry.get(SearchService.class);
        dp.enumerateDocuments(ss.defaultTask(), getDocumentContainer(), null);
    }


    @Override
    public void enumerateDocuments(SearchService.IndexTask task, @NotNull Container c, Date since)
    {
        // the immport schema is shared, so we'll index it when the shared container is scaned
        if (!c.isProject())
            return;
        Container home = getDocumentContainer();
        if (!home.getId().equals(c.getId()))
            return;

        DbSchema db = DbSchema.get("immport");
        TableInfo immport_study = db.getTable("study");

        ArrayList<String> ids = new SqlSelector(db, "SELECT study_accession FROM " + immport_study).getArrayList(String.class);
        for (String study : ids)
            task.addResource("immport:study_accession:" + study, SearchService.PRIORITY.bulk);
    }


    @Override
    public void indexDeleted() throws SQLException
    {

    }
}
