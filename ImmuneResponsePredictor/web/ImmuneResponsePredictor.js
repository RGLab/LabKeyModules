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
                cbVariable.isValid( true ) &&
                cbCohortTraining.isValid( true ) &&
                ( nfDichotomize.isValid( true ) || ! chDichotomize.getValue() ) &&
                cbTimePoint.isValid( true ) &&
                cbAssay.isValid( true ) &&
                nfFalseDiscoveryRate.isValid( true ) &&
                nfFoldChange.isValid( true )
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
                load: function(){
                    var field = { name: 'displayTimepoint' };
                    field = new Ext.data.Field(field);
                    this.recordType.prototype.fields.replace(field);
                    this.each( function(r){
                        if ( typeof r.data[field.name] == 'undefined' ){
                            r.data[field.name] = r.data['timepoint'] +  ' ' + r.data['timepointUnit'];
                        }
                    });

                    cbTimePoint.bindStore( this );
                },
                loadexception: LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure
            },
            queryName: 'timepoints',
            schemaName: 'study'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbVariable = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'name',
            fieldLabel: 'Select a variable',
            listeners: {
                change:     checkBtnRunStatus,
                cleared:    checkBtnRunStatus,
                select:     checkBtnRunStatus
            },
            store: new Ext.data.ArrayStore({
                data: [ [ 'HAI', 'HAI' ] ],
                fields: [ 'name', 'name' ]
            }),
            value: 'HAI',
            valueField: 'name',
            width: fieldWidth
        });

        var cbCohortTraining = new Ext.ux.form.ExtendedLovCombo({
            allowBlank: false,
            displayField: 'cohort',
            emptyText: 'Click...',
            fieldLabel: 'Training',
            lazyInit: false,
            listeners: {
                blur: function(){
                    cbCohortTesting.focus();
                    cbCohortTesting.expand(); // .onLoad() better ?
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
            allowBlank: false,
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

        var cbAssay = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
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

                    checkBtnRunStatus();
                },
                cleared: function(){
                    boolGeneExpression = false;
                    Ext.each( arGeneExpression, function( e ){ e.hide(); } );

                    checkBtnRunStatus();
                },
                select: function(){
                    boolGeneExpression = true;
                    Ext.each( arGeneExpression, function( e ){ e.show(); } )

                    checkBtnRunStatus();
                }
            },
            store: new Ext.data.ArrayStore({
                data: [ [ 'Gene expression', 'Gene expression' ] ],
                fields: [ 'name', 'name' ]
            }),
            value: 'Gene expression',
            valueField: 'name',
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
                checkBtnRunStatus();
            }
        });

        var nfDichotomize = new Ext.form.NumberField({
            allowBlank: false,
            decimalPrecision: -1,
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Enter dichotomization threshold',
            validator: function( value ){
                var errors = [];

                value = Ext.isDefined(value) ? value : this.processValue(this.getRawValue());
                value = String(value).replace(this.decimalSeparator, ".");

                if (value.length < 1 || value === this.emptyText) {
                    if (! this.allowBlank) {
                        //if value is blank and allowBlank is true, there cannot be any additional errors
                        errors.push(this.blankText);
                    }
                } else {
                    if( isNaN( value ) ){
                        errors.push( String.format( this.nanText, value ) );
                    } else {
                        var num = this.parseValue( value );

                        if ( num <= 0 ){
                            errors.push( 'The value for this field must be greater than zero' );
                        }
                    }
                }

                return errors.length == 0 ? true : errors;
            },
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
            value: 4,
            width: fieldWidth
        });

        var nfFalseDiscoveryRate = new Ext.form.NumberField({
            allowBlank: false,
            decimalPrecision: -1,
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
            maxValue: 1,
            minValue: 0,
            value: 0.1,
            width: fieldWidth
        });

        var nfFoldChange = new Ext.form.NumberField({
            allowBlank: false,
            decimalPrecision: -1,
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
            minValue: 0,
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
                    columns: [ 'analysis_accession' ],
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

                            cnfReport.inputParams = {
                                analysisAccession:      Ext.encode( Ext.pluck( data.rows, 'analysis_accession' ) ),
                                dichotomize:            chDichotomize.getValue(),
                                dichotomizeValue:       nfDichotomize.getValue(),
                                timePoint:              cbTimePoint.getValue(),
                                timePointDisplay:       cbTimePoint.getRawValue(), // TODO: do we still need this?
                                fdrThreshold:           nfFalseDiscoveryRate.getValue(),
                                fcThreshold:            nfFoldChange.getValue()
                            };

                            LABKEY.Query.selectRows({
                                columns: [ 'expression_matrix_accession' ],
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
                                    cnfReport.inputParams['emTesting'] = Ext.encode( Ext.pluck( data.rows, 'expression_matrix_accession') );

                                    setReportRunning( true );
                                    LABKEY.Report.execute( cnfReport );
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
            nfFoldChange
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
                        cbVariable,
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
                        cbAssay
                    ],
                    title: 'Step 2: Select Predictors'
                }),
                new Ext.form.FieldSet({
                    autoScroll: true,
                    collapsed: true,
                    collapsible: true,
                    items: arGeneExpression,
                    title: 'Options',
                    titleCollapse: true
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

        $('#' + config.webPartDivId)
            .parents('tr')
            .prev()
            .find('.labkey-wp-title-text')
            .wrap(
                '<a href=\'' +
                LABKEY.ActionURL.buildURL(
                    'reports',
                    'runReport',
                    LABKEY.ActionURL.getContainer(),
                    {
                        reportId: 'module:ImmuneResponsePredictor/reports/schemas/study/study_cohorts_info/ImmuneResponsePredictor.Rmd',
                        tabId: 'Source'
                    }
                ) +
                '\' target=\'_blank\' title=\'Click to open the knitr source code in a new window\'></a>'
            );

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

