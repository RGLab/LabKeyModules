<%
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
%>
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.immport.ImmPortController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    Container c = getContainer();
    ActionURL exportSpecimens = (new ActionURL("query","exportRowsXLSX",c))
            .addParameter("schemaName","immport")
            .addParameter("query.queryName","q_simple_specimens")
            .addParameter("query.showRows","ALL");
    ActionURL importSpecimens = (new ActionURL("study-samples","showUploadSpecimens",c));
%>
<p>
To load new ImmPort (archive)<br>
<%=textLink("Import Archive", new ActionURL(ImmPortController.ImportArchiveAction.class, c))%>
<%=textLink("Populate cube", new ActionURL(ImmPortController.PopulateCubeAction.class, c))%>
<%=textLink("Study Finder", new ActionURL(ImmPortController.StudyFinderAction.class, c))%>
<%=textLink("Public/Restricted Studies", new ActionURL(ImmPortController.RestrictedStudiesAction.class, c))%>
</p>
<p>
To create the ImmPort mega study<br>
<%=textLink("Copy Datasets (ALL)", new ActionURL("dataintegration", "begin", c))%>
</p>
<p>
To create a single study<br>
<%=textLink("Copy Datasets for One Study", new ActionURL("immport", "copyImmPortStudy", c))%>
</p>
<p>
To create a gender subject_groups<br>
<%=textLink("Create gender subject groups", new ActionURL("immport", "createSubjectGroup", c))%>
</p>
<p>
<%=textLink("Download Specimens",exportSpecimens)%>&nbsp;&nbsp;<%=textLink("Upload Specimens",importSpecimens)%>
</p>
