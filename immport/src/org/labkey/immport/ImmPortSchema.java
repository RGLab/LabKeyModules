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
package org.labkey.immport;


import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveTreeMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.Module;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.immport.security.CanViewRestrictedStudiesPermission;

import java.util.HashSet;
import java.util.Set;

/**
 * User: cnathe
 * Date: 11/13/12
 */
public class ImmPortSchema extends UserSchema
{
    public static final String NAME = "immport";
    public static final String DESCRIPTION = "Contains data from ImmPort";

    public ImmPortSchema(User user, Container container)
    {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME));
    }

    @Override
    public Set<String> getTableNames()
    {
        return new HashSet<>(getDbSchema().getTableNames());
    }

    @Override
    protected TableInfo createTable(String name)
    {
        SchemaTableInfo tinfo = getDbSchema().getTable(name);
        if (null == tinfo)
            return null;

        FilteredTable<ImmPortSchema> wrappedTable;

        // wrap all tables so we can tack on foreign keys
        // use ImmPortFilterTable for tables that have to enforce restricted study secuirty
        String lcase = name.toLowerCase();
        if (!lcase.startsWith("dim") && !lcase.startsWith("summary"))
        {
            wrappedTable = new ImmPortFilteredTable(tinfo, this);
        }
        else
        {
           wrappedTable = new FilteredTable<>(tinfo, this);
        }

        wrappedTable.wrapAllColumns(true);
        addStandardFKs(wrappedTable);
        return wrappedTable;
    }

    public static void register(final ImmPortModule module)
    {
        DefaultSchema.registerProvider(NAME, new DefaultSchema.SchemaProvider(module)
        {
            public QuerySchema createSchema(DefaultSchema schema, Module module)
            {
                return new ImmPortSchema(schema.getUser(), schema.getContainer());
            }
        });
    }


    void addStandardFKs(TableInfo t)
    {
        for (ColumnInfo c : t.getColumns())
        {
            String lkTableName = accessions.get(c.getName());
            if (null==lkTableName)
                continue;
            c.setFk(new QueryForeignKey(getSchemaName(),getContainer(),null,getUser(),lkTableName,c.getName(),c.getName(),true));
            c.setDisplayColumnFactory(ColumnInfo.NOLOOKUP_FACTORY);
        }
    }


    static CaseInsensitiveTreeMap<String> accessions = new CaseInsensitiveTreeMap<>();
    static
    {
        accessions.put("arm_accession","arm_or_cohort");
        accessions.put("biosample_accession","biosample");
        accessions.put("experiment_accession","experiment");
        accessions.put("expsample_accession","expsample");
        accessions.put("protocol_accession","protocol");
        accessions.put("reagent_accession","reagent");
        accessions.put("study_accession","study");
        accessions.put("subject_accession","subject");
        accessions.put("treatment_accession","treatment");
        accessions.put("workspace_id","workspace");
    }


    static class ImmPortFilteredTable extends FilteredTable<ImmPortSchema>
    {
        ImmPortFilteredTable(TableInfo from, ImmPortSchema schema)
        {
            super(from, schema);
        }

        @Override @NotNull
        public SQLFragment getFromSQL(String alias)
        {
            SQLFragment ret = new SQLFragment("(SELECT * FROM ");

            String selectName = _rootTable.getSelectName();
            if (null != selectName)
                ret.append(selectName);
            else
                ret.append(getFromTable().getFromSQL("$"));

            User user = _userSchema.getUser();
            boolean isSiteAdmin = user.isSiteAdmin();
            boolean canViewRestricted = ContainerManager.getRoot().hasPermission(user, CanViewRestrictedStudiesPermission.class);
            if (!isSiteAdmin && !canViewRestricted)
            {
                ColumnInfo study = _rootTable.getColumn("study_accession");
                ColumnInfo biosample = _rootTable.getColumn("biosample_accession");
                ColumnInfo arm = _rootTable.getColumn("arm_accession");

                if (StringUtils.equalsIgnoreCase(_rootTable.getName(), "subject"))
                {
                    ret.append(" WHERE subject_accession in (SELECT subject_accession FROM immport.subject_2_study WHERE study_accession IN (SELECT study_accession FROM immport.study WHERE restricted=false))");
                }
                else if (null != study)
                {
                    // need to add filter
                    if (_rootTable.getName().equalsIgnoreCase("study"))
                        ret.append(" WHERE restricted=false");
                    else
                        ret.append(" WHERE study_accession IN (SELECT study_accession FROM immport.study WHERE restricted=false)");
                }
                else if (null != biosample)
                {
                    ret.append(" WHERE biosample_accession IN (SELECT biosample_accession FROM immport.biosample WHERE study_accession IN (SELECT study_accession FROM immport.study WHERE restricted=false))");
                }
                else if (null != arm)
                {
                    ret.append(" WHERE arm_accession IN (SELECT arm_accession FROM immport.arm_or_cohort WHERE study_accession IN (SELECT study_accession FROM immport.study WHERE restricted=false))");
                }
            }

            ret.append(") ").append(alias);
            return ret;
        }
    }
}
