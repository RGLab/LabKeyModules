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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.module.MultiPortalFolderType;
import org.labkey.api.security.User;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.FolderTab;
import org.labkey.api.view.ViewContext;

import java.util.Arrays;
import java.util.List;


public class ImmPortFolderType extends MultiPortalFolderType
{
    private static final List<FolderTab> PAGES = Arrays.asList(
            new ImmPortFolderTabs.StudyFinderPage(),
            new ImmPortFolderTabs.AboutPage()
    );

    public ImmPortFolderType(ImmPortModule module)
    {
        super("ImmPort", "Includes tabs for Study Finder and About.", null, null,
                getDefaultModuleSet(module), module);
    }

    @Override
    public String getStartPageLabel(ViewContext ctx)
    {
        return "Study Finder";
    }

    @Override
    public List<FolderTab> getDefaultTabs()
    {
        return PAGES;
    }
}
