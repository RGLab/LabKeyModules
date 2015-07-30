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
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="org.labkey.immport.ImmPortController" %>
<%@ page import="org.labkey.immport.data.StudyBean" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Collection" %>
<%@ page import="java.util.Collections" %>
<%@ page import="java.util.Comparator" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.TreeMap" %>
<%@ page import="org.labkey.api.query.QueryView" %>
<%@ page import="org.labkey.api.query.QueryForm" %>
<%@ page import="org.labkey.api.action.NullSafeBindException" %>
<%@ page import="org.labkey.api.view.WebPartView" %>
<%@ page import="org.labkey.immport.view.SubjectFinderWebPart" %>
<%@ page extends="org.labkey.api.jsp.JspBase"%>
<%!
    public LinkedHashSet<ClientDependency> getClientDependencies()
    {
        LinkedHashSet<ClientDependency> resources = new LinkedHashSet<>();
        resources.add(ClientDependency.fromPath("Ext4"));
        resources.add(ClientDependency.fromPath("clientapi/ext4"));
        resources.add(ClientDependency.fromPath("query/olap.js"));
        resources.add(ClientDependency.fromPath("angular.lib.xml"));
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
    Collections.sort(studies, new Comparator<StudyBean>(){
        @Override
        public int compare(StudyBean o1, StudyBean o2)
        {
            String a = o1.getStudy_accession();
            String b = o2.getStudy_accession();
            return Integer.parseInt(a.substring(3)) - Integer.parseInt(b.substring(3));
        }
    });

    Map<String,StudyBean> mapOfStudies = new TreeMap<>();
    for (StudyBean sb : studies)
        mapOfStudies.put(sb.getStudy_accession(), sb);
    int uuid = getRequestScopedUID();
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


<div id="studyfinderOuterDIV<%=uuid%>" style="min-height:100px; min-width:400px;">
<div id="studyfinderAppDIV<%=uuid%>" style="height:100%; width:100%;" class="x-hidden innerColor" ng-app="studyfinderApp" ng-controller="studyfinder">

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
          <td valign="top" align="left" width:100% style="width:100% height:100%;">
            <div id="studypanel" style="height:100%; overflow-y:scroll;" ng-class="{'x-hidden':(activeTab!=='Studies')}">
            <div class="searchDiv" style="float:left; padding:10pt;">
                text search
                <input placeholder="Study Search" id="searchTerms" name="q" style="width:240pt; font-size:120%" ng-model="searchTerms" ng-change="onSearchTermsChanged()">
                <span class="searchMessage" ng-class="{searchNotFound:(searchMessage=='no matches')}">&nbsp;{{searchMessage}}&nbsp;</span>
            </div>
            <div class="seachDiv" style="float:right; padding:10pt;>
                <label ng-show="loaded_study_list.length">&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="ImmuneSpace" ng-change="onStudySubsetChanged()">All ImmuneSpace studies</label>
                <label ng-show="recent_study_list.length">&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="Recent" ng-change="onStudySubsetChanged()">Recently added</label>
                <label ng-show="hipc_study_list.length" >&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="HipcFunded" ng-change="onStudySubsetChanged()">HIPC funded</label>
                <label>&nbsp;<input type="radio" name="studySubset" class="studySubset" ng-model="studySubset" value="ImmPort" ng-change="onStudySubsetChanged()">All ImmPort studies</label>
            </div>
            <div ng-if="!anyVisibleStudies()">no studies match criteria</div>
            <div class="x-clear"></div>
            <table><tr>
            <td style="height:180px;"><img border=1 src="<%=getContextPath()%>/_.gif" style="height:180px; width:1px"></td>
                    <div ng-include="'/studycard.html'"ng-repeat="study in studies | filter:countForStudy"></div>
            </tr></table>
          </td>
          <td align=left valign=top style="width:220pt; border:solid 1px red;">
              <span style="color:red;">NYI</span>
            <div class="facet">
                <div class="facet-header"><span class="facet-caption">Create Subject Group</span></div>
                <p style="padding:10pt;"><input type="text"><%=button("Save")%></p>
            </div>
            <div class="facet">
                <div class="facet-header"><span class="facet-caption">Subject Groups</span></div>
                <ul>
                    <li style="position:relative; width:100%;" class="member">
                        <span class="member-name">Influenza 2013</span>3
                        <span class="member-count"><%=textLink("apply","#")%></span>
                    </li>
                    <li style="position:relative; width:100%;" class="member">
                        <span class="member-name">Allergy - Male 2014</span>
                        <span class="member-count"><%=textLink("apply", "#")%></span>
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
                <span ng-if="dim.filters.length > 1 && dim.filterOptions.length>1" class="facet-filter active" ng-click="displayFilterChoice(dim.name,$event,$parent.$parent.$parent.$parent);" style="float:left;"><span class="facet-filterTypeTrigger active">&#x25BC</span>{{dim.filterCaption}}</span>
                <span ng-if="dim.filters.length > 1 && dim.filterOptions.length<2" class="facet-filter" style="float:left;">{{dim.filterCaption}}</span>
                &nbsp;
                <span ng-if="dim.filters.length" class="clearFilter active" style="float:right;" ng-click="selectMember(dim.name,null,$event);">[clear]</span>
            </div>
        </div>
        <ul>
            <li ng-repeat="member in dim.members" id="m_{{dim.name}}_{{member.uniqueName}}" style="position:relative;" title="{{member.count}}" class="member"
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
<%-- TODO {low} make robust enough to have two finder web parts on the same page --%>

<script>
var studyfinderMaskId = 'studyfinderOuterDIV<%=uuid%>';
var studyfinderAppId = 'studyfinderAppDIV<%=uuid%>';

//
// study detail pop-up window
//   (TODO angularify)
//

var detailWindows = {};
var detailShowing = null;
var timerDeferShow = null;
var vp = null;

function showPopup(targetId,dim,member)
{
    hidePopup();

    var target;
    if (targetId)
        target = Ext4.get(targetId);
    if (targetId && !target)
        console.log("element not found: " + targetId);
    var detailWindow = detailWindows[member];
    if (!detailWindow)
    {
        detailWindow = Ext4.create('Ext.window.Window', {
            width: 800,
            height: 600,
            resizable:true,
            layout: 'fit',
            baseCls : 'study-detail',
            bodyCls : 'study-detail',
            autoScroll : true,
            loader: {
                autoLoad:true,
                url: 'immport-studyDetail.view?_frame=none&study=' + member
            }
        });
//        detailWindows[member] = detailWindow;
    }
    var viewScroll = Ext4.getBody().getScroll();
    var viewSize = Ext4.getBody().getViewSize();
    var region = [viewScroll.left,viewScroll.top,viewScroll.left+viewSize.width,viewScroll.top+viewSize.height];
    var proposedXY;
    if (target)
    {
        var targetXY = target.getXY();
        proposedXY = [targetXY[0]+target.getWidth()-100, targetXY[1]];
    }
    else
    {
        proposedXY = [region[0]+viewSize.width/2-400, region[1]+viewSize.height/2-300];
    }
    proposedXY[1] = Math.max(region[1],Math.min(region[3]-400,proposedXY[1]));
    detailWindow.setPosition(proposedXY);
    detailShowing = detailWindow;
    detailShowing.show();
}


function hidePopup()
{
    if (timerDeferShow)
    {
        clearTimeout(timerDeferShow);
        timerDeferShow = null;
    }
    if (detailShowing)
    {
        detailShowing.hide();
        detailShowing.destroy();
        detailShowing = null;
    }
}




//
// angular scope prototype
//

var studyfinderApp = angular.module('studyfinderApp', ['LocalStorageModule']);
studyfinderApp.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix("studyfinder")
});

