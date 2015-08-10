<%
    /*
     * Copyright (c) 2014-2015 LabKey Corporation
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
<%@ page import="org.labkey.api.data.DbSchema" %>
<%@ page import="org.labkey.api.data.SqlSelector" %>
<%@ page import="org.labkey.api.data.TableInfo" %>
<%@ page import="org.labkey.api.data.TableSelector" %>
<%@ page import="org.labkey.api.query.DefaultSchema" %>
<%@ page import="org.labkey.api.query.QuerySchema" %>
<%@ page import="org.labkey.api.util.HeartBeat" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.api.view.WebPartView" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="org.labkey.immport.ImmPortController" %>
<%@ page import="org.labkey.immport.data.StudyBean" %>
<%@ page import="org.labkey.immport.view.SubjectFinderWebPart" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Collection" %>
<%@ page import="java.util.Collections" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.TreeMap" %>
<%@ page extends="org.labkey.api.jsp.JspBase"%>
<%!
    public LinkedHashSet<ClientDependency> getClientDependencies()
    {
        LinkedHashSet<ClientDependency> resources = new LinkedHashSet<>();
        resources.add(ClientDependency.fromPath("Ext4"));
        resources.add(ClientDependency.fromPath("clientapi/ext4"));
        resources.add(ClientDependency.fromPath("query/olap.js"));
        resources.add(ClientDependency.fromPath("angular"));
        resources.add(ClientDependency.fromPath("immport/subjectfinder.js"));

        resources.add(ClientDependency.fromPath("clientapi/ext3")); // nested query webpart in ParticipantGroup panel
        resources.add(ClientDependency.fromPath("study/ParticipantGroup.js"));
        return resources;
    }
%>
<%
    SubjectFinderWebPart me = (SubjectFinderWebPart)HttpView.currentView();
    ViewContext context = HttpView.currentContext();
    ArrayList<StudyBean> studies = new SqlSelector(DbSchema.get("immport"),"SELECT study.*, P.title as program_title, pi.pi_names\n" +
            "FROM immport.study " +
            "LEFT OUTER JOIN immport.workspace W ON study.workspace_id = W.workspace_id\n" +
            "LEFT OUTER JOIN immport.contract_grant C ON W.contract_id = C.contract_grant_id\n" +
            "LEFT OUTER JOIN immport.program P on C.program_id = P.program_id\n" +
            "LEFT OUTER JOIN\n" +
            "\t(\n" +
            "\tSELECT study_accession, array_to_string(array_agg(first_name || ' ' || last_name),', ') as pi_names\n" +
            "\tFROM immport.study_personnel\n" +
            "\tWHERE role_in_study ilike '%principal%'\n" +
            "\tGROUP BY study_accession) pi ON study.study_accession = pi.study_accession\n").getArrayList(StudyBean.class);

    String hipcImg = request.getContextPath() + "/immport/hipc.png";
    Collections.sort(studies, (o1, o2) -> {
        String a = o1.getStudy_accession();
        String b = o2.getStudy_accession();
        return Integer.parseInt(a.substring(3)) - Integer.parseInt(b.substring(3));
    });

    Map<String,StudyBean> mapOfStudies = new TreeMap<>();
    for (StudyBean sb : studies)
        mapOfStudies.put(sb.getStudy_accession(), sb);
%>

<style>
    .innerColor
    {
        background-color:#ffffff;
    }
/*
    fieldset
    {
        float : left
    }
    fieldset.group-fieldset
    {
        border : 0;
        float : none
    }
    DIV.summary-item
    {
		 vertical-align:top;
		 text-align:left;
		 min-width:150pt;
    }
    legend 
    {
        border: 1px solid #999;
        padding: 0 5px 2px 5px;
        background-color: #999;
        color: #fff;
        margin-top: 8px;
    }
    TD.big-summary
    {
        font-size : 110%;
        padding:3pt 2pt 3pt 2pt;
        white-space:nowrap;
    }
    TD.small-summary
    {
        padding:2pt;
        white-space:nowrap;
    }
    DIV.filter-summary
    {
        padding:5pt;
        white-space:nowrap;
    }
    TR.filterMember
    {
        background-color:#FFFFFF;
        border:1px solid #000000;
        font-style:italic;
    }
*/
    TR.filterMember IMG.delete
    {
        visibility:hidden;
    }
    TR.filterMember:hover IMG.delete
    {
        visibility:visible;
        cursor:pointer;
    }

    /* study-card */
    .studycard-highlight
    {
        color:black;
        font-variant:small-caps;
    }
    DIV.study-card
    {
        background-color:#F8F8F8;
        border:1pt solid #AAAAAA;
        padding: 5pt;
        margin: 5pt;
        float:left;
    }
    DIV.study-card:hover
    {
        border:1pt solid #cc541f;
    }
    DIV.study-detail
    {
        background-color:#EEEEEE;
        padding: 10pt;
        width:100%;
        height:100%;
    }
    DIV.hipc
    {
        background-image:url('<%=text(hipcImg)%>');
        background-image:url('<%=text(hipcImg)%>');
        background-repeat:no-repeat;
        background-position:center;
    }
    DIV.loaded
    {
        background-color:rgba(81, 158, 218, 0.2);
        /* background: linear-gradient(to right, rgba(81, 158, 218, 0.8) 0%,rgba(81, 158, 218, 0.3) 50%, rgba(81, 158, 218, 0.8) 100%); */
    }
    SPAN.hipc-label
    {
        border-radius: 10px;
        border: solid 1px #AAAAAA;
        //background: #8AC007;
        background: #FFFFFF;
        padding: 6px;
    }

    /* search area */
    DIV.searchDiv
    {
        font-size: 120%;
    }
    SPAN.searchNotFound
    {
        background-color:yellow;
    }

    /* facets */

    DIV.facet
    {
        max-width:200pt;
        border:solid 2pt rgb(220, 220, 220);
    }
    .active
    {
        cursor:pointer;
    }
    .active:hover
    {
        color:#cc541f !important;
    }
    DIV.facet-header
    {
        padding:4pt;
        background-color: rgb(240, 240, 240);
    }
    DIV.facet-header .facet-caption
    {
        font-size: 130%;
        font-weight:400;
    }
    DIV.facet UL
    {
        list-style-type:none;
        padding-left:0;
        padding-right:5pt;
        margin:0;
    }
    DIV.facet LI.member
    {
        clear:both;
        cursor:pointer;
        padding:2pt;
        margin:1px 0px 1px 0px;
        border:1px solid #ffffff;
        height:14pt;
    }
    DIV.facet.collapsed LI.member
    {
        display:none;
    }
    DIV.facet.collapsed LI.member.selectedMember
    {
        display:block;
    }
    DIV.facet LI.member:hover
    {
        border:1px solid #cc541f;
    }
    DIV.facet LI.selectedMember
    {
        color: blue;
    }
    DIV.facet LI.emptyMember
    {
        color:#888888;
    }
    LI.member .member-indicator
    {
        position:relative;
        display:inline-block;
        width:16px;
        z-index:2;
    }
    .member-indicator.selected:after
    {
        content:"\002713"
    }
    .member-indicator.selected:hover:after
    {
        content:"x";
    }
    .member-indicator.not-selected:after
    {
        content:"\0025FB"
    }
    .member-indicator.not-selected:hover:after
    {
        content:"\002713"
    }
    .member-indicator.not-selected.none-selected:after
    {
        content:"\002713"; color:lightgray;
    }
    .member-indicator.not-selected.none-selected:hover:after
    {
        color:#cc541f;
    }
    LI.member .member-name
    {
        display:inline-block;
        position:relative;
        max-width:150pt;
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        z-index:2;
    }
    LI.member .member-count
    {
        position:relative;
        float:right;
        z-index:2;
    }
    LI.member .member-action
    {
        position:relative;
        float:right;
        z-index:2;
    }
    LI.member .bar
    {
        height:14pt;
        background-color:#DEDEDE;
        position:absolute; right:0;
        z-index:0;
    }
    /* filter status display */
    .facet-filterTypeTrigger
    {
        font-size:67%;
    }

    /* filter type popup */
    DIV.filterPopup
    {
        z-index:100; background-color:white; opacity: 1; border:solid 2px black; position:absolute;
    }
    DIV.filterPopup UL
    {
        padding:2pt; margin:0;
    }
    DIV.filterPopup LI
    {
        padding:2pt; margin:2pt; cursor:pointer;
    }
    DIV.filterPopup LI
    {
        padding:2pt; margin:2pt; cursor:pointer;
        border: 1px solid #ffffff;
    }
    DIV.filterPopup LI:hover
    {
        border: 1px solid #cc541f;
    }

