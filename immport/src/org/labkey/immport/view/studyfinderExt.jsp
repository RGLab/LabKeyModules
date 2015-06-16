<%
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
%>
<%@ page import="org.labkey.immport.data.StudyBean" %>
<%@ page import="org.labkey.api.data.DbSchema" %>
<%@ page import="org.labkey.api.data.TableSelector" %>
<%@ page import="org.apache.commons.lang3.StringUtils" %>
<%@ page import="java.util.Collections" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Comparator" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="java.util.Set" %>
<%@ page extends="org.labkey.api.jsp.JspBase"%>
<%!
    public LinkedHashSet<ClientDependency> getClientDependencies()
    {
        LinkedHashSet<ClientDependency> resources = new LinkedHashSet<>();
        resources.add(ClientDependency.fromFilePath("clientapi/ext4"));
        return resources;
    }
%>
<%
    ArrayList<StudyBean> studies = new ArrayList<>((new TableSelector(DbSchema.get("immport").getTable("study"))).getCollection(StudyBean.class));
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
<style>
    div.wrapAll
    {
    }
    .frameColor
    {
        /*background-color:#fafcf5;*/
    }
    .innerColor
    {
        background-color:#ffffff;
    }
    div.member
    {
        cursor:pointer;
        padding:3pt;
        border:1px solid #ffffff;
    }
    div.member:hover
    {
        border:1px solid #aaaaaa;
    }
    div.member span.bar
    {
        height:14pt; top:3px;background-color:#EBEBE3;
    }
    div.selectedMember {border:1px solid #000000; font-style:italic;}
    div.emptyMember {color:#888888;}
    fieldset {
        float : left
    }
    fieldset.group-fieldset {
        border : 0;
        float : none
    }
    legend {
        display : none
    }
    div.big-summary
    {
        font-size : 110%;
        padding:5pt;
        white-space:nowrap;
    }
    div.small-summary
    {
        padding:5pt;
        white-space:nowrap;
    }
    div.filter-summary
    {
        padding:5pt;
        white-space:nowrap;
    }
    div.filter-summary img.delete
    {
        visibility:hidden;
    }
    div.filter-summary:hover img.delete
    {
        visibility:visible;
        cursor:pointer;
    }
    div.study-card
    {
        background-color:#EEEEEE;
        border:1pt solid #AAAAAA;
        padding: 5pt;
        margin: 5pt;
        float:left;
    }
    div.study-detail
    {
        background-color:#EEEEEE;
        padding: 10pt;
        width:100%;
        height:100%;
    }
    div.hipc
    {
        background-image:url('<%=text(hipcImg)%>');
        background-color:#519ec6;
        background-repeat:no-repeat;
        background-position:center;
    }
    div.study-detail{}
</style>



<div id="wrapAll" class="frameColor" style="width:100%">


<table  class="frameColor" style="max-width:1200px;"><tr>

    <tr><td colspan="3">
    <table class="frameColor" style="width:100%; position:relative;">
        <tr>
            <td><h2><span id="showTitle"/></h2></td>
            <td style="position:absolute;top:15pt;right:-15pt"><%= button("request study").href("#").onClick("onRequestStudyClicked();") %></td>
        </tr>
    </table>
    </td></tr>

    <tr><td align="center" width="100%" colspan="2"><div id="studypanel" style="width:100%; max-width:1200px; overflow-x:scroll;"></div></td></tr>

    <td valign="top" style="; padding:20px;">
        <table class="innerColor" style="border:solid 1px #e6e6e6;"><tr>
            <td valign=top>
                <div id=group_species valign=top align=left style="min-width:150pt;"></div>
                <div id=group_type valign=top align=left style="min-width:150pt;"></div>
            </td>
            <td valign=top>
                <div id=group_condition valign=top align=left style="min-width:200pt;"></div>
            </td>
            <td valign=top>
                <div id=group_assay valign=top align=left style="min-width:150pt;"></div>
            </td>
            <td valign=top>
                <div id=group_timepoint valign=top align=left style="min-width:150pt;"></div>
            </td>
            <td valign=top>
                <div id=group_gender valign=top align=left style="min-width:150pt;"></div>
                <div id=group_race valign=top align=left style="min-width:150pt;"></div>
                <div id=group_age valign=top align=left style="min-width:150pt;"></div>
            </td>
        </tr>
        </table>
    </td>

    <td valign="top">
        <table>
            <tr>
                <td valign=top class="frameColor">
                    <fieldset class="group-fieldset">
                    <h3 style="text-align:center;">summary</h3>
                    <div id=group_summary_study valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_participant valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_species valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_type valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_condition valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_assay valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_timepoint valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_gender valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_race valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_summary_age valign=top align=left style="min-width:150pt;"></div>
                    <div id=group_filter valign=top align=left style="min-width:150pt;"></div>
                    </fieldset>
                </td>
        </table>
    </td>

</tr>
</table>

<div id="mask" style="position:fixed; top:0; left:0; height:0; width:0; z-index:1000; background-color:#dddddd; opacity:0.5; cursor:wait;"></div>
<div id="studyPopup"></div>
<script>

var studyStore;

Ext4.onReady(function(){
var studyData = [<%
    String comma = "\n  ";
    Set<String> set = PageFlowUtil.set("SDY61", "SDY162", "SDY180", "SDY207", "SDY212");
    for (StudyBean study : studies)
    {
        boolean isHipc = set.contains(study.getStudy_accession());
        %><%=text(comma)%>[<%=q(study.getStudy_accession())%>,<%=text(study.getStudy_accession().substring(3))%>,<%=q(StringUtils.defaultString(study.getBrief_title(),study.getOfficial_title()))%>,<%=text(isHipc?"true":"false")%>]<%
        comma = ",\n  ";
    }
%>];


Ext4.define('ImmPortStudy', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'name', type: 'string'},
        {name: 'id', type: 'int'},
        {name: 'title', type: 'string'},
        {name: 'hipc', type: 'boolean'}
    ]
});

studyStore = Ext4.create('Ext.data.ArrayStore', {
    model: 'ImmPortStudy',
    sortInfo: {
        field    : 'int',
        direction: 'ASC'
    },
    data: studyData
});


var studyTemplate = Ext4.create('Ext.XTemplate',
        '<table><tr><td><img height=200; width=1 src="<%=getContextPath()%>/_.gif"></td>',
        '<tpl for=".">',
        '<td onclick="showStudyPopup(\'{name}\')"><div class="study-card <tpl if="hipc==true">hipc</tpl>" style="width:200px; height:160px; overflow-y:hidden">',
        '<strong>{name}</strong> - ',
        '<span>{title}</span>',
        '</div></td>',
        '</tpl>',
        '</tr></table>'
);


var studyDataView = Ext4.create('Ext.view.View',
{
    deferInitialRefresh: false,
    store: studyStore,
    tpl  : studyTemplate,
    id: 'studies',
    itemSelector: 'div.study-card',
    inline: { wrap: false },
    autoScroll  : false,
    renderTo: 'studypanel'
});


function filterStudies(FILTER)
{
    studyStore.suspendEvents();
    studyStore.clearFilter();
    studyStore.resumeEvents();
    studyStore.sort('id', 'ASC');
}


//perform initial filter
filterStudies(null);

});