var contextPath = <%=q(request.getContextPath())%>;
var studyfinderScope = function()
{
    this.filterChoice = {show:false};
};
studyfinderScope.prototype =
{
    cube: null,
    mdx: null,
    searchTerms : '',
    searchMessage : '',
    studySubset : "ImmuneSpace",
    formatNumber : Ext4.util.Format.numberRenderer('0,000'),
    downArrow : contextPath + "/_images/arrow_down.png",
    rightArrow : contextPath + "/_images/arrow_right.png",
    activeTab : "Studies",
    filterChoice : null,

    fnTRUE : function(a) {return true;},
    fnFALSE : function(b) {return false;},

    countForStudy : function(study)
    {
        var uniqueName = study.memberName || study.uniqueName;
        var studyMember = dataspace.dimensions.Study.memberMap[uniqueName];
        return studyMember ? studyMember.count : 0;
    },

    anyVisibleStudies : function()
    {
        var members = dataspace.dimensions.Study.members;
        for (var m=0 ; m<members.length ; m++)
            if (members[m].count)
                return true;
        return false;
    },

    hasFilters : function ()
    {
        for (var d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            if (d == "Study")
                continue;
            var filterMembers = dataspace.dimensions[d].filters;
            if (filterMembers && filterMembers.length > 0)
                return true;
        }
        return false;
    },

    dimensionHasFilter : function(dim)
    {
        return (dim.filters && dim.filters.length) ? true : false;
    },

    displayFilterChoice : function(dimName,$event,$scope)
    {
        var dim = dataspace.dimensions[dimName];
        if (!dim)
            return;
        var xy = Ext4.fly($event.target).getXY();
        $scope.filterChoice =
        {
            show : true,
            dimName : dimName,
            x : xy[0],
            y : xy[1],
            options : dim.filterOptions
        };
        if ($event.stopPropagation)
            $event.stopPropagation();
    },

    setFilterType : function(dimName, type, $scope)
    {
        $scope.filterChoice.show = false;
        var dim = dataspace.dimensions[dimName];
        if (!dim)
            return;
        if (dim.filterType === type)
            return;
        for (var f=0 ; f<dim.filterOptions.length ; f++)
        {
            if (dim.filterOptions[f].type == type)
            {
                dim.filterType = type;
                dim.filterCaption = dim.filterOptions[f].caption;
                this.updateCountsAsync();
                return;
            }
        }
    },

    selectMember : function(dimName, member, $event)
    {
        var shiftClick = $event && ($event.ctrlKey || $event.altKey || $event.metaKey);
        this._selectMember(dimName, member, $event, shiftClick);
    },

    toggleMember : function(dimName, member, $event)
    {
        this._selectMember(dimName, member, $event, true);
    },

    _selectMember : function(dimName, member, $event, shiftClick)
    {
        var dim = dataspace.dimensions[dimName];
        var filterMembers = dim.filters;
        var m;

        if (!member)
        {
            if (0 == filterMembers.length)  // no change
                return;
            this._clearFilter(dimName);
        }
        else if (!shiftClick)
        {
            this._clearFilter(dimName);
            dim.filters = [member];
            member.selected = true;
        }
        else
        {
            var index = -1;
            for (m=0 ; m<filterMembers.length ; m++)
            {
                if (member.uniqueName == filterMembers[m].uniqueName)
                    index = m;
            }
            if (index == -1) // unselected -> selected
            {
                filterMembers.push(member);
                member.selected = true;
            }
            else // selected --> unselected
            {
                filterMembers.splice(index, 1);
                member.selected = false;
            }
        }
        this.updateCountsAsync();
        if ($event.stopPropagation)
            $event.stopPropagation();
    },


    clearAllFilters : function ()
    {
        for (var d in dataspace.dimensions) {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            if (d == "Study")
                continue;
            this._clearFilter(d);
        }
        this.updateCountsAsync();
    },

    _clearFilter : function(dimName)
    {
        var dim = dataspace.dimensions[dimName];
        var filterMembers = dim.filters;
        for (var m=0 ; m<filterMembers.length ; m++)
            filterMembers[m].selected = false;
        dim.filters = [];
    },


    removeFilterMember : function(dim,member)
    {
        if (!dim || 0 == dim.filters.length) //  0 == dataspace.filters[dim.name].length)
            return;
        var filterMembers = dim.filters; // dataspace.filters[dim.name];
        var index = -1;
        for (var i=0 ; i<filterMembers.length ; i++)
        {
            if (member.uniqueName == filterMembers[i].uniqueName)
                index = i;
        }
        if (index == -1)
            return;
        filterMembers[index].selected = false;
        filterMembers.splice(index,1);
        this.updateCountsAsync();
    },


    initCubeMetaData : function()
    {
        for (var name in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(name))
                continue;
            var dim = dataspace.dimensions[name];
            dim.hierarchy = this.cube.hierarchyMap[dim.hierarchyName];
            dim.level = dim.hierarchy.levelMap[dim.levelName];
            // using the cube objects directly makes angularjs debugging hard because of the pointers 'up' to level/hierarchy
            // so I'll copy them instead
            //        dim.members = dim.level.members;
            for (var m = 0; m < dim.level.members.length; m++)
            {
                var src = dim.level.members[m];
                if (src.name == "#notnull")
                    continue;
                var member = {
                    name: src.name,
                    uniqueName: src.uniqueName,
                    selected: false,
                    level:src.level.uniqueName,
                    count: 0,
                    percent: 0,
                    filteredCount: -1,
                    selectedCount: -1
                };
                dim.members.push(member);
                dim.memberMap[member.uniqueName] = member;
            }
        }
    },


    filterByStudy : true,


    updateCountsAsync : function()
    {
        var innerFilters = [];
        var d, i, dim;
        for (d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            dim = dataspace.dimensions[d];
            var filterMembers = dim.filters;
            if (d == 'Study')
            {
                if (!filterMembers || filterMembers.length == dim.members.length)
                    continue;
                if (filterMembers.length == 0)
                {
                    // in the case of study filter, this means no matches, rather than no filter!
                    this.updateCountsZero();
                    return;
                }
                var uniqueNames = [];
                for (i = 0; i < filterMembers.length; i++)
                    uniqueNames.push(filterMembers[i].uniqueName);
                if (this.filterByStudy)
                    innerFilters.push({level: "[Study].[Name]", members:uniqueNames});
                else
                    innerFilters.push({level:"[Subject].[Subject]", membersQuery:{level: "[Study].[Name]", members:uniqueNames}});
            }
            else
            {
                if (!filterMembers || filterMembers.length == 0)
                    continue;
                for (i = 0; i < filterMembers.length; i++)
                {
                    var filterMember = filterMembers[i];
                    if (this.filterByStudy)
                        innerFilters.push({level: "[Study].[Name]", membersQuery: {level: filterMember.level, members: [filterMember.uniqueName]}});
                    else
                        innerFilters.push({level: "[Subject].[Subject]", membersQuery: {level: filterMember.level, members: [filterMember.uniqueName]}});
                }
            }
        }

        var filters = [];
        if (innerFilters.length && this.filterByStudy)
        {
            filters = [{level:"[Subject].[Subject]", membersQuery:{operator:"INTERSECT", arguments:innerFilters}}]
        }

        var onRows = {operator:"UNION", arguments:[]};
        for (d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            dim = dataspace.dimensions[d];
            if (dim.name == "Subject")
                onRows.arguments.push({level:dim.hierarchy.levels[0].uniqueName});
            else if (dim.name == "Study" && this.filterByStudy)
                continue;
            else
                onRows.arguments.push({level:dim.level.uniqueName});
        }

        var config =
        {
            "sql" : <%=q("true".equals(request.getParameter("sql"))?"true":"false")%>,
            configId: 'ImmPort:/StudyCube',
            schemaName: 'ImmPort',
            name: 'StudyCube',
            success: function(cellset, mdx, config)
            {
                // use angular timeout() for its implicit $scope.$apply()
//                config.scope.timeout(function(){config.scope.updateCounts(config.dim, cellset);},1);
                config.scope.timeout(function()
                {
                    config.scope.updateCountsUnion(cellset);
                },1);
            },
            scope: this,

            // query
            onRows: onRows,
            countFilter: filters,
            countDistinctLevel:'[Subject].[Subject]'
        };
        this.mdx.query(config);


        if (this.filterByStudy)
        {
            var configStudy =
            {
                "sql" : <%=q("true".equals(request.getParameter("sql"))?"true":"false")%>,
                "configId": "ImmPort:/StudyCube",
                "schemaName": "ImmPort",
                "name": "StudyCube",
                success: function(cellset, mdx, config)
                {
                    // use angular timeout() for its implicit $scope.$apply()
//                config.scope.timeout(function(){config.scope.updateCounts(config.dim, cellset);},1);
                    config.scope.timeout(function()
                    {
                        config.scope.updateCounts(dataspace.dimensions.Study,cellset);
                    },1);
                },
                scope: this,

                "onRows": { "level": "[Study].[Name]" },
                "countFilter": innerFilters,
                countDistinctLevel:'[Study].[Name]'
            };
            this.mdx.query(configStudy);
        }
    },


    updateCountsZero : function()
    {
        for (d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            var dim = dataspace.dimensions[d];
            dim.summaryCount = 0;
            for (var m = 0; m < dim.members.length; m++)
            {
                dim.members[m].count = 0;
                dim.members[m].percent = 0;
            }
            dim.summaryCount = 0;
        }

        this.saveFilterState();
        this.updateContainerFilter();
        this.doneRendering();
    },


    updateCounts : function(dim, cellset)
    {
        var member, m;
        var memberMap = dim.memberMap;
        var positions = cellset.axes[1].positions;
        var max = 0;
        dim.summaryCount = 0;
        for (m=0 ; m<dim.members.length ; m++)
        {
            dim.members[m].count = 0;
        }
        for (var i=0 ; i<positions.length ; i++)
        {
            var uniqueName = positions[i][0].uniqueName;
            var count = cellset.cells[i][0].value || 0;
            member = memberMap[uniqueName];
            member.count = count;
            if (count > max)
                max = count;
            dim.summaryCount += 1;
        }
        for (m=0 ; m<dim.members.length ; m++)
        {
            member = dim.members[m];
            dim.members[m].percent = max==0 ? 0 : (100.0*member.count)/max;
        }

        this.saveFilterState();
        this.updateContainerFilter();
        this.doneRendering();
    },


    updateCountsUnion : function(cellset)
    {
        var dim, member, d, m;
        // map from hierarchyName to dataspace dimension
        var map = {};

        // clear old counts (to be safe)
        for (d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            if (d == "Study" && this.filterByStudy)
                continue;
            dim = dataspace.dimensions[d];
            map[dim.hierarchy.uniqueName] = dim;
            dim.summaryCount = 0;
            dim.allMemberCount = 0;
            for (m=0 ; m<dim.members.length ; m++)
            {
                member = dim.members[m];
                member.count = 0;
                member.percent = 0;
            }
        }

        var positions = cellset.axes[1].positions;
        var max = 0;
        for (var i=0 ; i<positions.length ; i++)
        {
            var resultMember = positions[i][0];
            var hierarchyName = resultMember.level.hierarchy.uniqueName;
            dim = map[hierarchyName];
            var count = cellset.cells[i][0].value;
            member = dim.memberMap[resultMember.uniqueName];
            if (!member)
            {
                // might be an all member
                if (dim.allMemberName == resultMember.uniqueName)
                    dim.allMemberCount = count;
                else (-1 == resultMember.uniqueName.indexOf("#") && "(All)" != resultMember.name)
                    console.log("member not found: " + resultMember.uniqueName);
            }
            else
            {
                member.count = count;
                if (count)
                    dim.summaryCount += 1;
                if (count > max)
                    max = count;
            }
        }
        for (d in dataspace.dimensions)
        {
            dim = dataspace.dimensions[d];
            map[dim.hierarchy.uniqueName] = dim;
            for (m=0 ; m<dim.members.length ; m++)
            {
                member = dim.members[m];
                member.percent = max==0 ? 0 : (100.0*member.count)/max;
            }
        }
        this.doneRendering();
    },

    doneRendering : function()
    {
        if (loadMask)
        {
            Ext4.get(studyfinderAppId).removeCls("x-hidden");
            loadMask.hide();
            loadMask = null;
            LABKEY.help.Tour.autoShow('immport.studyfinder');
        }

        LABKEY.Utils.signalWebDriverTest('studyFinderCountsUpdated');
    },

    clearStudyFilter : function()
    {
        this.setStudyFilter(this.getStudySubsetList());
    },


    getStudySubsetList : function()
    {
        if (this.studySubset == "ImmuneSpace")
            return this.loaded_study_list;
        if (this.studySubset == "Recent")
            return this.recent_study_list;
        if (this.studySubset == "HipcFunded")
            return this.hipc_study_list;
        return Ext4.pluck( this.dimStudy.members, 'uniqueName' );
    },


    setStudyFilter : function(studies)
    {
        var dim = this.dimStudy;
        this._clearFilter(dim.name);
        var filterMembers = dim.filters;

        for (var s=0 ; s<studies.length ; s++)
        {
            var uniqueName = studies[s];
            var member = dim.memberMap[uniqueName];
            if (!member)
            {
                console.log("study not found: " + uniqueName);
                continue;
            }
            filterMembers.push(member);
        }
        this.updateCountsAsync();
    },


    onStudySubsetChanged: function()
    {
        // if there are search terms, just act as if the search terms have changed
        if (this.searchTerms)
        {
            this.onSearchTermsChanged();
        }
        else
        {
            this.clearStudyFilter();
        }
    },


    doSearchTermsChanged_promise : null,

    doSearchTermsChanged : function()
    {
        if (this.doSearchTermsChanged_promise)
        {
            // UNDONE:cancel doesn't seem to really be supported for $http
            //this.http.cancel(this.doSearchTermsChanged_promise);
        }

        if (!this.searchTerms)
        {
            this.searchMessage = "";
            this.clearStudyFilter();
            return;
        }

        this.searchMessage = "searching...";

        var scope = this;
        var promise = this.http.get(<%=q(new ActionURL("search","json",context.getContainer()).addParameter("category","immport_study").addParameter("scope","Site").getLocalURIString())%> + '&q=' + this.searchTerms);
        this.doSearchTermsChanged_promise = promise;
        promise.success(function(data)
        {
            // NOOP if we're not current (poor man's cancel)
            if (promise != scope.doSearchTermsChanged_promise)
                return;
            scope.doSearchTermsChanged_promise = null;
            var hits = data.hits;
            var searchStudies = [];
            var found = {};
            for (var h=0 ; h<hits.length ; h++)
            {
                var id = hits[h].id;
                var accession = id.substring(id.lastIndexOf(':')+1);
                if (found[accession])
                    continue;
                found[accession] = true;
                searchStudies.push("[Study].[" + accession + "]");
            }
            if (!searchStudies.length)
            {
                scope.clearStudyFilter();
                scope.searchMessage = 'no matches';
            }
            else
            {
                scope.searchMessage = '';
                // intersect with study subset list
                var result = scope.intersect(searchStudies, scope.getStudySubsetList());
                scope.setStudyFilter(result);
            }
        });
    },

    intersect : function(a,b)
    {
        var o = {}, ret=[], i;
        for (i=0 ; i< a.length ; i++)
            o[a[i]] = a[i];
        for (i=0 ; i< b.length ; i++)
            if (o[b[i]])
                ret.push(b[i]);
        return ret;
    },

    onSearchTermsChanged_promise : null,

    onSearchTermsChanged : function()
    {
        if (null != this.onSearchTermsChanged_promise)
            this.timeout.cancel(this.onSearchTermsChanged_promise);
        var scope = this;
        this.onSearchTermsChanged_promise = this.timeout(function(){scope.doSearchTermsChanged();}, 500);
    },

    // save just the filtered uniqueNames for each dimension
    saveFilterState : function ()
    {
        if (!this.localStorageService.isSupported)
            return;

        for (var d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            if (d == "Study" && this.filterByStudy)
                continue;

            var dim = dataspace.dimensions[d];
            var filterMembers = dim.filters;
            if (!filterMembers || filterMembers.length == 0)
            {
                this.localStorageService.remove(dim.name);
            }
            else
            {
                var filteredNames = [];
                for (var i = 0; i < filterMembers.length; i++)
                {
                    filteredNames.push(filterMembers[i].uniqueName);
                }
                this.localStorageService.set(dim.name, filteredNames);
            }
        }
    },

    // load just the filtered uniqueNames for each dimension
    loadFilterState : function ()
    {
        if (!this.localStorageService.isSupported)
            return;

        for (var d in dataspace.dimensions)
        {
            if (!dataspace.dimensions.hasOwnProperty(d))
                continue;
            if (d == "Study" && this.filterByStudy)
                continue;

            var dim = dataspace.dimensions[d];
            var filteredNames = this.localStorageService.get(dim.name);
            if (filteredNames && filteredNames.length)
            {
                for (var i = 0; i < filteredNames.length; i++)
                {
                    var filteredName = filteredNames[i];
                    var member = dim.memberMap[filteredName];
                    if (member)
                    {
                        member.selected = true;
                        dim.filters.push(member);
                    }
                }
            }
        }
    },

    updateContainerFilter : function ()
    {
        // Collect the container ids of the loaded studies
        var dim = dataspace.dimensions.Study;
        var containers = [];
        for (var name in loaded_studies)
        {
            if (!loaded_studies.hasOwnProperty(name))
                continue;
            var study = loaded_studies[name];
            var count = this.countForStudy(study);
            if (count)
                containers.push(study.containerId);
        }

        if (containers.length == 0 || containers.length == this.loaded_study_list.length)
        {
            // Delete the shared container filter if all loaded_studies are selected
            LABKEY.Ajax.request({
                url: LABKEY.ActionURL.buildURL('study-shared', 'sharedStudyContainerFilter.api'),
                method: 'DELETE'
            });
        }
        else
        {
            LABKEY.Ajax.request({
                url: LABKEY.ActionURL.buildURL('study-shared', 'sharedStudyContainerFilter.api'),
                method: 'POST',
                jsonData: { containers: containers }
            });
        }
    },

    showStudyPopup: function(study_accession)
    {
        showPopup(null,'study',study_accession);
    }

};