</style>


<div id="subjectFinderOuterDIV" style="min-height:100px; min-width:400px;">
<div id="subjectFinderAppDIV" style="height:100%; width:100%;" class="x-hidden innerColor" ng-app="subjectFinderApp" ng-controller="subjectFinder">

    <table bordercolor=red border=0 style="height:100%; width:100%; padding:3pt;">
        <tr>
          <td colspan="3" valign="top" align="left">
            <%=textLink("quick help", "#", "start_tutorial()", "showTutorial")%>
            <%=textLink("Export Study Datasets", ImmPortController.ExportStudyDatasetsAction.class)%><br>
          </td>
        </tr>
        <tr>
          <td valign="top" style="width:220pt; height:100%;">
            <div style="height:100%; overflow-y:auto;">
            <%--<div class="innerColor" style="padding:10px; border:solid 2px #e6e6e6;">--%>
            <div ng-include="'/facet.html'" ng-repeat="dim in [dimSpecies,dimCondition,dimType,dimCategory,dimAssay,dimTimepoint,dimGender,dimRace,dimAge]"></div>
            <%--</div>--%>
            </div>
          </td>
          <td valign="top" align="left" style="width:100% height:100%;">
              <a ng-click="clearAllFilters();"><span ng-show="hasFilters()">[clear all]</span>&nbsp;</a>
            <div id="studypanel" style="height:100%; overflow-y:scroll;" ng-class="{'x-hidden':(activeTab!=='Studies')}">
            <div class="searchDiv" style="float:left; padding:10pt;">
                search
                <input placeholder="Study Search" id="searchTerms" name="q" style="width:240pt; font-size:120%" ng-model="searchTerms" ng-change="onSearchTermsChanged()">
                <span class="searchMessage" ng-class="{searchNotFound:(searchMessage=='no matches')}">&nbsp;{{searchMessage}}&nbsp;</span>
            </div>
            <div class="seachDiv" style="float:right; padding:10pt;">
                <label ng-show="loaded_study_list.length">&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="ImmuneSpace" ng-change="onStudySubsetChanged()">All ImmuneSpace studies</label>
                <label ng-show="recent_study_list.length">&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="Recent" ng-change="onStudySubsetChanged()">Recently added</label>
                <label ng-show="hipc_study_list.length" >&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="HipcFunded" ng-change="onStudySubsetChanged()">HIPC funded</label>
                <label>&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="ImmPort" ng-change="onStudySubsetChanged()">All ImmPort studies</label>
            </div>
            <div class="x-clear"></div>
            <div ng-if="!anyVisibleStudies()">no studies match criteria</div>
            <table><tr>
            <td style="height:180px;"><img border=1 src="<%=getContextPath()%>/_.gif" style="height:180px; width:1px"></td>
                    <div ng-include="'/studycard.html'"ng-repeat="study in studies | filter:countForStudy"></div>
            </tr></table>
            </div>
          </td>
          <td align=left valign=top style="width:220pt;">
              <div class="facet">
                  <div class="facet-header"><span class="facet-caption">Summary</span></div>
                  <ul>
                      <li style="position:relative; width:100%;" class="member">
                          <span class="member-name">Studies</span>
                          <span class="member-count">{{dimStudy.summaryCount}}</span>
                      </li>
                      <li style="position:relative; width:100%;" class="member">
                          <span class="member-name">Subjects</span>
                          <span class="member-count">{{formatNumber(dimSubject.allMemberCount||0)}}</span>
                      </li>
                  </ul>
              </div>

              <div class="facet">
                    <div class="facet-header"><span class="facet-caption">Create Subject Group</span></div>
                    <p style="padding:10pt;">
                        <input type="text" id="subjectGroupName" ng-model="inputGroupName">
                        <a class="labkey-text-link"  ng-click="saveSubjectGroup();" title="Create Subject Group">Save</a>
                    </p>
              </div>


                <div class="facet">
                    <div class="facet-header"><span class="facet-caption">Subject Groups</span></div>
                    <ul>
                        <li ng-repeat="group in groupList" id="group_{{group.id}}" style="position:relative; width:100%" class="member" ng-class="{selectedMember: group.selected}">
                            <span class="active member-indicator" ng-class="{selected:group.selected, 'none-selected':!currentGroupId,  'not-selected':!group.selected}" ng-click="toggleSubjectGroupFilter(group.id)">
                            </span>
                            <span class="member-name">{{group.label}}</span>
                            <span class="member-action">
                                <a class="labkey-text-link" ng-click="applySubjectGroupFilter(group.id);" title="Apply Subject Filter">Apply</a>
                                <a class="labkey-text-link" ng-click="deleteSubjectGroup(group.id);" title="Delete Subject Group">Delete</a>
                            </span>
                        </li>
                    </ul>
                </div>
          </td>
        </tr>
    </table>



