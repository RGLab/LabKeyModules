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
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="org.labkey.immport.data.StudyBean" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Collection" %>
<%@ page import="java.util.Collections" %>
<%@ page import="java.util.Comparator" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page import="java.util.Map" %>
<%@ page extends="org.labkey.api.jsp.JspBase"%>
<%!
    public LinkedHashSet<ClientDependency> getClientDependencies()
    {
        LinkedHashSet<ClientDependency> resources = new LinkedHashSet<>();
        resources.add(ClientDependency.fromPath("Ext4"));
        return resources;
    }
%>
<%
    ViewContext context = HttpView.currentContext();
    ArrayList<StudyBean> studies = new SqlSelector(DbSchema.get("immport"),"SELECT study.*, pi.pi_names\n" +
            "FROM immport.study LEFT OUTER JOIN\n" +
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
            String a = ((StudyBean)o1).getStudy_accession();
            String b = ((StudyBean)o2).getStudy_accession();
            return Integer.parseInt(a.substring(3)) - Integer.parseInt(b.substring(3));
        }
    });
%>

<script src="<%=h(request.getContextPath())%>/query/olap.js"></script>
<script src="<%=h(request.getContextPath())%>/angular.js"></script>
<link rel="stylesheet" href="<%=h(request.getContextPath())%>/hopscotch/css/hopscotch.css">

<style>
    DIV.wrapAll
    {
    }
    .studycard-highlight
    {
        color:#cc541f; font-variant:small-caps;
    }
    .innerColor
    {
        background-color:#ffffff;
    }
    DIV.member
    {
        cursor:pointer;
        padding:3pt;
        border:1px solid #ffffff;
    }
    DIV.member:hover
    {
        border:1px solid #cc541f;
    }
    DIV.member span.bar
    {
        height:14pt; top:3px;
        background-color:#EBEBE3;
    }
    DIV.selectedMember
    {
        border:1px solid #000000;
        font-style:italic;
    }
    DIV.emptyMember {color:#888888;}
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
        padding:5pt;
        white-space:nowrap;
    }
    TD.small-summary
    {
        padding:5pt;
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
    TR.filterMember IMG.delete
    {
        visibility:hidden;
    }
    TR.filterMember:hover IMG.delete
    {
        visibility:visible;
        cursor:pointer;
    }
    DIV.study-card
    {
        background-color:#EEEEEE;
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
        background-color:rgba(81, 158, 218, 0.8);
        /* background: linear-gradient(to right, rgba(81, 158, 218, 0.8) 0%,rgba(81, 158, 218, 0.3) 50%, rgba(81, 158, 218, 0.8) 100%); */
    }
</style>


<%=textLink("quick help", "#", "start_tutorial()", "showTutorial")%><br>

<div id="studyfinderAppDIV" class="x-hidden" ng-app="studyfinderApp" ng-controller="studyfinder">

<table style="max-width:980px;" bordercolor=red border="0">

    <tr><td align="left" colspan="2">
        <div class="innerColor" style="padding:10px; border:solid 2px #e6e6e6;">
        <div style="float:left;"><input placeholder="Study Search" id="searchTerms" name="q" style="width:200pt;" ng-model="searchTerms" ng-change="onSearchTermsChanged()"><span class="searchMessage" style="padding-left: 10px">{{searchMessage}}</span></div>
        <div style="float:right;"><input type="checkbox" class="showAllImmPort" ng-model="showAllImmPort" ng-change="onShowAllStudiesChanged()">&nbsp;show all ImmPort studies</div>
        <div id="studypanel" style="clear:both; max-width:940px; overflow-x:scroll;">
            <table><tr>
                <td style="height:180px;"><img border=1 src="<%=getContextPath()%>/_.gif" style="height:180px; width:1px"></td>
                <td style="height:180px;" ng-repeat="study in studies | filter:countForStudy">
                    <div ng-include="'/studycard.html'"></div>
                </td>
            </tr></table>
        </div>
        </div>
    </td>
    </tr><tr>
    <td valign="top">
        <div class="innerColor" style="padding:10px; border:solid 2px #e6e6e6;">
        <table class="dimensions"><tr>
            <td valign=top style="min-width:180px;">
                <div ng-include="'/group.html'" ng-repeat="dim in [dimSpecies,dimCondition]"></div>
            </td>
            <td valign=top style="min-width:180px;">
                <div ng-include="'/group.html'" ng-repeat="dim in [dimType,dimAssay]"></div>
            </td>
            <td valign=top style="min-width:180px;">
                <div ng-include="'/group.html'" ng-repeat="dim in [dimTimepoint]"></div>
            </td>
            <td valign=top style="min-width:180px;">
                <div ng-include="'/group.html'" ng-repeat="dim in [dimGender,dimRace]"></div>
            </td>
        </tr>
        </table>
        </div>
    </td>
    <td valign="top" style="width:200px;">
           <table id="summaryArea" ng-cloak>
                <tr><td colspan="2"><h3 style="text-align:center;">summary</h3></td></tr>
                <tr><td align="right" class="big-summary" style="width:60pt;">{{dimStudy.summaryCount}}</td><td class="big-summary">&nbsp;studies</td></tr>
                <tr><td align="right" class="big-summary" style="width:60pt;">{{dimSubject.allMemberCount||0}}</td><td class="big-summary">participants</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimSpecies.summaryCount}}</td><td class="small-summary">&nbsp;species</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimType.summaryCount}}</td><td class="small-summary">&nbsp;types</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimCondition.summaryCount}}</td><td class="small-summary">&nbsp;conditions</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimAssay.summaryCount}}</td><td class="small-summary">&nbsp;assays</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimTimepoint.summaryCount}}</td><td class="small-summary">&nbsp;timepoints</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimGender.summaryCount}}</td><td class="small-summary">&nbsp;genders</td></tr>
                <tr><td align="right" class="small-summary" style="width:60pt;">{{dimRace.summaryCount}}</td><td class="small-summary">&nbsp;races</td></tr>
                <tr><td colspan="2"><h3 style="text-align:center;" id="filterArea">selection</h3></td></tr>
                <tbody ng-repeat="dim in [dimCondition,dimSpecies,dimPrincipal,dimGender,dimRace,dimTimepoint,dimAssay,dimType] | filter:dimensionHasFilter ">
                <tr><td colspan="2"><fieldset style="width:100%;"><legend>{{dim.name}}</legend>
                    <div class="filter-member" ng-repeat="member in dim.filters">
                    <img class="delete" style="vertical-align:bottom;" src="<%=getContextPath()%>/_images/partdelete.png" ng-click="removeFilterMember(dim,member)">{{member.name}}
                    </div>
                </fieldset></td></tr>
                </tbody>
            </table>
    </td>