var debug_scope;

studyfinderApp.controller('studyfinder', function ($scope, $timeout, $http, localStorageService)
{
    debug_scope = $scope;
    Ext4.apply($scope, new studyfinderScope());
    $scope.timeout = $timeout;
    $scope.http = $http;
    $scope.localStorageService = localStorageService;

    localStorageService.bind($scope, 'searchTerms');

    var studies = [];
    var loaded_study_list = [];
    var recent_study_list = [];
    var hipc_study_list = [];
    for (var i = 0; i < studyData.length; i++)
    {
        var name = studyData[i][0];
        var s =
        {
            'memberName': "[Study].[" + name + "]",
            'study_accession': name,
            'id': studyData[i][1], 'title': studyData[i][2], 'pi': studyData[i][3],
            'hipc_funded': false,
            'loaded': false,
            'url': null,
            'containerId': null
        };
        if (loaded_studies[name])
        {
            s.loaded = true;
            s.hipc_funded = loaded_studies[name].hipc_funded;
            s.highlight = loaded_studies[name].highlight;
            s.url = loaded_studies[name].url;
            s.containerId = loaded_studies[name].containerId;
            loaded_study_list.push(s.memberName);
            if (s.highlight)
                recent_study_list.push(s.memberName);
            if (s.hipc_funded)
                hipc_study_list.push(s.memberName);
        }
        studies.push(s);
    }

    $scope.dataspace = dataspace;
    $scope.studies = studies;
    $scope.loaded_study_list = loaded_study_list;
    $scope.recent_study_list = recent_study_list;
    $scope.hipc_study_list = hipc_study_list;
//    $scope.filterMembers = [];

    // shortcuts
    $scope.dimSubject = dataspace.dimensions.Subject;
    $scope.dimStudy = dataspace.dimensions.Study;
    $scope.dimCondition = dataspace.dimensions.Condition;
    $scope.dimSpecies = dataspace.dimensions.Species;
    $scope.dimPrincipal = dataspace.dimensions.Principal;
    $scope.dimGender = dataspace.dimensions.Gender;
    $scope.dimRace = dataspace.dimensions.Race;
    $scope.dimAge = dataspace.dimensions.Age;
    $scope.dimTimepoint = dataspace.dimensions.Timepoint;
    $scope.dimAssay = dataspace.dimensions.Assay;
    $scope.dimType = dataspace.dimensions.Type;
    $scope.dimCategory = dataspace.dimensions.Category;

    $scope.cube = LABKEY.query.olap.CubeManager.getCube({
        configId: 'ImmPort:/StudyCube',
        schemaName: 'ImmPort',
        name: 'StudyCube',
        deferLoad: false
    });
    $scope.cube.onReady(function (m)
    {
        $scope.$apply(function ()
        {
            $scope.mdx = m;
            $scope.initCubeMetaData();
            $scope.loadFilterState();

            // init study list according to studySubset
            if (loaded_study_list.length == 0)
                $scope.studySubset = "ImmPort";
            $scope.onStudySubsetChanged();
            // doShowAllStudiesChanged() has side-effect of calling updateCountsAsync()
            //$scope.updateCountsAsync();
        });
    });

});


