// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 Copyright 2012 Fred Hutchinson Cancer Research Center

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

Ext.namespace('LABKEY.ext');

LABKEY.ext.HAI_vs_GE = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me                                  = this,
            maskReport                          = undefined
            ;


/*
        /////////////////////////////////////
        //             Strings             //
        /////////////////////////////////////

        var strngErrorContactWithLink   = ' Please, contact support, if you have questions.';


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strngSqlStartTable  =   'SELECT' +
                                    ' FCSAnalyses.Name AS FileName,' +
                                    ' FCSAnalyses.RowId AS FileIdLink,' +
                                    ' FCSAnalyses.Run.Name AS RunName,' +
                                    ' FCSAnalyses.Run.RowId AS RunId,' +
                                    ' FCSAnalyses.FCSFile.RowId AS FileIdMeta',
            strngSqlEndTable    =   ' FROM FCSAnalyses' +
                                    ' WHERE' +
                                    ' FCSAnalyses.FCSFile.OriginalFCSFile.Original = TRUE OR' +
                                    ' FCSAnalyses.FCSFile.Original = TRUE';


	*/
        //////////////////////////////////////////////////////////////////
        //             Queries and associated functionality             //
        //////////////////////////////////////////////////////////////////
        LABKEY.Query.getQueries({
            schemaName: 'Samples',
            success: function( queriesInfo ){
                var queries = queriesInfo.queries, count = queries.length, j;
                for ( j = 0; j < count; j ++ ){
                    if ( queries[j].name == 'Samples' ){
                        j = count;
                    }
                }

                if ( j == count + 1 ){
                    LABKEY.Query.getQueryDetails({
                        failure: LABKEY.ext.HAI_vs_GE_Lib.onFailure,
                        queryName: 'Samples',
                        schemaName: 'Samples',
                        success: function(queryInfo){
                            var i = 13, toAdd, len = queryInfo.columns.length; // the first 13 columns are system and are of no interest
                        }
                    });

                }
            },
            failure: LABKEY.ext.HAI_vs_GE_Lib.onFailure
        });

        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

	/*
        var strCohort = new LABKEY.ext.Store({
            queryName: 'study_cohorts_info',
            schemaName: 'study'
        });

        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////


        var cbCohort = new Ext.form.ComboBox({
            displayField: 'cohort',
	    //emptyText: 'Click...',
            fieldLabel: 'Select a cohort',
            store: strCohort,
            valueField: 'cohort'
        });

        var cbTimepoint = new Ext.form.ComboBox({
            displayField: 'timepoint',
	    //emptyText: 'Click...',
            fieldLabel: 'Select a timepoint',
            store: strCohort,
            valueField: 'timepoint'
        });
	*/
        var tfAlpha = new Ext.form.TriggerField({
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Enter \'alpha\' value',
            listeners: {
                keyup: {
                    buffer: 150,
                    fn: function(field, e) {
                        if( Ext.EventObject.ESC == e.getKey() ){
                            field.onTriggerClick();
                        }
                        else {
                            if ( Ext.util.Format.trim( this.getValue() ) != '' ){
                                btnRun.setDisabled( false );
                            } else {
                                btnRun.setDisabled( true );
                            }

                            var val = field.getRawValue();
                        }
                    }
                }
            },
            onTriggerClick: function(){
                this.reset();
            },
            triggerClass: 'x-form-clear-trigger'
        });


        /////////////////////////////////////
        //             Buttons             //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
	    cnfReport.inputParams = {
			alpha: tfAlpha.getValue()
		};
		/*cnfReport.inputParams = {*/
		/*GEA_acc: cbCohort.getValue()*/
		    /*};*/

                maskReport.show();
                btnRun.setDisabled( true );

                LABKEY.Report.execute( cnfReport );
            },
            text: 'Run'
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                maskReport.hide();
                btnRun.setDisabled( false );

                LABKEY.ext.HAI_vs_GE_Lib.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:HAI_vs_GE/study/study_cohorts_info/HAI_vs_GE.Rmd',
            success: function( result ){
                maskReport.hide();
                btnRun.setDisabled( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    LABKEY.ext.HAI_vs_GE_Lib.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    var p = outputParams[0];

                    pnlReport.update(p.value);

                    $('#res_table').dataTable();

                    pnlTabs.setActiveTab(1);
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var pnlParameters = new Ext.Panel({
            activeItem: 0,
            bodyStyle: { paddingTop: '1px' },
            border: false,
            defaults: {
//                autoHeight: true,
//            	forceLayout: true,
                hideMode: 'offsets',
                labelStyle: 'width: 110px;',
                width: 200
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                cbCohort,
                tfAlpha,
                btnRun
            ],
            layout: 'form',
            listeners: {
                afterrender: function(){
                    maskReport = new Ext.LoadMask(
                        this.getEl(),
                        {
                            msg: 'Generating the report...',
                            msgCls: 'mask-loading'
                        }
                    );
                }
            },
            title: 'Parameters'
        });

        var pnlReport = new Ext.Panel({
            autoHeight: true,
            border: false,
            defaults: {
                autoHeight: true,
                hideMode: 'offsets'
            },
            forceLayout: true,
            layout: 'fit'
        });

        var pnlTabs = new Ext.TabPanel({
            activeTab: 0,
            autoHeight: true,
            defaults: {
                autoHeight: true,
                hideMode: 'offsets',
                style: 'padding-bottom: 4px; padding-right: 4px; padding-left: 4px;'
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                pnlParameters,
                {
                    items: pnlReport,
                    layout: 'fit',
                    title: 'Report'
                }
            ],
            layoutOnTabChange: true,
            listeners: {
                tabchange: function(tabPanel, tab){
                    if ( tab.title == 'Create' ){
                    }
                }
            },
            minTabWidth: 100,
            resizeTabs: true
        });


        /////////////////////////////////////
        //             Functions           //
        /////////////////////////////////////


        // jQuery-related


        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'hai_vs_ge';
        this.frame          = false;
        this.items          = pnlTabs;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.HAI_vs_GE.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end HAI_vs_GE Panel class