</tr>
</table>

<div id="mask" style="position:fixed; top:0; left:0; height:0; width:0; z-index:1000; background-color:#dddddd; opacity:0.5; cursor:wait;"></div>
<div id="studyPopup"></div>

<!--
			templates
 -->

<script type="text/ng-template" id="/studycard.html">
    <div class="study-card" ng-class="{hipc:study.hipc_funded, loaded:study.loaded}" style="width:220px; height:160px; overflow-y:hidden">
        <span class="studycard-highlight studycard-accession" style="float:left;">{{study.study_accession}}</span>
        <span class="studycard-highlight studycard-pi" style="float:right;">{{study.pi}}</span>
        <hr style="clear:both;">
        <div>
            <a class="labkey-text-link" style="float:left;" ng-click="showStudyPopup(study.study_accession)" title="click for more details">view summary</a>
            <a class="labkey-text-link" ng-if="study.loaded && study.url" style="float:right;" target="_blank" href="{{study.url}}">go to study</a>
        </div>
        <p class="studycard-description" style="clear:both;">{{study.title}}</p>
    </div>
</script>

<script type="text/ng-template" id="/group.html">
    <fieldset id="group_{{dim.name}}" class="group-fieldset"><h3 style="text-align:center;">{{dim.name}}</h3>
        <div id="m_{{dim.Name}}_ALL" style="position:relative; width:100%;" class="member"
             ng-class="{selectedMember:(dim.selectedMember=='ALL')}"
             ng-click="selectMember(dim.name,null,$event)">
            <span style="position:relative; z-index:2;">ALL</span>
        </div>
        <div ng-repeat="member in dim.members" id="m_{{dim.name}}_{{member.uniqueName}}" style="position:relative; width:100%;" title="{{member.count}}" class="member"
             ng-class="{selectedMember:member.selected, emptyMember:0==member.count}"
             ng-click="selectMember(dim.name,member,$event)">
            <span style="position:relative; z-index:2;" title="{{member.count}}">{{member.name}}</span>
            <span ng-show="member.count" class="bar" style="position:absolute; left:0 ; width:{{member.percent}}%; z-index:1;"></span>
        </div>
    </fieldset>
</script>

</div>



<!-- 
			controller
 -->

<script>


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

var studyfinderApp = angular.module('studyfinderApp', []);