<%-- data --%>

var cube = null;
var studyData = null;
// initialize below


<!-- olap interface -->
var MemberCollection=function()
{
};
MemberCollection.prototype =
{
};

var dataspace =
{
    dimensions :
    {
        "Study": {name:'Study', pluralName:'Studies', hierarchyName:'Study', levelName:'Name', allMemberName:'[Study].[(All)]', popup:true, 
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Condition": {name:'Condition', hierarchyName:'Study.Conditions', levelName:'Condition', allMemberName:'[Study.Conditions].[(All)]',
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Assay": {name:'Assay', hierarchyName:'Assay', levelName:'Assay', allMemberName:'[Assay].[(All)]',
            filterType:"AND", filterOptions:[{type:"OR", caption:"data for any of these"}, {type:"AND", caption:"data for all of these"}]},
        "Type": {name:'Type', hierarchyName:'Study.Type', levelName:'Type', allMemberName:'[Study.Type].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Category": {caption:'Research focus', name:'Category', hierarchyName:'Study.Category', levelName:'Category', allMemberName:'[Study.Category].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Timepoint":{caption:'Day of Study', name:'Timepoint', hierarchyName:'Timepoint.Timepoints', levelName:'Timepoint', allMemberName:'[Timepoint.Timepoints].[(All)]',  
            filterType:"AND", filterOptions:[{type:"OR", caption:"has data for any of"}, {type:"AND", caption:"has data for all of"}]},
        "Race": {name:'Race', hierarchyName:'Subject.Race', levelName:'Race', allMemberName:'[Subject.Race].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Age": {name:'Age', hierarchyName:'Subject.Age', levelName:'Age', allMemberName:'[Subject.Age].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Gender": {name:'Gender', hierarchyName:'Subject.Gender', levelName:'Gender', allMemberName:'[Subject.Gender].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Species": {name:'Species', pluralName:'Species', hierarchyName:'Subject.Species', levelName:'Species', allMemberName:'[Subject.Species].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Principal": {name:'Principal', pluralName:'Species', hierarchyName:'Study.Principal', levelName:'Principal', allMemberName:'[Study.Principal].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]},
        "Subject": {name:'Subject', hierarchyName:'Subject', levelName:'Subject', allMemberName:'[Subject].[(All)]',  
            filterType:"OR", filterOptions:[{type:"OR", caption:"is any of"}]}
    }
};
for (var p in dataspace.dimensions)
{
    var dim = dataspace.dimensions[p];
    Ext4.apply(dim,{members:[],memberMap:{},filters:[],summaryCount:0,allMemberCount:0});
    dim.pluralName = dim.pluralName || dim.name + 's';
    dim.filterType = dim.filterType || "OR";
    for (var f=0 ; f<dim.filterOptions.length ; f++)
    {
        if (dim.filterOptions[f].type == dim.filterType)
            dim.filterCaption = dim.filterOptions[f].caption;
    }
}