<div id="studyPopup"></div>
<div id="filterPopup" class="filterPopup" style="top:{{filterChoice.y}}px; left:{{filterChoice.x}}px;" ng-if="filterChoice.show" ng-mouseleave="filterChoice.show=false;">
    <ul style="list-style: none;">
        <li ng-click="setFilterType(filterChoice.dimName,filterChoice.options[0].type,$parent)">{{filterChoice.options[0].caption}}</li>
        <li ng-click="setFilterType(filterChoice.dimName,filterChoice.options[1].type,$parent)">{{filterChoice.options[1].caption}}</li>
    </ul>
</div>


<!--
			templates
 -->

<script type="text/ng-template" id="/studycard.html">
    <div class="study-card" ng-class="{hipc:study.hipc_funded, loaded:study.loaded}" style="position:relative; width:160pt; height:140pt; overflow-y:hidden">
        <span class="studycard-highlight studycard-accession" style="float:left;">{{study.study_accession}}</span>
        <span class="studycard-highlight studycard-pi" style="float:right;">{{study.pi}}</span>
        <hr style="clear:both;">
        <div>
            <a class="labkey-text-link" style="float:left;" ng-click="showStudyPopup(study.study_accession)" title="click for more details">view summary</a>
            <a class="labkey-text-link" ng-if="study.loaded && study.url" style="float:right;" href="{{study.url}}">go to study</a>
        </div>
        <div class="studycard-description" style="clear:both;">{{study.title}}</div>
        <div ng-if="study.hipc_funded" style="width:100%; position:absolute; bottom:0; left:0; text-align:center;"><span class="hipc-label">HIPC</span></div>
    </div>