var studyfinderScope = function(){};
studyfinderScope.prototype =
{
    cube: null,
    mdx: null,
    searchTerms : '',
    searchMessage : '',
    showAllImmPort : false,

    fnTRUE : function(a) {return true;},
    fnFALSE : function(b) {return false;},

    countForStudy : function(study)
    {
        var uniqueName = study.memberName;
        var studyMember = dataspace.dimensions.Study.memberMap[uniqueName];
        return studyMember ? studyMember.count : 0;
    },


    dimensionHasFilter : function(dim)
    {
        return (dim.filters && dim.filters.length) ? true : false;
    },


    selectMember : function(dimName, member, $event)
    {
        var dim = dataspace.dimensions[dimName];
        var filterMembers = dim.filters;
        var shiftClick = $event && ($event.ctrlKey || $event.altKey || $event.metaKey);
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
        var d, i;
        for (d in dataspace.dimensions)
        {
            var filterMembers = dataspace.dimensions[d].filters;
            if (!filterMembers || filterMembers.length == 0)
                continue;
            if (d == 'Study')
            {
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
            var dim = dataspace.dimensions[d];
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
    },


    updateCountsUnion : function(cellset)
    {
        var dim, member, d, m;
        // map from hierarchyName to dataspace dimension
        var map = {};

        // clear old counts (to be safe)
        for (d in dataspace.dimensions)
        {
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
                else (-1 == resultMember.uniqueName.indexOf("#"))
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

        if (loadMask)
        {
            Ext4.get("studyfinderAppDIV").removeCls("x-hidden");
            loadMask.hide();
            loadMask = null;
            LABKEY.help.Tour.autoShow('immport.studyfinder');
        }
    },


    clearStudyFilter : function()
    {
        if (this.showAllImmPort)
        {
            this._clearFilter("Study");
            this.updateCountsAsync();
        }
        else
        {
            var list = [];
            for (var p in loaded_studies)
                if (loaded_studies.hasOwnProperty(p))
                    list.push(loaded_studies[p].uniqueName);
            this.setStudyFilter(list);
        }
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


    onShowAllStudiesChanged: function()
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
            var hits = data.hits;
            var studies = [];
            var found = {};
            for (var h=0 ; h<hits.length ; h++)
            {
                var id = hits[h].id;
                var accession = id.substring(id.lastIndexOf(':')+1);
                if (found[accession])
                    continue;
                found[accession] = true;
                if (scope.showAllImmPort || loaded_studies[accession])
                    studies.push("[Study].[" + accession + "]");
            }
            if (!studies.length)
            {
                scope.clearStudyFilter();
                scope.searchMessage = 'no matches';
            }
            else
            {
                scope.searchMessage = '';
                scope.setStudyFilter(studies);
            }
        });
    },

    onSearchTermsChanged_promise : null,

    onSearchTermsChanged : function()
    {
        if (null != this.onSearchTermsChanged_promise)
            this.timeout.cancel(this.onSearchTermsChanged_promise);
        var scope = this;
        this.onSearchTermsChanged_promise = this.timeout(function(){scope.doSearchTermsChanged();}, 500);
    },

    showStudyPopup: function(study_accession)
    {
        showPopup(null,'study',study_accession);
    }

};

var debug_scope;

studyfinderApp.controller('studyfinder', function ($scope, $timeout, $http)
{
    debug_scope = $scope;
    Ext4.apply($scope, new studyfinderScope());
    $scope.timeout = $timeout;
    $scope.http = $http;
	
	var studies = [];
	for (var i=0 ; i<studyData.length ; i++)
	{
        var name = studyData[i][0];
        var s =
        {
            'memberName':"[Study].[" + name + "]",
            'study_accession': name,
            'id':studyData[i][1], 'title':studyData[i][2], 'pi':studyData[i][3],
            'hipc_funded': false,
            'loaded': false,
            'url' : null
        };
        if (loaded_studies[name])
        {
            s.loaded = true;
            s.hipc_funded = loaded_studies[name].hipc_funded;
            s.url = loaded_studies[name].url;
        }
		studies.push(s);
	}

    $scope.dataspace = dataspace;
    $scope.studies = studies;
//    $scope.filterMembers = [];

    // shortcuts
    $scope.dimSubject=dataspace.dimensions.Subject;
    $scope.dimStudy=dataspace.dimensions.Study;
	$scope.dimCondition=dataspace.dimensions.Condition;
	$scope.dimSpecies=dataspace.dimensions.Species;
    $scope.dimPrincipal=dataspace.dimensions.Principal;
	$scope.dimGender=dataspace.dimensions.Gender;
	$scope.dimRace=dataspace.dimensions.Race;
	$scope.dimTimepoint=dataspace.dimensions.Timepoint;
	$scope.dimAssay=dataspace.dimensions.Assay;
    $scope.dimType=dataspace.dimensions.Type;

    $scope.cube = LABKEY.query.olap.CubeManager.getCube({
        configId: 'ImmPort:/StudyCube',
        schemaName: 'ImmPort',
        name: 'StudyCube',
        deferLoad: false
    });
    $scope.cube.onReady(function(m)
    {
        $scope.$apply(function()
        {
            $scope.mdx = m;
            $scope.initCubeMetaData();
            // init study list according to showAllImmPort flag
            $scope.onShowAllStudiesChanged();
            // doShowAllStudiesChanged() has side-effect of calling updateCountsAsync()
            //$scope.updateCountsAsync();
        });
    });
});


function initEmptyDimension(name)
{
    return {name:name, members:[], max:0};
}


var startTime;

function busy()
{
    var mask = $('mask');
    mask.style.width = window.innerWidth;
    mask.style.height = window.innerHeight;
    mask.style.display = 'block';
    document.body.style.cursor='wait';
    if (!startTime)
        startTime = new Date();
}
function ready()
{
    var endTime = new Date();
    //$('showTime').innerHTML = (endTime-startTime) + 'ms';
    startTime = null;

    var mask = $('mask');
    mask.style.width = 0;
    mask.style.height = 0;
    mask.style.display = 'none';
    document.body.style.cursor='auto';
}


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
        "Study": {name:'Study', pluralName:'Studies', hierarchyName:'Study', levelName:'Name', allMemberName:'[Study].[All Studys]', popup:true},
        "Condition": {name:'Condition', hierarchyName:'Study.Conditions', levelName:'Condition', allMemberName:'[Study.Conditions].[All Study.Conditionss]'},
        "Assay": {name:'Assay', hierarchyName:'Assay', levelName:'Assay', allMemberName:'[Assay].[All Assays]'},
        "Type": {name:'Type', hierarchyName:'Study.Type', levelName:'Type', allMemberName:'[Study.Type].[All Study.Types]'},
        "Timepoint":{name:'Timepoint', hierarchyName:'Timepoint.Timepoints', levelName:'Timepoint', allMemberName:'[Timepoint.Timepoints].[All Timepoint.Timepointss]'},
        "Race": {name:'Race', hierarchyName:'Subject.Race', levelName:'Race', allMemberName:'[Subject.Race].[All Subject.Races]'},
        "Gender": {name:'Gender', hierarchyName:'Subject.Gender', levelName:'Gender', allMemberName:'[Subject.Gender].[All Subject.Genders]'},
        "Species": {name:'Species', pluralName:'Species', hierarchyName:'Subject.Species', levelName:'Species', allMemberName:'[Subject.Species].[All Subject.Speciess]'},
        "Principal": {name:'Principal', pluralName:'Species', hierarchyName:'Study.Principal', levelName:'Principal', allMemberName:'[Study.Principal].[All Study.Principals]'},
        "Subject": {name:'Subject', hierarchyName:'Subject', levelName:'Subject', allMemberName:'[Subject].[All Subjects]'}
    }
};
for (var p in dataspace.dimensions)
{
    var dim = dataspace.dimensions[p];
    Ext4.apply(dim,{members:[],memberMap:{},filters:[],summaryCount:0,allMemberCount:0});
    dim.pluralName = dim.pluralName || dim.name + 's';
}

