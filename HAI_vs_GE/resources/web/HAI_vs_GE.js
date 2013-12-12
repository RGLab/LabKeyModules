// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 Copyright 2013 Fred Hutchinson Cancer Research Center

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
            maskReport                          = undefined,
            fieldWidth                          = 240
            ;

        var checkBtnRunStatus = function(){
            if (    cbCohortPredict.getValue() != '' &&
                    cbTimePoint.getValue() != '' &&
                    nfFalseDiscoveryRate.getRawValue() != '' &&
                    nfFoldChange.getRawValue() != '' &&
                    ( ( chDichotomize.getValue() && nfDichotomize.getRawValue() != '' ) || ! chDichotomize.getValue() )
                    ){
                btnRun.setDisabled( false );
            } else {
                btnRun.setDisabled( true );
            }
        };

        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strCohort = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                loadexception: LABKEY.ext.HAI_vs_GE_Lib.onFailure
            },
            queryName: 'cohorts',
            schemaName: 'study'
        });

        var strTimePoint = new LABKEY.ext.Store({
            listeners: {
                load: function(){
                    cbTimePoint.setDisabled( false );
                },
                loadexception: LABKEY.ext.HAI_vs_GE_Lib.onFailure
            },
            queryName: 'timepoints',
            schemaName: 'study'
        });

        var strCohortPredict = new LABKEY.ext.Store({
            listeners: {
                load: function(){
                    cbCohortPredict.setDisabled( false );
                },
                loadexception: LABKEY.ext.HAI_vs_GE_Lib.onFailure
            },
            queryName: 'cohorts',
            schemaName: 'study'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var chDichotomize = new Ext.form.Checkbox({
            checked: true,
            fieldLabel: 'Dichotomize',
            handler: function( cb, s ){
                if ( s ){
                    nfDichotomize.show();
                } else {
                    nfDichotomize.hide();
                }
            }
        });

        var nfDichotomize = new Ext.form.NumberField({
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Enter dichotomization threshold',
            height: 22,
            listeners: {
                keyup: {
                    buffer: 150,
                    fn: function(field, e) {
                        if( Ext.EventObject.ESC == e.getKey() ){
                            field.setValue('');
                        }

                        checkBtnRunStatus();
                    }
                }
            },
            value: 0,
            width: fieldWidth
        });

        var cbCohort = new Ext.ux.form.ExtendedComboBox({
            displayField: 'cohort',
            emptyText: 'Click...',
            fieldLabel: 'Select a cohort for training',
            listeners: {
                change: function(){
                    if ( this.getValue() == '' ){
                        cbTimePoint.clearValue();
                        cbTimePoint.setDisabled( true );
                        cbCohortPredict.clearValue();
                        cbCohortPredict.setDisabled( true );
                        btnRun.setDisabled( true );
                    } else {
                        strTimePoint.load( { params: { 'query.param.COHORT_VALUE': this.getRawValue() } } );

                        strCohortPredict.setUserFilters([
                            LABKEY.Filter.create(
                                'expression_matrix_accession',
                                this.getValue(),
                                LABKEY.Filter.Types.NOT_EQUAL
                            )
                        ]);
                        strCohortPredict.load();
                    }
                },
                cleared: function(){
                    cbTimePoint.clearValue();
                    cbTimePoint.setDisabled( true );
                    cbCohortPredict.clearValue();
                    cbCohortPredict.setDisabled( true );
                    btnRun.setDisabled( true );
                },
                select: function(){
                    strTimePoint.load( { params: { 'query.param.COHORT_VALUE': this.getRawValue() } } );

                    strCohortPredict.setUserFilters([
                        LABKEY.Filter.create(
                            'expression_matrix_accession',
                            this.getValue(),
                            LABKEY.Filter.Types.NOT_EQUAL
                        )
                    ]);
                    strCohortPredict.load();
                }
            },
            store: strCohort,
            valueField: 'expression_matrix_accession',
            width: fieldWidth
        });

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'timepoint',
            emptyText: 'Click...',
            fieldLabel: 'Select a time point',
            listeners: {
                change:     checkBtnRunStatus,
                cleared:    checkBtnRunStatus,
                select:     checkBtnRunStatus
            },
            store: strTimePoint,
            valueField: 'timepoint',
            width: fieldWidth
        });

        var nfFalseDiscoveryRate = new Ext.form.NumberField({
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Enter false discovery rate threshold',
            height: 22,
            listeners: {
                keyup: {
                    buffer: 150,
                    fn: function(field, e) {
                        if( Ext.EventObject.ESC == e.getKey() ){
                            field.setValue('');
                        }

                        checkBtnRunStatus();
                    }
                }
            },
            value: 0.02,
            width: fieldWidth
        });

        var nfFoldChange = new Ext.form.NumberField({
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Enter fold change threshold',
            height: 22,
            listeners: {
                keyup: {
                    buffer: 150,
                    fn: function(field, e) {
                        if( Ext.EventObject.ESC == e.getKey() ){
                            field.setValue('');
                        }

                        checkBtnRunStatus();
                    }
                }
            },
            value: 0,
            width: fieldWidth
        });

        var cbCohortPredict = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'cohort',
            emptyText: 'Click...',
            fieldLabel: 'Select a cohort for predicting',
            listeners: {
                change:     checkBtnRunStatus,
                cleared:    checkBtnRunStatus,
                select:     checkBtnRunStatus
            },
            store: strCohortPredict,
            valueField: 'expression_matrix_accession',
            width: fieldWidth
        });


        /////////////////////////////////////
        //             Buttons             //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                LABKEY.Query.selectRows({
                    failure: LABKEY.ext.HAI_vs_GE_Lib.onFailure,
                    filterArray: [
                        LABKEY.Filter.create( 'expression_matrix_accession', cbCohort.getValue() ),
                        LABKEY.Filter.create( 'timepoint', cbTimePoint.getValue() )
                    ],
                    queryName: 'study_cohorts_info',
                    schemaName: 'study',
                    success: function(data){
                        var count = data.rows.length;
                        if ( count == 1 ){
                            cnfReport.inputParams = {
                                dichotomize:                chDichotomize.getValue(),
                                dichotomizeValue:           nfDichotomize.getValue(),
                                timePoint:                  cbTimePoint.getValue(),
                                analysisAccession:          data.rows[0].analysis_accession,
                                expressionMatrixAccession:  cbCohort.getValue(),
                                fdrThreshold:               nfFalseDiscoveryRate.getValue(),
                                fcThreshold:                nfFoldChange.getValue(),
                                expressionMatrixPredict:    cbCohortPredict.getValue()
                            };

                            setReportRunning( true );

                            LABKEY.Report.execute( cnfReport );
                        } else if ( count > 1 ) {
                            LABKEY.ext.HAI_vs_GE_Lib.onFailure({
                                exception: 'The selected values do not result in a unique set of parameters.'
                            });
                        } else if ( count < 1 ) {
                            LABKEY.ext.HAI_vs_GE_Lib.onFailure({
                                exception: 'The selected values result in an empty set of parameters.'
                            });
                        }
                    }
                });
            },
            text: 'Run'
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                setReportRunning( false );

                LABKEY.ext.HAI_vs_GE_Lib.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:HAI_vs_GE/study/study_cohorts_info/HAI_vs_GE.Rmd',
            success: function( result ){
                setReportRunning( false );

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
            bodyStyle: { paddingTop: '1px' },
            defaults: {
                autoHeight: true,
                forceLayout: true,
                hideMode: 'offsets'
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                chDichotomize,
                nfDichotomize,
                cbCohort,
                cbTimePoint,
                nfFalseDiscoveryRate,
                nfFoldChange,
                cbCohortPredict,
                btnRun
            ],
            layout: {
                labelWidth: 210,
                type: 'form'
            },
            title: 'Parameters'
        });

        var pnlReport = new Ext.Panel({
            bodyStyle: 'padding: 1px;',
            defaults: {
                autoHeight: true,
                hideMode: 'offsets'
            },
            forceLayout: true,
            html: 'Switch to the \'Parameters\' tab, select the parameter values and click the \'RUN\' button to generate the report',
            layout: 'fit',
            title: 'Report'
        });

        var pnlTabs = new Ext.TabPanel({
            activeTab: 0,
            autoHeight: true,
            defaults: {
                autoHeight: true,
                border: false,
                hideMode: 'offsets',
                style: 'padding-bottom: 4px; padding-right: 4px; padding-left: 4px;'
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                pnlParameters,
                pnlReport
            ],
            layoutOnTabChange: true,
            listeners: {
                afterrender: function(){
                    maskReport = new Ext.LoadMask(
                        this.getEl(),
                        {
                            msg: 'Generating the report...',
                            msgCls: 'mask-loading'
                        }
                    );
                },
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

        var setReportRunning = function( bool ){
            if ( bool ){
                maskReport.show();
            } else {
                maskReport.hide();
            }
            btnRun.setDisabled( bool );
            cbCohort.setDisabled( bool );
            cbTimePoint.setDisabled( bool );
        };

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

