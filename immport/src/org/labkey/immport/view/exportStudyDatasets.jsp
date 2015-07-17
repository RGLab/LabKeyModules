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
<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="java.util.LinkedHashSet" %>
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
    ViewContext context = HttpView.currentContext();
    Container c = context.getContainer();
%>

<table>
    <tr>
        <td valign="top">
            <div id="datasetsPanel"></div>
        </td>
        <td valign="top">
            <div id="studyFilter"></div>
        </td>
    </tr>
</table>

<script type="text/javascript">

Ext4.onReady(function () {

    var studyFilterWebPart = LABKEY.WebPart({
        partName: 'Shared Study Filter',
        renderTo: 'studyFilter',
        frame: 'none'
    });
    studyFilterWebPart.render();

    var dataStore = Ext4.create('Ext.data.Store', {
        storeId:'dataSets',
        fields:['id', 'name', 'label', 'numRows'],
        data: {'items': []},
        proxy: {
            type: 'memory',
            reader: {
                type: 'json',
                root: 'items'
            }
        }
    });

    function getListOfDatasets()
    {
        LABKEY.Query.selectRows({
            schemaName : 'study',
            queryName : 'Datasets',
            containerPath : '<%=text(c.getPath())%>',
            success : function (details) {
                var rows = details.rows;

                for (var i = 0; i < rows.length; i++)
                {
                    dataStore.add({
                        id: rows[i].DataSetId,
                        name: rows[i].Name,
                        label: rows[i].Label,
                        numRows: -1
                    });

                    getNumOfRows(rows[i].Name, rows[i].DataSetId);
                }
            }, scope : this
        });

        dataStore.add({
            id: -1,
            name: "StudyProperties",
            label: "Studies",
            numRows: -1
        });
        getNumOfRows('StudyProperties', -1);
    }

    function getNumOfRows(queryName, datasetId)
    {
        LABKEY.Query.selectRows({
            schemaName : 'study',
            queryName : queryName,
            includeTotalCount : true,
            showRows : 0,
            success : function(details) {
                var record = dataStore.getById(datasetId);
                record.set('numRows', details.rowCount);

                enableDownloadButton();
            }, scope : this
        });
    }

    // Enable the download button once all requests have returned
    function enableDownloadButton()
    {
        var store = Ext4.data.StoreManager.lookup('dataSets');

        // Check that we've added the datasets to the store before checking the min numRows
        var count = store.getCount();
        if (count <= 1)
            return;

        // Check that all numRows have been returned
        var min = store.min("numRows");
        if (min == -1)
            return;

        console.debug("all data loaded");
        var btn = Ext4.getCmp("downloadBtn");
        btn.setDisabled(false);
    }

    function renderListOfDatasetsTable()
    {
        Ext4.create('Ext.grid.Panel', {
            id: 'datasets',
            title: 'Datasets',
            margin: '0px 20px 0px 20px',
            disabled: true,
            store: Ext4.data.StoreManager.lookup('dataSets'),
            viewConfig: {
                markDirty: false
            },
            columns: [
                { header: 'Dataset Name',  dataIndex: 'label', flex: 1},
                { header: 'Number of Rows', dataIndex: 'numRows', width:150,
                    renderer: function (v) { return v == -1 ? "<span class=loading-indicator></span>" : v; }
                }
            ],
            width: 600,
            loadMask: true,
            renderTo: 'datasetsPanel'
        });

        Ext4.create('Ext.Button', {
            id: 'downloadBtn',
            text: 'Download',
            margin: '5 5 5 20',
            renderTo: Ext4.getBody(),
            disabled: true,
            handler: function() {

                var schemaQueries = {"study" : []};

                var queryNames = dataStore.collect('name');
                for(var i = 0; i < queryNames.length; i++)
                {
                    schemaQueries.study.push({
                        queryName : queryNames[i]
                    });
                }
                LABKEY.Query.exportTables({
                    schemas: schemaQueries
                });
            }
        });

        Ext4.create('Ext.Button', {
            text: 'Back',
            renderTo: Ext4.getBody(),
            handler : function(btn) {window.history.back()}
        });
    }

    renderListOfDatasetsTable();
    getListOfDatasets();

});

</script>
