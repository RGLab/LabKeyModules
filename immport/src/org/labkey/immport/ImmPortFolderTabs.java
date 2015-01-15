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

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.FolderTab;
import org.labkey.api.view.Portal;
import org.labkey.api.view.ViewContext;

import java.util.ArrayList;
import java.util.List;

public class ImmPortFolderTabs
{
    public static class StudyFinderPage extends FolderTab
    {
        public static final String PAGE_ID = "immmport.StudyFinder";
        public static final String CAPTION = "Study Finder";

        public StudyFinderPage()
        {
            super(PAGE_ID, CAPTION);
        }

        @Override
        public ActionURL getURL(Container container, User user)
        {
            return new ActionURL(ImmPortController.StudyFinderAction.class, container);
        }

        @Override
        public boolean isSelectedPage(ViewContext viewContext)
        {
            ActionURL tabURL = new ActionURL(ImmPortController.StudyFinderAction.class, viewContext.getContainer());
            ActionURL currentURL = viewContext.getActionURL();
            return currentURL.getAction().equalsIgnoreCase(tabURL.getAction()) && currentURL.getController().equalsIgnoreCase(tabURL.getController());
        }
    }

    public static class DashboardPage extends FolderTab.PortalPage
    {
        public static final String PAGE_ID = "immport.Dashboard";
        public static final String CAPTION = "Dashboard";

        public DashboardPage()
        {
            super(PAGE_ID, CAPTION);
        }

        @Override
        public List<Portal.WebPart> createWebParts()
        {
            List<Portal.WebPart> parts = new ArrayList<>();
            return parts;
        }
    }

    public static class AboutPage extends FolderTab.PortalPage
    {
        public static final String PAGE_ID = "immport.About";
        public static final String CAPTION = "About";

        public AboutPage()
        {
            super(PAGE_ID, CAPTION);
        }

        @Override
        public List<Portal.WebPart> createWebParts()
        {
            List<Portal.WebPart> parts = new ArrayList<>();
            return parts;
        }
    }
}
