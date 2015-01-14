<%
/*
 * Copyright (c) 2013-2015 LabKey Corporation
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
<%@ page import="org.apache.commons.lang3.StringUtils" %>
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.data.ContainerFilter" %>
<%@ page import="org.labkey.api.data.ContainerFilterable" %>
<%@ page import="org.labkey.api.data.ContainerManager" %>
<%@ page import="org.labkey.api.data.TableInfo" %>
<%@ page import="org.labkey.api.data.TableSelector" %>
<%@ page import="org.labkey.api.query.DefaultSchema" %>
<%@ page import="org.labkey.api.query.QuerySchema" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.JspView" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.immport.ImmPortController" %>
<%@ page import="org.labkey.immport.data.StudyPersonnelBean" %>
<%@ page import="org.labkey.immport.data.StudyPubmedBean" %>
<%@ page import="java.util.Collection" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.Map" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspView<ImmPortController.StudyDetails> me = (JspView) HttpView.currentView();
    ViewContext context = HttpView.currentContext();
    Container c = context.getContainer();
    ImmPortController.StudyDetails details = me.getModelBean();
    String descriptionHTML;
    if (!StringUtils.isEmpty(details.study.getDescription()))
        descriptionHTML= details.study.getDescription();
    else
        descriptionHTML = h(details.study.getBrief_description());

    ActionURL studyUrl = null;
    if (!c.isRoot())
    {
        String comma = "\n";
        Container p = c.getProject();
        ContainerFilter cf = new ContainerFilter.AllInProject(context.getUser());
        QuerySchema s = DefaultSchema.get(context.getUser(), p).getSchema("study");
        TableInfo sp = s.getTable("StudyProperties");
        ((ContainerFilterable)sp).setContainerFilter(cf);
        Collection<Map<String, Object>> maps = new TableSelector(sp).getMapCollection();
        for (Map<String, Object> map : maps)
        {
            Container studyContainer = ContainerManager.getForId((String) map.get("container"));
            String study_accession = (String)map.get("study_accession");
            String name = (String)map.get("Label");
            if (null == study_accession && name.startsWith("SDY"))
                study_accession = name;
            if (null != studyContainer && StringUtils.equalsIgnoreCase(details.study.getStudy_accession(), study_accession))
            {
                studyUrl = studyContainer.getStartURL(context.getUser());
                break;
            }
        }
    }

    Map<String, String> linkProps = new HashMap<>();
    linkProps.put("target", "_blank");
%>
<style>
    .immport-highlight{ color:#cc541f; font-size:120%; font-variant:small-caps;}

    div.wrapper {
        /*margin-left: auto;*/
        /*margin-right: auto;*/
        margin-top: -10px;
        width : 974px;
    }

    div.wrapper .x4-panel-body {
        background-color: transparent;
    }

    div.main {
        background-color: white;
        padding: 10px 20px 20px 20px;
        margin-top: 10px;
        box-shadow: 0 1px 1px rgba(0,0,0,0.15), -1px 0 0 rgba(0,0,0,0.06), 1px 0 0 rgba(0,0,0,0.06), 0 1px 0 rgba(0,0,0,0.12);
    }

    div.main h2 {
        display: inline-block;
        text-transform: uppercase;
        font-weight: normal;
        background-color: #126495;
        color: white;
        font-size: 13px;
        padding: 9px 20px 7px 20px;
        margin-top: -20px;
        margin-left: -20px;
    }

    div.main h3 {
        text-transform: uppercase;
        font-size: 14px;
        font-weight: normal;
        padding: 10px 0px 10px 50px;
        border-bottom: 1px solid darkgray;
    }

    #demographics-content .detail {
        font-size: 15px;
        padding-left: 30px;
        padding-bottom: 5px;
    }

    #demographics-content .detail div {
        font-size: 15px;
    }

    #demographics-content h3 {
        margin-bottom: 0.5em;
        margin-top: 0.5em;
    }

    #demographics-content div {
        padding: 3px;
    }

    #demographics-content div.label, a.label {
        font-size: 12px;
        color: #a9a9a9;
        vertical-align: text-top;
    }
    div.main-body {
        margin-top: 0.5em;
    }

    #assays-content .detail div {
        font-size: 15px;
        padding: 3px;
    }

    .thumb.x-panel-header {
        background-color: transparent;
    }

</style>




<div id="demographics" class="main">
<h2 class="study-accession"><% if (null!=studyUrl) {%><a style="color:#fff" href="<%=h(studyUrl)%>"><%}%><%=h(details.study.getStudy_accession())%><% if (null!=studyUrl) {%></a><%}%></h2>
<div id="demographics-content">
<h3 class="study-title"><%=h(details.study.getOfficial_title())%></h3>
    <div><%
        if (null != details.personnel)
        {
            for (StudyPersonnelBean p : details.personnel)
            {
                if ("Principal Investigator".equals(p.getRole_in_study()))
                {
                    %><div>
                        <span class="immport-highlight study-pi"><%=h(p.getHonorific())%> <%=h(p.getFirst_name())%> <%=h(p.getLast_name())%></span>
                        <span class="immport-highlight study-organization" style="float: right"><%=h(p.getOrganization())%></span>
                    </div><%
                }
            }
        }
        %><div class="study-description"><%=text(descriptionHTML)%></div>
        <div class="study-papers"><%
        if (null != details.pubmed && details.pubmed.size() > 0)
        {
            %><span class="immport-highlight">Papers</span><%
            for (StudyPubmedBean pub : details.pubmed)
            {
                %><p><span style="font-size:80%;"><span class="pub-journal" style="text-decoration:underline;"><%=h(pub.getJournal())%></span> <span class="pub-year"><%=h(pub.getYear())%></span></span><br/><%
                %><span class="pub-title"><%=h(pub.getTitle())%></span><%
                    if (!StringUtils.isEmpty(pub.getPubmed_id()))
                    {
                        %><br/><%=textLink("PubMed","http://www.ncbi.nlm.nih.gov/pubmed/?term=" + pub.getPubmed_id(), null, null, linkProps)%><%
                    }
                %></p><%
            }
        }
        %></div>
    </div>

    <%=textLink("ImmPort","https://immport.niaid.nih.gov/immportWeb/clinical/study/displayStudyDetails.do?itemList=" + details.study.getStudy_accession(), null, null, linkProps)%><br>
    <% if (null != studyUrl) { %>
        <%= textLink("View study " + details.study.getStudy_accession(), studyUrl.toString(), null, null, linkProps)%><br>
    <% } %>
</div>
</div>