var loadMask = null;

Ext4.onReady(function(){
    loadMask = new Ext4.LoadMask(Ext4.get(studyfinderMaskId), {msg:"Loading study definitions..."});
    loadMask.show();
});



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


LABKEY.help.Tour.register({
    id: "immport.studyfinder",
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
    LABKEY.help.Tour.show("immport.studyfinder");
    return false;
}


<% if (me.isAutoResize())
{ %>
    // NOTE LABKEY.ext4.Util.resizeToViewport only accepts an ext component
    function resizeToViewport(el, width, height, paddingX, paddingY, offsetX, offsetY)
    {
        el = Ext4.get(el);
        if (!el)
            return;

        if (width < 0 && height < 0)
            return;

        var padding = [];
        if (offsetX == undefined || offsetX == null)
            offsetX = 35;
        if (offsetY == undefined || offsetY == null)
            offsetY = 35;

        if (paddingX !== undefined && paddingX != null)
            padding.push(paddingX);
        else
        {

            var bp = Ext4.get('bodypanel');
            if (bp) {
                var t  = Ext4.query('table.labkey-proj');
                if (t && t.length > 0) {
                    t = Ext4.get(t[0]);
                    padding.push((t.getWidth()-(bp.getWidth())) + offsetX);
                }
                else
                    padding.push(offsetX);
            }
            else
                padding.push(offsetX);
        }
        if (paddingY !== undefined && paddingY != null)
            padding.push(paddingY);
        else
            padding.push(offsetY);

        var xy = el.getXY();
        var size = {
            width  : Math.max(100,width-xy[0]-padding[0]),
            height : Math.max(100,height-xy[1]-padding[1])
        };

        if (width < 0)
            el.setHeight(size.height);
        else if (height < 0)
            el.setWidth(size.width);
        else
            el.setSize(size);
    }

    var _resize = function(w, h)
    {
        var componentOuter = document.getElementById("studyfinderOuterDIV<%=uuid%>");
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