var loadMask = null;

Ext4.onReady(function(){
    loadMask = new Ext4.LoadMask(Ext4.getBody(), {msg:"Loading study definitions..."});
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
    ContainerFilter cf = new ContainerFilter.AllInProject(context.getUser());
    QuerySchema s = DefaultSchema.get(context.getUser(), p).getSchema("study");
    TableInfo sp = s.getTable("StudyProperties");
    ((ContainerFilterable)sp).setContainerFilter(cf);
    Collection<Map<String, Object>> maps = new TableSelector(sp).getMapCollection();
    for (Map<String, Object> map : maps)
    {
        Container studyContainer = ContainerManager.getForId((String)map.get("container"));
        if (null == studyContainer)
            continue;
        ActionURL url = studyContainer.getStartURL(context.getUser());
        String study_accession = (String)map.get("study_accession");
        String name = (String)map.get("Label");
        if (StringUtils.isEmpty(study_accession) && StringUtils.startsWith(name,"SDY"))
            study_accession = name;
        if (null != study_accession)
        {
            %><%=text(comma)%><%=q(study_accession)%>:{ name:<%=q(study_accession)%>, uniqueName:'[Study].[<%=text(study_accession)%>]', <%
                %>'hipc_funded':<%=text(isTrue(map.get("hipc_funded")))%>,<%
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
            content: "Here is a summary of the data in the selected studies.",
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