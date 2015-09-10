/*
 * Copyright (c) 2011-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Study.window.ParticipantGroup', {
    extend : 'Ext.window.Window',

    constructor : function(config){
        Ext4.QuickTips.init();
        this.panelConfig = config;
        this.addEvents('aftersave', 'closewindow');

        Ext4.applyIf(config, {
            dataRegionName : 'demoDataRegion',
            width : config.participantIds.length > 0 ? (window.innerWidth < 950 ? window.innerWidth : 950) : 300,
            height : config.participantIds.length > 0 ? 500 : 150,
            resizable : false
        });

        Ext4.apply(config, {
            title : 'Define ' + Ext4.htmlEncode(config.subject.nounSingular) + ' Group',
            layout : 'fit',
            autoScroll : true,
            modal : true,
            listeners: {
                show: function(win){
                    new Ext4.util.KeyNav(win.getEl(), {
                        "enter" : function(e){
                            win.saveCategory();
                        },
                        scope : this
                    });
                }
            }
        });
        this.callParent([config]);
    },

    initComponent : function() {

        var defaultWidth = this.participantIds.length > 0 ? 880 : 230;

        this.selectionGrid = Ext4.create('Ext.Component', {
            width  :  defaultWidth,
            border : false
        });

        var simplePanel = Ext4.create('Ext.form.FormPanel', {
            id : 'simplePanel',
            name : 'simplePanel',
            bodyStyle : 'padding: 15px 0 0 15px',
            autoScroll : true,
            items : [
                {
                    xtype : 'textfield',
                    name : 'groupLabel',
                    id : 'groupLabel',
                    readOnly : false,
                    emptyText : Ext4.htmlEncode(this.panelConfig.subject.nounSingular) + ' Group Label',
                    fieldLabel: Ext4.htmlEncode(this.panelConfig.subject.nounSingular) + ' Group Label',
                    labelAlign : 'top',
                    width: defaultWidth
                },
                {
                    xtype : 'hiddenfield',
                    name : 'participantIdentifiers',
                    id : 'participantIdentifiers'
                },
                {
                    xtype: 'hiddenfield',
                    name : 'filters',
                    value: JSON.stringify(this.filters)
                },
                {
                    xtype : 'button',
                    text : "Save",
                    margin: '3 3 3 0',
                    hidden : false,
                    handler : this.saveCategory
                },
                {
                    xtype : 'button',
                    text : this.canEdit ? "Cancel" : "Close",
                    margin: 3,
                    handler : function(){this.fireEvent('closewindow');},
                    scope : this,
                    listeners : {
                        afterrender : function(){
                            this.fireEvent("donewithbuttons");
                        },
                        scope : this
                    }
                },
                this.selectionGrid
            ]
        });

        this.on('closewindow', this.close, this);
        this.on('afterSave', this.close, this);
        this.items = [simplePanel];

        if (this.participantIds) {
            simplePanel.queryById('participantIdentifiers').setValue(this.participantIds);
        }
        if (this.groupLabel) {
            simplePanel.queryById('groupLabel').setValue(this.groupLabel);
        }
        simplePanel.on('closewindow', this.close, this);
        this.callParent(arguments);
        if (this.participantIds.length > 0)
            this.displayQueryWebPart('Demographics');
        //This class exists for testing purposes (e.g. ReportTest)
        this.cls = "doneLoadingTestMarker";
    },


    validate : function() {
        var fieldValues = this.down('panel').getValues(),
            label = fieldValues['groupLabel'];

        if(!label){
            Ext4.Msg.alert("Error", this.subject.nounSingular + " Group Label Required");
            return false;
        }

        return true;
    },

    saveCategory : function(){
        if (this.xtype === 'button')
            var me = this.up('panel').up('window');
        else
            var me = this;
        if (!me.validate()) return;

        var groupData = me.getGroupData();

        Ext4.Ajax.request({
            url : (LABKEY.ActionURL.buildURL("participant-group", "saveParticipantGroup.api")),
            method : 'POST',
            success : LABKEY.Utils.getCallbackWrapper(function(data) {
                this.getEl().unmask();
                me.fireEvent('aftersave', data);
                if(me.grid){
                    me.grid.getStore().load();
                }
            }),
            failure : function(response, options){
                this.getEl().unmask();
                LABKEY.Utils.displayAjaxErrorResponse(response, options, false, "An error occurred trying to save:  ");
            },
            jsonData : groupData,
            scope : this
        });
    },

    getGroupData : function() {

        var fieldValues = this.queryById('simplePanel').getValues();
        var ptids = fieldValues['participantIdentifiers'].trim() == "" ? [] : fieldValues['participantIdentifiers'].split(',');

        var groupData = {
            label : fieldValues["groupLabel"],
            participantIds : ptids,
            categoryLabel : '',
            categoryType : 'list'
        };

        if (fieldValues["filters"] != undefined)
            groupData["filters"] = fieldValues["filters"];

        if (this.groupRowId !== null && this.groupRowId != undefined) {
            groupData.rowId = this.groupRowId;
        }
        return groupData;
    },

    displayQueryWebPart : function(queryName) {

        //QueryWebPart is an Ext 3 based component, so we need to include Ext 3 here.
        LABKEY.requiresExt3ClientAPI(function() {

            Ext.onReady(function() {

                var me = this;
                var wp = new LABKEY.QueryWebPart({
                    renderTo: this.selectionGrid.id,
                    autoScroll : true,
                    dataRegionName : this.dataRegionName,
                    schemaName: 'study',
                    queryName: queryName,
                    frame : 'none',
                    border : false,
                    showRecordSelectors : false,
                    showUpdateColumn : false,
                    buttonBar : {
                        position: 'none',
                        includeStandardButtons: false
                    },
                    scope : this
                });

            }, this);

        }, this);
    }

});