</script>


<script type="text/ng-template" id="/facet.html">
    <div id="group_{{dim.name}}" class="facet"
        ng-class="{expanded:dim.expanded, collapsed:!dim.expanded, noneSelected:(0==dim.filters.length)}">
        <div ng-click="dim.expanded=!dim.expanded" class="facet-header">
            <div class="facet-caption active">
                <span>{{dim.caption || dim.name}}</span>
                <span style="float:right; font-size:67%">&nbsp;{{dim.expanded ? '&#x25BC;' : '&#x25BA;'}}</span>
            </div>
            <div ng-if="dim.expanded || dim.filters.length">
                <%--TODO this $parent silliness seems like a good hint that this isn't the angular way to do this.... --%>
                <span ng-if="dim.filters.length > 1 && dim.filterOptions.length>1" class="facet-filter active" ng-click="displayFilterChoice(dim.name,$event,$parent.$parent.$parent.$parent);" style="float:left;"><span class="facet-filterTypeTrigger active">&#x25BC</span>{{dim.filterCaption}}</span>
                <span ng-if="dim.filters.length > 1 && dim.filterOptions.length<2" class="facet-filter" style="float:left;">{{dim.filterCaption}}</span>
                &nbsp;
                <span ng-if="dim.filters.length" class="clearFilter active" style="float:right;" ng-click="selectMember(dim.name,null,$event);">[clear]</span>
            </div>
        </div>
        <ul>
            <li ng-repeat="member in dim.members" id="m_{{dim.name}}_{{member.uniqueName}}" style="position:relative;" class="member"
                 ng-class="{selectedMember:member.selected, emptyMember:(!member.selected && 0==member.count)}"
                 ng-click="selectMember(dim.name,member,$event)">
                <span class="active member-indicator" ng-class="{selected:member.selected, 'none-selected':!dim.filters.length, 'not-selected':!member.selected}" ng-click="toggleMember(dim.name,member,$event)">
                </span>
                <span class="member-name">{{member.name}}</span>
                &nbsp;
                <span class="member-count">{{formatNumber(member.count)}}</span>
                <span class="bar" ng-show="member.count" style="width:{{member.percent}}%;"></span>
            </li>
        </ul>
    </div>
</script>

</div>
</div>


<%--
			controller
 --%>
<%-- N.B. This is not robust enough to have two finder web parts on the same page --%>

<script>
var studyData = [<%
    String comma = "\n  ";
    for (StudyBean study : studies)
    {
        %><%=text(comma)%>[<%=q(study.getStudy_accession())%>,<%=text(study.getStudy_accession().substring(3))%>,<%=q(StringUtils.defaultString(study.getBrief_title(),study.getOfficial_title()))%>,<%=q(study.getPi_names())%>]<%
        comma = ",\n  ";
    }
%>];


