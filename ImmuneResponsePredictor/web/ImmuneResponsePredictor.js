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

LABKEY.ext.ImmuneResponsePredictor = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me                                  = this,
            maskReport                          = undefined,
            fieldWidth                          = 240,
            flagCohortTrainingSelect            = undefined
            ;

        var checkBtnRunStatus = function(){
            if (
                    cbCohortTraining.getCheckedValue() != '' &&
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

        var strCohortTraining = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                loadexception: LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure
            },
            queryName: 'cohorts',
            schemaName: 'study'
        });

        var strCohortTesting = new LABKEY.ext.Store({
            listeners: {
                load: function(){
                    if ( this.getCount() > 0 ){
                        cbCohortTesting.setDisabled( false );
                    } else {
                        cbCohortTesting.setDisabled( true );
                    }
                },
                loadexception: LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure
            },
            queryName: 'cohorts',
            schemaName: 'study'
        });

        var strTimePoint = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                loadexception: LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure
            },
            queryName: 'timepoints',
            schemaName: 'study'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbCohortTraining = new Ext.ux.form.ExtendedLovCombo({
            displayField: 'cohort',
            emptyText: 'Click...',
            fieldLabel: 'Training',
            lazyInit: false,
            listeners: {
                blur: function(){
                    cbCohortTesting.focus();
                    cbCohortTesting.expand();
                },
                change: function(){
                    if ( ! flagCohortTrainingSelect ) {
                        handleCohortTrainingSelection();
                    }
                },
                cleared: function(){
                    cbCohortTesting.onTrigger2Click();
                    cbCohortTesting.setDisabled( true );
                    btnRun.setDisabled( true );
                },
                expand: function(){
                    cbCohortTesting.triggerBlur();
                },
                focus: function(){
                    flagCohortTrainingSelect = false;
                },
                select: function(){
                    flagCohortTrainingSelect = true;

                    handleCohortTrainingSelection();
                }
            },
            separator: ';', // important for Labkey filters
            store: strCohortTraining,
            valueField: 'cohort',
            width: fieldWidth
        });

        var cbCohortTesting = new Ext.ux.form.ExtendedLovCombo({
            disabled: true,
            displayField: 'cohort',
            emptyText: 'Click...',
            fieldLabel: 'Testing',
            lazyInit: false,
            listeners: {
                change:     checkBtnRunStatus,
                cleared:    checkBtnRunStatus,
                select:     checkBtnRunStatus
            },
            store: strCohortTesting,
            valueField: 'cohort',
            width: fieldWidth
        });

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
            displayField: 'displayTimepoint',
            emptyText: 'Click...',
            fieldLabel: 'Select a time point',
            lazyInit: false,
            listeners: {
                change:     checkBtnRunStatus,
                cleared:    checkBtnRunStatus,
                select:     checkBtnRunStatus
            },
            store: strTimePoint,
            valueField: 'timepoint',
            width: fieldWidth
        });

        var chDichotomize = new Ext.form.Checkbox({
            checked: false,
            fieldLabel: 'Dichotomize values',
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
            hidden: true,
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

        var nfFalseDiscoveryRate = new Ext.form.NumberField({
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'False discovery rate is less than',
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
            value: 0.1,
            width: fieldWidth
        });

        var nfFoldChange = new Ext.form.NumberField({
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Absolute fold change to baseline is greater than',
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
            value: 1,
            width: fieldWidth
        });


        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                LABKEY.Query.selectRows({
                    columns: [ 'cohort', 'analysis_accession', 'expression_matrix_accession' ],
                    failure: LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure,
                    filterArray: [
                        LABKEY.Filter.create(
                            'cohort',
                            cbCohortTraining.getCheckedValue(),
                            LABKEY.Filter.Types.EQUALS_ONE_OF
                        ),
                        LABKEY.Filter.create(
                            'timepoint',
                            cbTimePoint.getValue(),
                            LABKEY.Filter.Types.EQUALS
                        )
                    ],
                    queryName: 'study_cohorts_info',
                    schemaName: 'study',
                    success: function(data){
                        var count = data.rows.length;
                        if ( count >= 1 ) {
                            cnfReport.inputParams = {};
                            var emTraining = [], analysis = [], cohortTraining = [];
                            Ext.each( data.rows, function( row ){
                                emTraining.push(
                                    row.expression_matrix_accession
                                );
                                analysis.push(
                                    row.analysis_accession
                                );
                                cohortTraining.push(
                                    row.cohort
                                );
                            });
                            cnfReport.inputParams = {
                                emTraining:             Ext.encode( emTraining ),
                                cohortTraining:         Ext.encode( cohortTraining ),
                                analysisAccession:      Ext.encode( analysis ),
                                dichotomize:            chDichotomize.getValue(),
                                dichotomizeValue:       nfDichotomize.getValue(),
                                timePoint:              cbTimePoint.getValue(),
                                timePointDisplay:       cbTimePoint.getRawValue(),
                                fdrThreshold:           nfFalseDiscoveryRate.getValue(),
                                fcThreshold:            nfFoldChange.getValue(),
                                individualProbesFlag:   rgIndividualProbes.getValue().getGroupValue()
                            };

                            LABKEY.Query.selectRows({
                                columns: [ 'cohort', 'expression_matrix_accession' ],
                                failure: LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure,
                                filterArray: [
                                    LABKEY.Filter.create(
                                        'cohort',
                                        cbCohortTesting.getCheckedValue(),
                                        LABKEY.Filter.Types.EQUALS_ONE_OF
                                    ),
                                    LABKEY.Filter.create(
                                        'timepoint',
                                        cbTimePoint.getValue(),
                                        LABKEY.Filter.Types.EQUALS
                                    )
                                ],
                                queryName: 'study_cohorts_info',
                                schemaName: 'study',
                                success: function(data){
                                    var count = data.rows.length;
                                    if ( count >= 1 ) {
                                        var emTesting = [], cohortTesting = [];
                                        Ext.each( data.rows, function( row ){
                                            emTesting.push(
                                                row.expression_matrix_accession
                                            );
                                            cohortTesting.push(
                                                row.cohort
                                            );
                                        });
                                        cnfReport.inputParams['emTesting'] = Ext.encode( emTesting );
                                        cnfReport.inputParams['cohortTesting'] = Ext.encode( cohortTesting );

                                        setReportRunning( true );
                                        LABKEY.Report.execute( cnfReport );
                                    } else if ( count < 1 ) {
                                        LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure({
                                            exception: 'The selected values result in an empty set of parameters.'
                                        });
                                    }
                                }
                            });
                        } else if ( count < 1 ) {
                            LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure({
                                exception: 'The selected values result in an empty set of parameters.'
                            });
                        }
                    }
                });
            },
            text: 'Run'
        });


        var rgIndividualProbes = new Ext.form.RadioGroup({
            columns: 1,
            fieldLabel: 'Should individual probes be used as predictors or averaged for each gene',
            items: [
                {
                    boxLabel: 'Yes',
                    inputValue: false,
                    name: 'ip',
                    value: false
                },
                {
                    boxLabel: 'No',
                    checked: true,
                    inputValue: true,
                    name: 'ip',
                    value: true
                }
            ]
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                setReportRunning( false );

                LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:ImmuneResponsePredictor/study/study_cohorts_info/ImmuneResponsePredictor.Rmd',
            success: function( result ){
                setReportRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure({
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

        var arGeneExpression = [
            new Ext.form.Label({
                cls: 'x-form-item bold-text',
                text: 'Gene expression'
            }),
            new Ext.Spacer({
                height: 20
            }),
            new Ext.form.Label({
                cls: 'x-form-item',
                text: 'Only consider probes (or genes) that meet the following criteria:'
            }),
            new Ext.Spacer({
                height: 7
            }),
            nfFalseDiscoveryRate,
            nfFoldChange,
            rgIndividualProbes,
            new Ext.form.Label({
                cls: 'x-form-item',
                text: '(Note: \'No\' should be the default behavior for a cross-platform analysis)'
            })
        ],
        boolGeneExpression = true;

        var pnlParameters = new Ext.form.FormPanel({
            bodyStyle: { paddingTop: '1px' },
            defaults: {
                autoHeight: true,
                forceLayout: true,
                hideMode: 'offsets'
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        new Ext.ux.form.ExtendedComboBox({
                            disabled: true,
                            displayField: 'name',
                            fieldLabel: 'Select a variable',
                            store: new Ext.data.ArrayStore({
                                data: [ [ 'HAI', 'HAI' ] ],
                                fields: [ 'name', 'name' ]
                            }),
                            value: 'HAI',
                            valueField: 'name',
                            width: fieldWidth
                        }),
                        new Ext.Spacer({
                            height: 20
                        }),
                        new Ext.form.Label({
                            cls: 'x-form-item',
                            text: 'Select cohorts'
                        }),
                        new Ext.Spacer({
                            height: 7
                        }),
                        cbCohortTraining,
                        cbCohortTesting,
                        chDichotomize,
                        nfDichotomize
                    ],
                    title: 'Step 1: Select Response'
                }),
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        cbTimePoint,
                        new Ext.ux.form.ExtendedComboBox({
                            displayField: 'name',
                            fieldLabel: 'Select assay',
                            listeners: {
                                change: function(){
                                    if ( this.getValue() == '' ){
                                        boolGeneExpression = false;
                                        Ext.each( arGeneExpression, function( e ){ e.hide(); } );
                                    } else {
                                        boolGeneExpression = true;
                                        Ext.each( arGeneExpression, function( e ){ e.show(); } )
                                    }
                                },
                                cleared: function(){
                                    boolGeneExpression = false;
                                    Ext.each( arGeneExpression, function( e ){ e.hide(); } );
                                },
                                select: function(){
                                    boolGeneExpression = true;
                                    Ext.each( arGeneExpression, function( e ){ e.show(); } )
                                }
                            },
                            store: new Ext.data.ArrayStore({
                                data: [ [ 'Gene expression', 'Gene expression' ] ],
                                fields: [ 'name', 'name' ]
                            }),
                            value: 'Gene expression',
                            valueField: 'name',
                            width: fieldWidth
                        })
                    ],
                    title: 'Step 2: Select Predictors'
                }),
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: arGeneExpression,
                    title: 'Step 3: Options'
                }),
                btnRun
            ],
            labelWidth: 300,
            tabTip: 'Parameters',
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
            tabTip: 'Report',
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
            cbCohortTraining.setDisabled( bool );
            cbTimePoint.setDisabled( bool );
        };

        var handleCohortTrainingSelection = function(){
            if ( cbCohortTraining.getValue() == '' ){
                cbCohortTesting.clearValue();
                cbCohortTesting.setDisabled( true );
                btnRun.setDisabled( true );
            } else {
                cbCohortTesting.clearValue();
                strCohortTesting.setUserFilters([
                    LABKEY.Filter.create(
                        'cohort',
                        cbCohortTraining.getCheckedValue(),
                        LABKEY.Filter.Types.EQUALS_NONE_OF
                    )
                ]);
                strCohortTesting.load();
            }
        };

        // jQuery-related


        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'immuneResponsePredictor';
        this.frame          = false;
        this.items          = pnlTabs;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ImmuneResponsePredictor.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end ImmuneResponsePredictor Panel class

