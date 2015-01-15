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
<%@ page import="java.util.Map" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.api.data.DbSchema" %>
<%@ page import="org.labkey.api.data.SqlSelector" %>
<%@ page import="org.apache.commons.beanutils.converters.BooleanConverter" %>
<%@ page import="org.apache.commons.beanutils.ConvertUtils" %>
<%@ page import="org.labkey.api.data.JdbcType" %>
<%@ page extends="org.labkey.api.jsp.JspBase"%>
<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%
    List<Map<String,Object>> list = (List<Map<String,Object>>)(List)new SqlSelector(DbSchema.get("immport").getScope(),
            "SELECT study_accession, restricted, brief_title " +
            "FROM immport.study " +
            "ORDER BY CASE WHEN study_accession LIKE 'SDY%' THEN CAST(SUBSTR(study_accession,4) AS INTEGER) ELSE 0 END, study_accession"
    ).getArrayList(Map.class);
%>

<labkey:errors/>
<labkey:form method="POST" onsubmit="Ext.getBody().mask();true;">
<table>
    <tr><td nowrap>restricted</td><td>study</td><td>title</td></tr>
    <%
    for (Map<String,Object> map : list)
    {
        Boolean restricted = (Boolean)JdbcType.BOOLEAN.convert(map.get("restricted"));
    %>
        <tr><td nowrap align="right"><input type="checkbox" name="studies" value="<%=h(map.get("study_accession"))%>" <%=text(restricted ? "checked":"")%>></td><td><%=h(map.get("study_accession"))%>&nbsp;</td><td><%=h(map.get("brief_title"))%></td></tr>
    <%
    }
%></table>
<input type="submit">
</labkey:form>



