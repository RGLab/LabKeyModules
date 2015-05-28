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
<%@ page import="org.labkey.immport.data.StudyBean" %>
<%@ page import="java.util.Collection" %>
<%@ page import="org.labkey.api.data.DbSchema" %>
<%@ page import="org.labkey.api.data.TableSelector" %>
<%@ page import="org.labkey.api.view.JspView" %>
<%@ page extends="org.labkey.api.jsp.JspBase"%>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>

<style>
    div.member {padding-left:3pt; padding-right:3pt;} /* background-color:#eeeeee;} */
    div.selectedMember {border:1px solid #dddddd; background-color:#eeeeee; font-style:italic;}
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
    div.big-summary {
        font-size : 150%;
    }

</style>
<span id="showTime"></span><br>
<div id="wrapAll" style="display:none">
<table style="min-width:900pt;position:relative">
    <tr>
        <td><h2><span id="showTitle"/></h2></td>
        <td style="position:absolute;top:15pt;right:-15pt"><%= button("request study").href("#").onClick("onRequestStudyClicked();") %></td>
    </tr>
</table>
<fieldset id="groups">
<table><tr>
    <td valign=top>
        <div id=group_species valign=top align=left style="min-width:150pt;"></div>
        <div id=group_type valign=top align=left style="min-width:150pt;"></div>
        <div id=group_condition valign=top align=left style="min-width:200pt;"></div>
    </td>
    <td id=group_study valign=top align=left style="min-width:150pt;"></td>
    <td valign=top>
        <div id=group_assay valign=top align=left style="min-width:150pt;"></div>
        <div id=group_timepoint valign=top align=left style="min-width:150pt;"></div>
    </td>
    <td valign=top>
    <div id=group_gender valign=top align=left style="min-width:150pt;"></div>
    <div id=group_race valign=top align=left style="min-width:150pt;"></div>
    <div id=group_age valign=top align=left style="min-width:150pt;"></div>
    </td>
</tr>
</table>
</fieldset>
<fieldset id="summary">
<table>
<tr>
    <td valign=top>
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
    </td>
</table>
</fieldset>
</div>
<div id="mask" style="position:fixed; top:0; left:0; height:0; width:0; z-index:1000; background-color:#dddddd; opacity:0.5; cursor:wait;"></div>
<div id="studyPopup"></div>
<script>
var startTime;
var $ = function(id) {return document.getElementById(id);};
var htmlEncode = function(value) {return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");};

Ext4.onReady(function(){
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
                "SELECT 'assay' AS Type, Assay AS Member, cast(NULL as integer) As sortorder FROM dimAssay UNION\n" +
                "SELECT 'study' AS Type, Study AS Member, cast(substring(study,4,100) as integer) As sortorder FROM dimStudy UNION\n" +
                "SELECT 'condition' AS Type, Condition AS Member, cast(NULL as integer) As sortorder from dimStudyCondition UNION\n" +
                "SELECT 'type' AS Type, Type AS Member, cast(NULL as integer) As sortorder from dimStudy UNION\n" +
                "SELECT 'timepoint' AS Type, Timepoint AS Member, sortorder from dimStudyTimepoint UNION\n" +
                "SELECT 'race' AS Type, Race AS Member, cast(NULL as integer) As sortorder FROM dimDemographic UNION\n" +
                "SELECT 'age' AS Type, Age AS Member, cast(NULL as integer) As sortorder FROM dimDemographic UNION\n" +
                "SELECT 'gender' AS Type, gender AS Member, cast(NULL as integer) As sortorder FROM dimDemographic UNION\n" +
                "SELECT 'species' AS Type, species AS Member, cast(NULL as integer) As sortorder from dimDemographic UNION\n" +
                "SELECT 'participant' AS Type, participantid AS Member, cast(NULL as integer) As sortorder FROM dimDemographic\n" +
                        "ORDER BY Type, sortorder, Member"
                ,
        success: populateDimensions
    });
});


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
        dimensionsByName[row.Type].members[row.Member] = -1;
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
    var dim = dataspace.dimensionsByName[dimName];
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

    html.push("<fieldset class='group-fieldset'>");

    if (dimName == "study" || dimName == "participant")
    {
        html.push("<div class='big-summary'>" + count + " " + htmlEncode(getPlural(dimName, dim, count)) + "</div>");
    }
    else
        html.push("<div><b>" + count + " " + htmlEncode(getPlural(dimName, dim, count)) + "</b></div>");

    html.push("</fieldset>");
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

    for (var member in dataspace.filters)
    {
        var filter = dataspace.filters[member];
        if (filter)
        {
            if (addHeader)
            {
                html.push("<fieldset class='group-fieldset'>")
                html.push("<div class='big-summary'>filters</div>");
                html.push("</fieldset>");
                addHeader = false;
            }

            html.push("<fieldset class='group-fieldset'>")
            html.push("<div><b>" + htmlEncode(member) + " = " + htmlEncode(filter) + "</b></div>");
            html.push("</fieldset>");
        }
    }
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
    html.push("<fieldset class='group-fieldset'><h3>" + htmlEncode(v) +"</h3>");
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
            html.push('<span style="position:absolute; left:0 ; top:6px; width:' + Math.min(100,Math.max(2,((100.0*count)/max))) +'%; height:5pt; background-color:orange; z-index:1;"></span>'); // rgb(220, 216, 216)
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


var detailWindows = {};
var detailShowing = null;
var timerDeferShow = null;
var vp = null;

function showPopup(target,dim,member)
{
    console.log('showPopup()');
    hidePopup();
    target = Ext4.get(target);
    if (!target)
        return;
    var detailWindow = detailWindows[member];
    if (!detailWindow)
    {
        var elTip = Ext4.get('tip_' + dim + "_" + member);
        if (!elTip)
            return;
        detailWindow = Ext4.create('Ext4.window.Window', {
            title: member,
            width: 640,
            height: 400,
            layout: 'fit',
            autoScroll : true,
            contentEl: elTip
        });
        detailWindows[member] = detailWindow;
    }
    var targetXY = target.getXY();
    var proposedXY = [targetXY[0]+target.getWidth()-100, targetXY[1]];
    var viewScroll = Ext4.getBody().getScroll();
    var viewSize = Ext4.getBody().getViewSize();
    var region = [viewScroll.left,viewScroll.top,viewScroll.left+viewSize.width,viewScroll.top+viewSize.height];
    console.log(proposedXY[1] + " " + region[1] + " " + region[3]);
    proposedXY[1] = Math.max(region[1],Math.min(region[3]-400,proposedXY[1]));
    detailWindow.setPosition(proposedXY);
    detailShowing = detailWindow;
    timerDeferShow = Ext4.Function.defer(detailWindow.show, 300, detailWindow);
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

    var detailWindow = Ext4.create('Ext4.window.Window', {
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

   detailWindow.show();
}

function hidePopup()
{
    console.log('hidePopup()');
    if (timerDeferShow)
    {
        clearTimeout(timerDeferShow);
        timerDeferShow = null;
    }
    if (detailShowing)
    {
        detailShowing.hide();
        detailShowing = null;
    }
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

<div class="x-hidden">
<%
    Collection<StudyBean> studies = (new TableSelector(DbSchema.get("immport").getTable("study"))).getCollection(StudyBean.class);
    for (StudyBean study : studies)
    {
        %>
        <div id="tip_study_<%=text(study.getStudy_accession())%>"><div style="padding:5pt;"><%
        JspView v = new JspView<>("/org/labkey/immport/view/studydetail.jsp",study,null);
        include(v, out);
        %></div></div>
<%
    }
%>
</div>
