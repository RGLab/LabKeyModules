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

    //Get list of datasets in the project-level shared study

        //find project level shared study

//    if (!c.isRoot())
//    {
//        Container p = c.getProject();
//        QuerySchema s = DefaultSchema.get(context.getUser(), p).getSchema("study");
//        TableInfo sp = s.getTable("StudyProperties");
//        TableInfo datasets = s.getTable("Datasets");
//    }

    //get no. of rows in each dataset.

    //for each dataset, list no. of rows - see spec pg. 3

    //during 'Download' event, "export" each dataset

    //include study.tsv with study.StudyProperties table - filtered to the list of studies include in the export.


%>

<script type="text/javascript">

    Ext4.onReady(getListOfDatasets);

    function getListOfDatasets()
    {
         LABKEY.Query.selectRows({
            schemaName : 'study',
            queryName : 'Datasets',
            containerPath : '<%=text(c.getPath())%>',
            success : function(details){
                console.log("details", details);
                var rows = details.rows;
                this.datasetsInfo = [];
                this.count = 0;
                for (var i = 0; i < rows.length; i++)
                {
                    var numOfRows = [];
                    getNumOfRows(rows[i].Name, rows.length, rows[i].Label, rows[i].DataSetId, rows[i].Name);
                }
            }, scope : this
         });
    }

    function getNumOfRows(queryName, rowsLength, label)
    {
        LABKEY.Query.selectRows({
            schemaName : 'study',
            queryName : queryName,
            includeTotalCount : true,
            showRows : 0,
            success : function(details){
                console.log("numRows related details", details);
                this.count++;
                this.datasetsInfo.push({
                    label: label,
                    numRows : details.rowCount
                });

                if(rowsLength == this.count)
                        renderListOfDatasetsTable(this.datasetsInfo);

            }, scope : this
        });
    }

    function renderListOfDatasetsTable(datasetsInfo)
    {
        Ext4.create('Ext.data.Store', {
            storeId:'dataSets',
            fields:['label', 'numRows'],
            data: {'items': this.datasetsInfo},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        }).sort('label', 'ASC');

        Ext4.create('Ext.grid.Panel', {
            title: 'Datasets',
            margin: '20',
            disabled: true,
            store: Ext4.data.StoreManager.lookup('dataSets'),
            columns: [
                { header: 'Dataset Name',  dataIndex: 'label', flex: 1},
                { header: 'Number of Rows', dataIndex: 'numRows', width:150}

            ],
            width: 600,
            renderTo: Ext4.getBody()
        });

        //        Ext4.create('Ext.') //TODO: add 'Overall Archive Size:'

        Ext4.create('Ext.Button', {
            text: 'Download',
            margin: '5 5 5 20',
            renderTo: Ext4.getBody(),
            handler: function() {
                var schemaQueries = {"study" : []};
                schemaQueries.study.push({
                    queryName : 'StudyProperties'
                });

                for(var i = 0; i < datasetsInfo.length; i++)
                {
                    schemaQueries.study.push({
                        queryName : datasetsInfo[i].label
                    });
                }
                LABKEY.Query.exportTables({
                    schemas: schemaQueries
                })
            }
        });

        Ext4.create('Ext.Button', {
            text: 'Back',
            renderTo: Ext4.getBody(),
            handler : function(btn) {window.history.back()}
        });
    }


</script>