var loaded_studies = {
<%
Container c = context.getContainer();
if (!c.isRoot())
{
    comma = "\n";
    Container p = c.getProject();
    QuerySchema s = DefaultSchema.get(context.getUser(), p).getSchema("study");
    TableInfo sp = s.getTable("StudyProperties");
    if (sp.supportsContainerFilter())
    {
        ContainerFilter cf = new ContainerFilter.AllInProject(context.getUser());
        ((ContainerFilterable)sp).setContainerFilter(cf);
    }
    Collection<Map<String, Object>> maps = new TableSelector(sp).getMapCollection();

    long now = HeartBeat.currentTimeMillis();

    for (Map<String, Object> map : maps)
    {
        Container studyContainer = ContainerManager.getForId((String)map.get("container"));
        if (null == studyContainer)
            continue;
        ActionURL url = studyContainer.getStartURL(context.getUser());
        String study_accession = (String)map.get("study_accession");
        String name = (String)map.get("Label");
        Date until = (Date)map.get("highlight_until");
        boolean highlight = null != until && until.getTime() > now;
        if (StringUtils.isEmpty(study_accession) && StringUtils.startsWith(name,"SDY"))
            study_accession = name;
        if (null != study_accession)
        {
            if (StringUtils.endsWithIgnoreCase(study_accession," Study"))
                study_accession = study_accession.substring(0,study_accession.length()-6).trim();
            StudyBean bean = mapOfStudies.get(study_accession);
            if (null == bean)
            {
                continue;
            }
            %><%=text(comma)%><%=q(study_accession)%>:{<%
                %>name:<%=q(study_accession)%>,<%
                %>uniqueName:<%=q("[Study].["+study_accession+"]")%>, <%
                %>hipc_funded:<%=text(isTrue(StringUtils.contains(bean.getProgram_title(),"HIPC")))%>,<%
                %>highlight:<%=text(highlight?"true":"false")%>,<%
                %>containerId:<%=q((String)map.get("container"))%>, url:<%=q(url.getLocalURIString())%>}<%
               comma = ",\n";
           }
       }
   }%>
};


new subjectFinder(studyData, loaded_studies, "subjectFinderAppDIV");


LABKEY.help.Tour.register({
    id: "immport.subjectFinder",
    steps: [
        {
            target: "studypanel",
            title: "Study Panel",
            content: 'This area contains short descriptions of ImmPort studies. ' +
            'The <span style="background-color:#519ec6;">blue</span> studies have been loaded by the ImmuneSpace team and can be viewed in more detail.<p/>Click on any study card for more information.',
            placement: "bottom"
        },
        {
            target: 'group_Condition',
            title: "Study Attributes",
            content: "Select items in this area to find studies of interest.  The gray bars show the number of selected participants.<p/>Try " + (Ext4.isMac ? "Command" : "Ctrl") + "-click to multi-select.",
            placement: "right"
        },
        {
            target: 'searchTerms',
            title: "Quick Search",
            content: "Enter terms of interest to search study descriptions.",
            placement: "right"
        },
        {
            target: 'summaryArea',
            title: "Summary",
            content: "Here is a summary of the data in the selected studies. Studies represents the number of studies that contain some participants that match the criteria. Participants is the number of subjects accross all selected studies (including participants that did not match all attributes).",
            placement: "left"
        },
        {
            target: 'filterArea',
            title: "Filter Area",
            content: "See and manage your active filters.",
            placement: "left"
        }
    ]
});


function start_tutorial()
{
    LABKEY.help.Tour.show("immport.subjectFinder");
    return false;
}


<% if (me.isAutoResize())
{ %>
    var _resize = function(w, h)
    {
        var componentOuter = document.getElementById("subjectFinderOuterDIV");
        if (!componentOuter)
            return;

        //resizeToViewport: function(extContainer, width, height, paddingX, paddingY, offsetX, offsetY)
        var paddingX, paddingY;
        <% if (me.getFrame() == WebPartView.FrameType.PORTAL) {%>
        paddingX = 26;
        paddingY = 95;
        <%}else{%>
        paddingX = 20;
        paddingY = 35;
        <%}%>
        console.log(w, h, paddingX, paddingY);
        resizeToViewport(componentOuter, w, h, paddingX, paddingY);
    };

    Ext4.EventManager.onWindowResize(_resize);
    Ext4.defer(function()
    {
        var size = Ext4.getBody().getBox();
        _resize(size.width, size.height);
    }, 300);
<%
} %>
</script>


<%!
String isTrue(Object o)
{
    if (null == o)
        return "false";
    if (o instanceof Boolean)
        return o == Boolean.TRUE ? "true" : "false";
    if (o instanceof Number)
        return ((Number) o).intValue() == 0 ? "false" : "true";
    return "false";
}
%>