var startTime;
var $ = function(id) {return document.getElementById(id);};
var htmlEncode = function(value) {return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");};


function studyfinder_onReady()
{
    console.log("Ext4.onReady()");
    busy();
    for (var i=0 ; i<dataspace.dimensions.length ; i++)
    {
        var dim = dataspace.dimensions[i];
        dim.members = {};
        dataspace.filters[dim.name] = null;
        dataspace.dimensionsByName[dim.name] = dim;
    }
    executeSql({
        schemaName: dataspace.schemaName,
        sql:
                "SELECT 'assay' AS Dimension, Assay AS Member, cast(NULL as integer) As sortorder FROM dimAssay UNION\n" +
                        "SELECT 'study' AS Dimension, Study AS Member, cast(substring(study,4,100) as integer) As sortorder FROM dimStudy UNION\n" +
                        "SELECT 'condition' AS Dimension, Condition AS Member, cast(NULL as integer) As sortorder from dimStudyCondition UNION\n" +
                        "SELECT 'type' AS Dimension, Type AS Member, cast(NULL as integer) As sortorder from dimStudy UNION\n" +
                        "SELECT 'timepoint' AS v, Timepoint AS Member, sortorder from dimStudyTimepoint UNION\n" +
                        "SELECT 'race' AS Dimension, Race AS Member, cast(NULL as integer) As sortorder FROM dimDemographic UNION\n" +
                        "SELECT 'age' AS Dimension, Age AS Member, cast(NULL as integer) As sortorder FROM dimDemographic UNION\n" +
                        "SELECT 'gender' AS Dimension, gender AS Member, cast(NULL as integer) As sortorder FROM dimDemographic UNION\n" +
                        "SELECT 'species' AS Dimension, species AS Member, cast(NULL as integer) As sortorder from dimDemographic UNION\n" +
                        "SELECT 'participant' AS Dimension, participantid AS Member, cast(NULL as integer) As sortorder FROM dimDemographic\n" +
                        "ORDER BY Dimension, sortorder, Member"
        ,
        success: populateDimensions
    });
}

Ext4.onReady(studyfinder_onReady);


var dataspace =
{
    schemaName: 'immport',
    ptids:[],
    filters:
    {
        assay:null,
        study:null,
        condition:null,
        type:null,
        timepoint:null,
        race:null,
        age:null,
        gender:null,
        species:null,
        participant:null
    },
    dimensionsReady : false,
    dimensions : [
        {name:'assay', plural:'assays', table:'dimassay', members:{}, fn:function(row){return row.Assay;}},
        {name:'study', plural:'studies', table:'dimstudy', members:{}, fn:function(row){return row.Study;}, popup:true},
        {name:'condition', plural:'conditions', table:'(SELECT ParticipantId, Condition FROM dimStudy JOIN dimStudyCondition ON dimStudy.Study=dimStudyCondition.Study)', members:{}, fn:function(row){return row.Condition;}},
        {name:'type', plural:'types', table:'dimstudy', members:{}, fn:function(row){return row.Condition;}},
        {name:'timepoint', plural:'timepoints', table:'(SELECT ParticipantId, Timepoint FROM dimStudy JOIN dimStudyTimepoint ON dimStudy.Study=dimStudyTimepoint.Study)', members:{}, fn:function(row){return row.Timepoint;}},
        {name:'race', plural:'races', table:'dimdemographic', members:{}, fn:function(row){return row.Race;}},
        {name:'age', plural:'age groups', table:'dimdemographic', members:{}, fn:function(row){return row.Age;}},
        {name:'gender', plural:'genders', table:'dimdemographic', members:{}, fn:function(row){return row.Gender;}},
        {name:'species', plural:'species', table:'dimdemographic', members:{}, fn:function(row){return row.Species;}},
        {name:'participant', plural:'participants',  members:{}}],
    dimensionsByName : {}
};

function onRequestStudyClicked()
{
    showRequestStudyPopup();
}

function populateDimensions(result)
{
    console.log("populateDimensions()");
    var dimensionsByName = dataspace.dimensionsByName;
    var rows = result.rows;
    for (var i=0 ; i< rows.length ; i++)
    {
        var row = rows[i];
        dimensionsByName[row.Dimension].members[row.Member] = -1;
    }
    dataspace.dimensionsReady = true;
    renderAll();
    updateCountsAsync();
}

function selectMember(dimName,memberName)
{
//    busy();

    if (!memberName && !dataspace.filters[dimName])
        return;
    if (memberName == dataspace.filters[dimName])
        return;

    dataspace.filters[dimName] = memberName;
    updateCountsAsync();
    renderFilters();
}


function updateCountsAsync()
{
    console.log("updateCountAsync()");
    var countFilters = 0;
    var sql = "";
    var parts = [];
    for (var p in dataspace.filters)
    {
        if (dataspace.filters[p])
        {
            var tableName = dataspace.dimensionsByName[p].table;
            var memberName = dataspace.filters[p];
            countFilters++;
            var part = "  SELECT DISTINCT participantId, 1 AS _count FROM " + tableName + " X WHERE " + p + "='" + memberName + "'";
            parts.push(part);
        }
    }
    if (countFilters == 0)
    {
        //sql = "SELECT participantId FROM dimParticipant";
        updateParticipantList("*");
        return;
    }
    else if (countFilters == 1)
    {
        sql = parts[0];
    }
    else
    {
        var sql = parts.join("\nINTERSECT\n");
//        var union = parts.join(" UNION ALL\n");
//        sql = "SELECT participantId FROM (\n" + union + "\n) x GROUP BY ParticipantId HAVING Count(*)=" + countFilters;
    }
    executeSql({
        schemaName: dataspace.schemaName,
        sql: sql,
        success: updateParticipantList
    });
}

function updateParticipantList(result)
{
    console.log("updateParticipantList()");
    if (result=="*")
    {
        dataspace.ptids = null;
        dataspace.ptidsIN = "(1=1)";
    }
    else
    {
        var ptids = [];
        var rows = result.rows;
        for (var i=0 ; i<rows.length ; i++)
        {
            var row = rows[i];
            ptids.push(row.participantId);
        }
        dataspace.ptids = ptids;
        if (dataspace.ptids.length==0)
            dataspace.ptidsIN = "(0=1)";
        else
            dataspace.ptidsIN = "participantId IN ('" + ptids.join("','") + "')";
    }

    var dimensions = dataspace.dimensions;
    for (var d=0 ; d<dimensions.length ; d++)
    {
        var dimName = dimensions[d].name;
        var tableName = dimensions[d].table;
        if (!tableName)
            continue;
        executeSql({
            schemaName: dataspace.schemaName,
            sql: 'SELECT ' + dimName + ' as "member", COUNT(participantid) AS "count" FROM ' + tableName + ' X WHERE ' + dataspace.ptidsIN + ' GROUP BY ' + dimName,
            success: updateMemberList.bind(window,dimName)
        });
    }
}


function updateMemberList(dimName, result)
{
    // first zero out existing values
    var members = dataspace.dimensionsByName[dimName].members;
    for (var m in members)
        members[m] = 0;
    var rows = result.rows;
    for (var i=0 ; i<rows.length; i++)
    {
        var row = rows[i];
        members[row.member] = row.count;
    }
    renderDim(dimName);
}


function renderAll()
{
    renderTitle();
    var dimensions = dataspace.dimensions;
    for (var i=0 ; i<dimensions.length ; i++)
        renderDim(dimensions[i]);
    ready();
}


function renderDim(dimName)
{
    var dim = dimName;
    if (typeof dim == "string")
        dim = dataspace.dimensionsByName[dimName];
    if (dim.name == "study")
    {
        renderStudies(dim);
        return;
    }

    var td = $("group_" + dimName);
    if (td)
        renderGroups(dimName, dim, td);
}


function getPlural(dimName, dim, count)
{
    var num = count;
    if (typeof(num) == "string")
        num = parseInt(num);

    return (num == 1) ? dimName : dim.plural;
}


function renderTitle()
{
    var hasFilter = false;
    for (var member in dataspace.filters)
    {
        if (dataspace.filters[member])
        {
            hasFilter = true;
            break;
        }
    }

    $('showTitle').innerHTML = hasFilter ? "New (Unsaved) View / Study" : "All Subjects / Studies";
}


function renderSummary(dimName, dim, count)
{
    var el = $("group_summary_" + dimName);
    var html = [];

//    html.push("<fieldset class='group-fieldset'>");

    if (dimName == "study" || dimName == "participant")
    {
        html.push("<div class=\"big-summary\"><span style=\"float:left; width:60px; text-align:right;\">" + Ext4.util.Format.number(count,"0,000") + "</span><span>&nbsp;" + htmlEncode(getPlural(dimName, dim, count)) + "</span></div>");
    }
    else
        html.push("<div class=\"small-summary\"><span style=\"float:left; min-width:60px; text-align:right;\">" + count + "</span><span>&nbsp;" + htmlEncode(getPlural(dimName, dim, count)) + "</span></div>");

//    html.push("</fieldset>");

    el.innerHTML = html.join("");
}


function renderParticipantsSummary(count)
{
    renderSummary("participant", dataspace.dimensionsByName["participant"], count);
}


function renderFilters()
{
    var el = $("group_filter");
    var html = [];
    var addHeader = true;

    html.push("<fieldset class='group-fieldset'>")

    for (var dimName in dataspace.filters)
    {
        var memberName = dataspace.filters[dimName];
        if (memberName)
        {
            if (addHeader)
            {
                html.push("<h3 style=\"text-align:center;\">filters</h3>");
                addHeader = false;
            }

            html.push("<div class=\"filter-summary\">");
            var on = "selectMember('" + dimName + "',null)";
            html.push("<img class=\"delete\" style=\"vertical-align:bottom;\" src=\"<%=getContextPath()%>/_images/partdelete.png\" onclick=\"" + on + "\">");
            html.push(htmlEncode(dimName) + " = " + htmlEncode(memberName) + "</div>");
        }
    }
    html.push("</fieldset>");

    el.innerHTML = ""
    el.innerHTML = html.join("");
    renderTitle();
}

function getPtidCount()
{
    var max;

    if (dataspace.ptids)
        max = dataspace.ptids.length;
    else
        max = Object.keys(dataspace.dimensionsByName.participant.members).length;

    return max;
}


function renderGroups(v, dim, el)
{
    var html = [];

    var members = dim.members; // group.all();
    var memberName;
    var count, max;
    max = getPtidCount();
    renderParticipantsSummary(max);

    var countNonZero = getMemberCount(members);
    renderSummary(v, dim, countNonZero);

    var selectedMember = dataspace.filters[v];
    html.push("<fieldset class='group-fieldset'><h3 style=\"text-align:center;\">" + htmlEncode(v) + "</h3>");
    html.push(
            '<div id="m_ALL" style="position:relative; width:100%;"' + ' class="member ' + ((!selectedMember)?'selectedMember':'') + '" ' +
                    " onclick=\"selectMember('" +v+ "',null)\">" +
                    '<span style="position:relative; z-index:2;">ALL</span></div>');
    for (memberName in members)
    {
        var selected = memberName == selectedMember;
        count = members[memberName];
        html.push(
                '<div id="m_' + dim.name + '_' + htmlEncode(memberName) + '" style="position:relative; width:100%;" title="' + count + '" class="member ' + (selected?'selectedMember':0==count?'emptyMember':'') + '" ' +
                        " onclick=\"selectMember('" +v+ "','" + htmlEncode(memberName) + "')\" ");
        html.push('><span style="position:relative; z-index:2;" title="' + count + '">' + htmlEncode(memberName) + '</span>');
        if (count > 0)
            html.push('<span class="bar" style="position:absolute; left:0 ; width:' + Math.min(100,Math.max(2,((100.0*count)/max))) +'%; z-index:1;"></span>'); // rgb(220, 216, 216)
        html.push("</div>\n");
    }
    html.push("</fieldset>");
    el.innerHTML = html.join("");

    if (dim.popup)
    {
        for (memberName in members)
        {
            var id = 'm_' + dim.name + '_' + memberName;
            var elMember = Ext4.get(id);
            if (!elMember) continue;
            elMember.hover(showPopup.bind(window,elMember,dim.name,memberName), hidePopup.bind(window,elMember,dim.name,memberName), window);
        }
    }
}


function renderStudies(dim)
{
    var countNonZero = getMemberCount(dim.members);
    renderSummary('study', dim, countNonZero);

    studyStore.clearFilter();
    studyStore.filterBy(function(record){
        var count = dim.members[record.data.name];
        return count && count != 0;
    });
}



var detailWindows = {};
var detailShowing = null;
var timerDeferShow = null;
var vp = null;

function showStudyPopup(member)
{
    showPopup(null,'study',member);
}
function showPopup(targetId,dim,member)
{
    console.log('showPopup()');
    hidePopup();

    var target;
    if (targetId)
        target = Ext4.get(targetId);
    if (targetId && !target)
        console.log("element not found: " + targetId);
    var detailWindow = detailWindows[member];
    if (!detailWindow)
    {
//        var elTip = Ext4.get('study_detail_' + member);
//        if (!elTip)
//            return;
        detailWindow = Ext4.create('Ext4.window.Window', {
//            title: member,
            width: 800,
            height: 600,
            resizable:true,
            layout: 'fit',
            style: {backgroundColor:"#EEEEEE"},
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
    console.log(proposedXY[1] + " " + region[1] + " " + region[3]);
    proposedXY[1] = Math.max(region[1],Math.min(region[3]-400,proposedXY[1]));
    detailWindow.setPosition(proposedXY);
    detailShowing = detailWindow;
    detailShowing.show();
//    timerDeferShow = Ext4.Function.defer(detailWindow.show, 300, detailWindow);
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
        console.log('hidePopup()');
        detailShowing.hide();
        detailShowing.destroy();
        detailShowing = null;
    }
}



function getMemberCount(members)
{
    var count;
    var countNonZero = 0;

    for (var memberName in members)
    {
        count = members[memberName];
        if (count)
            countNonZero++;
    }

    return countNonZero;
}


function showRequestStudyPopup()
{
    var configs = [];

    // summary info
    configs.push({xtype:'label',margin:'10 0 0 20',style:{'font-weight':'bold', 'font-size':'75%'}}); // 0
    configs.push({xtype:'label',margin:'0 0 0 20',style:{'font-weight':'bold', 'font-size':'75%'}}); // 1
    for (var member in dataspace.dimensionsByName)
    {
        var dim = dataspace.dimensionsByName[member];
        var count = getMemberCount(dim.members);
        if (member == 'study') {
            configs[0].text = count + " " + getPlural(member, dim, count);
        }
        else if (member == 'participant') {
            configs[1].text = getPtidCount() + " " + getPlural(member, dim, count);
        }
        else {
            configs.push({
                xtype:'label',
                margin:'0 0 0 20',
                style:{'font-size':'75%'},
                text: count + " " + getPlural(member, dim, count)
            });
        }
    }

    // filter info
    var firstFilter = true;
    for (var member in dataspace.filters)
    {
        var filter = dataspace.filters[member];
        if (filter)
        {
            if (firstFilter)
            {
                configs.push({xtype:'label',text:'filters',margin:'10 0 0 20',style:{'font-weight':'bold', 'font-size':'75%'}});
                firstFilter = false;
            }
            var t = htmlEncode(member) + " = " + htmlEncode(filter);
            configs.push({xtype:'label',text: t, margin:'0 0 0 20',style:{'font-size':'75%'}});
        }
    }

    var requestWindow = Ext4.create('Ext4.window.Window', {
        width: 440,
        height: 300,
        layout: {
            defaultMargins : '2',
            type : 'hbox',
            width : 200,
            align : 'left'
        },
        autoScroll : true,
        items  : [
            {
                xtype : 'fieldcontainer',
                layout : {
                    type : 'vbox',
                    pack : 'start',
                    defaultMargins : '2'
                },
                items : [
                    {
                        xtype:'label',
                        margin:'20 0 20 0',
                        text: 'Request Study',
                        style : {'font-weight' : 'bold'}
                    },{
                        xtype : 'textfield',
                        hideLabel : true,
                        value : 'Name',
                        width : 200
                    },{
                        xtype : 'textfield',
                        hideLabel : 'true',
                        value : 'Email',
                        width : 200
                    },{
                        xtype : 'textfield',
                        hideLabel : true,
                        value : 'Study Name',
                        width : 200
                    },{
                        xtype : 'fieldcontainer',
                        layout : {
                            type : 'hbox',
                            pack : 'start',
                            defaultMargins : '2'
                        },
                        items : [
                            {
                                xtype   : 'button',
                                text    : 'Request Study',
                                margin : '15 0 0 0',
                                handler : function () { detailWindow.close(); }
                            },{
                                xtype   : 'button',
                                text    : 'Cancel',
                                margin : '15 0 0 0',
                                handler : function () { detailWindow.close(); }
                            }]
                    }]
            },{
                xtype : 'fieldcontainer',
                layout : {
                    type : 'vbox',
                    pack : 'start',
                    defaultMargins : '2'
                },
                items : configs
            }
        ]});

    requestWindow.show();
}


function showStudyDetail(studyId)
{
    var details = Ext4.select('DIV.study-detail').elements;
    for (var i=0 ; i<details.length ; i++)
        details[i].style.display='none';
    var el = Ext4.fly("study_detail_" + studyId);
    if (el)
        el.dom.style.display='block';
}


function busy()
{
    var mask = $('mask');
    mask.style.width = window.innerWidth;
    mask.style.height = window.innerHeight;
    mask.style.display = 'block';
    document.body.style.cursor='wait';
    $('wrapAll').style.display='none';
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
    $('wrapAll').style.display='inline';
}


function executeSql(config)
{
    console.log(config.sql);
    LABKEY.Query.executeSql(config);
}

</script>
