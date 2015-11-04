// vim: sw=4:ts=4:nu:nospell
/*
 Copyright 2014 Fred Hutchinson Cancer Research Center

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
            me                          = this,
            maskReport                  = undefined,
            fieldWidth                  = 240,
            labelWidth                  = 155,
            flagCohortTrainingSelect    = undefined,
            flagTimePointSelect         = undefined,
            foldChangeValue             = 0
            ;

        var checkBtnsStatus = function(){
            if (
                cbVariable.isValid( true ) &&
                cbTimePoint.isValid( true ) &&
                cbCohortTraining.isValid( true ) && ! cbCohortTraining.disabled &&
                ( nfDichotomize.isValid( true ) || ! chDichotomize.getValue() ) &&
                nfFoldChange.isValid( true )
            ){
                btnRun.setDisabled( false );
            } else {
                btnRun.setDisabled( true );
            }

            if (    cbVariable.getValue()           == cbVariable.originalValue &&
                    cbTimePoint.getValue()          == cbTimePoint.originalValue &&
                    cbCohortTraining.getValue()     == cbCohortTraining.originalValue &&
                    cbCohortTesting.getValue()      == cbCohortTesting.originalValue &&
                    chDichotomize.getValue()        == chDichotomize.originalValue &&
                    nfDichotomize.getValue()        == nfDichotomize.originalValue &&
                    chFoldChange.getValue()         == chFoldChange.originalValue &&
                    nfFoldChange.getValue()         == nfFoldChange.originalValue &&
                    chFalseDiscoveryRate.getValue() == chFalseDiscoveryRate.originalValue &&
                    fsAdditionalOptions.collapsed
            ){
                btnReset.setDisabled( true );
            } else {
                btnReset.setDisabled( false );
            }
        };

        //Help strings
        var variable_help           = 'The predicted response (currently, only HAI is available).';
        var timepoint_help          = 'The gene expression time point used to predict the variable.';
        var training_help           = 'The cohort(s) used to train the model. Some cohorts are only available at specific time points.';
        var testing_help            = 'The cohort(s) used to test the model (optional).';
        var dicho_help              = 'If checked, the predicted response is dichotomized using the specified threshold.<br> Every participant with a value above the selected threshold will be considered a responder.';
        var foldchange_help         = 'Features with an absolute fold change to baseline <u>lower</u> than the threshold will be excluded.';
        var falsediscoveryrate_help = 'If checked, only genes differentially expressed over time are selected (as opposed to the entire array).';

        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strCohortTraining = new LABKEY.ext.Store({
            autoLoad: false,
            listeners: {
                load: function(){
                    cbCohortTraining.setDisabled( this.getCount() === 0 );
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'all_IRP',
            schemaName: 'study'
        });

        var strCohortTesting = new LABKEY.ext.Store({
            listeners: {
                load: function(){
                    cbCohortTesting.setDisabled( this.getCount() === 0 );
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'all_IRP',
            schemaName: 'study'
        });

        var strTimePoint = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                load: function(){
                    if ( this.getCount() > 0 ){
                        cbTimePoint.setDisabled( false );

                        var num, unit,
                            field = new Ext.data.Field({ name: 'displayTimepoint' });
                        this.recordType.prototype.fields.replace(field);
                        this.each( function(r){
                            if ( r.data[field.name] == undefined ){
                                num                 = r.data['timepoint'];
                                unit                = r.data['timepointUnit'];
                                r.data[field.name]  = num + ' ' + ( num != 1 ? unit : unit.slice( 0, unit.length - 1 ) );
                            }
                        });

                        cbTimePoint.bindStore( this );
                    }
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'timepoints_IRP',
            schemaName: 'study'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbVariable = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'name',
            fieldLabel: 'Response variable',
            listeners: {
                blur: checkBtnsStatus,
                change: checkBtnsStatus,
                cleared: checkBtnsStatus,
                select: checkBtnsStatus
            },
            store: new Ext.data.ArrayStore({
                data: [ [ 'HAI', 'HAI' ] ],
                fields: [ 'name', 'name' ]
            }),
            value: 'HAI',
            valueField: 'name',
            width: fieldWidth
        });

        var customTemplate = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class =\'x-combo-list-item\'>',
                    '{displayTimepoint:this.process} ({cohortCount:this.pluralCohort})',
                '</div>',
            '</tpl>',
            {
                pluralCohort : function( v ) {
                    return Ext.util.Format.plural( v, 'cohort' );
                },
                process : function( value ) { 
                    return value === '' ? '&nbsp;' : Ext.util.Format.htmlEncode( value );
                }
            }   
        );

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            disabled: true,
            displayField: 'displayTimepoint',
            fieldLabel: 'Predictor time point',
            lazyInit: false,
            listeners: {
                blur: checkBtnsStatus,
                change: function(){
                    if ( ! flagTimePoint ) {
                        handleTimepointSelection();
                    }

                    checkBtnsStatus();
                },
                cleared: function(){
                    cbCohortTraining.setDisabled( true );
                    cbCohortTraining.reset();
                    cbCohortTesting.setDisabled( true );
                    cbCohortTesting.reset();

                    checkBtnsStatus();
                },
                focus: function(){
                    flagTimePoint = false;

                    checkBtnsStatus();
                },
                select: function(){
                    flagTimePoint = true;
                    handleTimepointSelection();

                    checkBtnsStatus();
                }
            },
            store: strTimePoint,
            tpl: customTemplate,
            valueField: 'displayTimepoint',
            width: fieldWidth
        });

        var cbCohortTraining = new Ext.ux.form.ExtendedLovCombo({
            allowBlank: false,
            disabled: true,
            displayField: 'cohort',
            fieldLabel: 'Training',
            lazyInit: false,
            listeners: {
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
            fieldLabel: 'Testing',
            lazyInit: false,
            listeners: {
                change: checkBtnsStatus,
                cleared: checkBtnsStatus,
                select: checkBtnsStatus
            },
            store: strCohortTesting,
            valueField: 'cohort',
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

                checkBtnsStatus();
            },
            width: fieldWidth
        });

        var nfDichotomize = new Ext.form.NumberField({
            allowBlank: false,
            decimalPrecision: -1,
            emptyText: 'Type...',
            enableKeyEvents: true,
            fieldLabel: 'Dichotomization threshold',
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
            hidden: true,
            listeners: {
                keyup: {
                    buffer: 150,
                    fn: function(field, e) {
                        if( Ext.EventObject.ESC == e.getKey() ){
                            field.setValue('');
                        }

                        checkBtnsStatus();
                    }
                }
            },
            value: 4,
            width: fieldWidth
        });

        var nfFoldChange = new Ext.form.NumberField({
            allowBlank: false,
            decimalPrecision: -1,
            emptyText: 'Type...',
            enableKeyEvents: true,
            listeners: {
                keyup: {
                    buffer: 150,
                    fn: function(field, e) {
                        if( Ext.EventObject.ESC == e.getKey() ){
                            field.setValue('');
                        }

                        checkBtnsStatus();
                    }
                }
            },
            minValue: 0,
            value: 0.58,
            width: 40
        });


        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                setReportRunning( true );

                cnfReport.inputParams = {
                    analysisAccession:      Ext.encode( cbCohortTraining.getCheckedArray( 'analysis_accession' ) ),
                    cohortsTraining:        Ext.encode( cbCohortTraining.getCheckedArray() ),
                    cohortsTesting:         Ext.encode( cbCohortTesting.getCheckedArray() ),
                    dichotomize:            chDichotomize.getValue(),
                    dichotomizeValue:       nfDichotomize.getValue(),
                    timePoint:              cbTimePoint.getSelectedField( 'timepoint' ),
                    timePointUnit:          cbTimePoint.getSelectedField( 'timepointUnit' ),
                    fdr:                    chFalseDiscoveryRate.getValue(), //filtering value is 0.1, if true; no filtering ow
                    fcThreshold:            chFoldChange.getValue() ? nfFoldChange.getValue() : 0
                };
                LABKEY.Report.execute( cnfReport );
            },
            text: 'Run'
        });

        var btnReset = new Ext.Button({
            disabled: true,
            handler: function(){
                Ext.each(
                    [
                        cbVariable,
                        cbTimePoint,
                        cbCohortTraining,
                        cbCohortTesting,
                        chDichotomize,
                        nfDichotomize,
                        chFoldChange,
                        nfFoldChange,
                        chFalseDiscoveryRate
                    ],
                    function( e ){ e.reset(); }
                );

                cbCohortTraining.setDisabled( true );
                cbCohortTesting.setDisabled( true );

                Ext.each(
                    [
                        chFoldChange,
                        dfFoldChange,
                        chFalseDiscoveryRate,
                        dfFalseDiscoveryRate
                    ],
                    function( e ){ e.setDisabled( false ); }
                );

                cntEmptyPnlView.setVisible( true );
                cntReport.setVisible( false );

                checkBtnsStatus();

                fsAdditionalOptions.collapse();
            },
            text: 'Reset'
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                setReportRunning( false );

                LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:ImmuneResponsePredictor/study/ImmuneResponsePredictor.Rmd',
            success: function( result ){
                setReportRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if ( errors && errors.length > 0 ){
                    LABKEY.ext.ISCore.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    var p = outputParams[0];

                    cntReport.update( p.value );
                    cntEmptyPnlView.setVisible( false );
                    cntReport.setVisible( true );

                    $('#res_table').dataTable();

                    pnlTabs.setActiveTab( 1 );
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var chFoldChange = new Ext.form.Checkbox({
            checked: true,
            handler: function( cb, s ){
                nfFoldChange.setDisabled( !s );
                foldChangeValue = ! s ? nfFoldChange.getValue() : foldChangeValue;
                nfFoldChange.setValue( s ? foldChangeValue : 0 );

                checkBtnsStatus();
            }
        });

        var dfFoldChange = new Ext.form.DisplayField({
            disabledClass: 'x-item-disabled',
            value: 'Absolute log (base 2) fold change to baseline greater than:'
        });

        var chFalseDiscoveryRate = new Ext.form.Checkbox({
            checked: false,
            handler: checkBtnsStatus
        });

        var dfFalseDiscoveryRate = new Ext.form.DisplayField({
            disabledClass: 'x-item-disabled',
            value: 'Use genes / probes differentially expressed over time'
        });

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
                text: 'Only consider genes that meet the following conditions:'
            }),
            new Ext.Spacer({
                height: 7
            }),
            LABKEY.ext.ISCore.factoryTooltipWrapper(
                {
                    align: 'middle',
                    border: false,
                    items: [
                        chFoldChange,
                        dfFoldChange,
                        nfFoldChange
                    ],
                    layout: 'hbox',
                    width: 465
                },
                'Absolute fold-change', foldchange_help, false, true
            ),
            LABKEY.ext.ISCore.factoryTooltipWrapper(
                {
                    align: 'middle',
                    border: false,
                    items: [
                        chFalseDiscoveryRate,
                        dfFalseDiscoveryRate
                    ],
                    layout: 'hbox',
                    width: 465
                },
                'Use genes differentially expressed over time', falsediscoveryrate_help, false, true
            )
        ],
        boolGeneExpression = true;
 
        var tlbrButtons = new Ext.Toolbar({
            border: true,
            defaults: {
                style: 'padding-top: 1px; padding-bottom: 1px;',
                width: 45
            },
            enableOverflow: true,
            items: [
                btnRun,
                btnReset
            ],
            style: 'padding-right: 2px; padding-left: 2px;'
        });

        var fsAdditionalOptions = new Ext.form.FieldSet({
            autoScroll: true,
            collapsed: true,
            collapsible: true,
            items: arGeneExpression,
            listeners: {
                afterrender: {
                    fn: function(){
                        this.on( 'collapse', checkBtnsStatus );
                    },
                    single: true
                },
                expand: function(){
                    this.doLayout();
                    checkBtnsStatus();
                }
            },
            title: 'Additional options',
            titleCollapse: true
        });

        var pnlInput = new Ext.form.FormPanel({
            bodyStyle: { paddingTop: '1px' },
            defaults: {
                autoHeight: true,
                forceLayout: true,
                hideMode: 'offsets'
            },
            deferredRender: false,
            items: [
                new Ext.Container({
                    autoEl: 'a',
                    cls: 'labkey-text-link bold-text',
                    html: 'quick help',
                    listeners: {
                        afterrender: {
                            fn: function(){
                                this.getEl().on( 'click', function(){ LABKEY.help.Tour.show('immport-irp-tour'); } );
                            },
                            single: true
                        }
                    }
                }),
                {
                    bodyStyle: 'padding-top: 10px;',
                    border: false,
                    defaults: {
                        border: false
                    },
                    items: [
                        { html: 'For information and help on how to use the Immune Response Predictor module, click the' },
                        new Ext.Container({
                            autoEl: 'a',
                            html: '&nbsp;\'About\'&nbsp;',
                            listeners: {
                                afterrender: {
                                    fn: function(){
                                        this.getEl().on( 'click', function(){ pnlTabs.setActiveTab( 2 ); } );
                                    },
                                    single: true
                                }
                            }
                        }),
                        { html: 'and' },
                        new Ext.Container({
                            autoEl: 'a',
                            html: '&nbsp;\'Help\'&nbsp;',
                            listeners: {
                                afterrender: {
                                    fn: function(){
                                        this.getEl().on( 'click', function(){ pnlTabs.setActiveTab( 3 ); } );
                                    },
                                    single: true
                                }
                            }
                        }),
                        { html: 'tabs above.</br></br>' }
                    ],
                    layout: 'hbox'
                },
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbVariable, 'Variable', variable_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbTimePoint, 'Time point', timepoint_help ),
                        new Ext.Spacer({ height: 20 }),
                        new Ext.form.Label({ cls: 'x-form-item', text: 'Select cohorts' }),
                        new Ext.Spacer({ height: 7 }),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbCohortTraining, 'Training', training_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbCohortTesting, 'Testing', testing_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( chDichotomize, 'Dichotomize', dicho_help ),
                        nfDichotomize,
                    ],
                    title: 'Parameters'
                }),
                fsAdditionalOptions,
                {
                    border: true,
                    items: [
                        tlbrButtons
                    ],
                    style: 'padding-right: 2px; padding-left: 2px;'
                }
            ],
            labelWidth: labelWidth,
            tabTip: 'Input',
            title: 'Input'
        });

        var cntEmptyPnlView = new Ext.Container({
            defaults: {
                border: false
            },
            items: [
                { html: 'Switch to the' },
                new Ext.Container({
                    autoEl: 'a',
                    html: '&nbsp;\'Input\'&nbsp;',
                    listeners: {
                        afterrender: {
                            fn: function(){
                                this.getEl().on( 'click', function(){ pnlTabs.setActiveTab( 0 ); } );
                            },
                            single: true
                        }
                    }
                }),
                { html: 'tab, select the parameter values and click the \'RUN\' button to generate the report.' }
            ],
            layout: 'hbox'
        });

        var cntReport = new Ext.Container({
            defaults: {
                border: false
            },
            items: [],
            layout: 'fit'
        });

        var pnlView = new Ext.Panel({
            bodyStyle: 'padding: 1px;',
            defaults: {
                autoHeight: true,
                hideMode: 'offsets'
            },
            items: [ cntEmptyPnlView, cntReport ],
            layout: 'fit',
            tabTip: 'View',
            title: 'View'
        });

        var pnlTabs = new Ext.TabPanel({
            activeTab: 0,
            autoHeight: true,
            defaults: {
                autoHeight: true,
                bodyStyle: 'padding: 4px;',
                border: false,
                forceLayout: true,
                hideMode: 'offsets',
                style: 'padding-bottom: 4px; padding-right: 4px; padding-left: 4px;'
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                pnlInput,
                pnlView,
                {
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: 'This module can be used to automatically select a group of genes whose expression at a given time point (e.g. gene expression levels at day 0) best predicts a given immunological response at a later time point (currently limited to HAI).',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: 'It uses penalized linear or logistic multivariate regression as implemented in the <a href="http://cran.r-project.org/web/packages/glmnet/index.html" target="_blank">glmnet</a> R package. The gene selection part is done by cross validation in the training cohort. The test cohort (if available) is used to assess the predictive ability of the inferred model.',
                            style: 'margin-top: 5px;',
                            title: 'Details'
                        }),
                        new Ext.form.FieldSet({
                            html: LABKEY.ext.ISCore.contributors,
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'Contributors'
                        })
                    ],
                    layout: 'fit',
                    tabTip: 'About',
                    title: 'About'
                },
                {
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.Label({
                            text: 'Select the data used to train and test the model.'
                        }),
                        new Ext.form.FieldSet({
                            html:   '<b>Response variable:</b> ' + variable_help + '<br><br>' +
                                    '<b>Predictor time point:</b> ' + timepoint_help + '<br><br>' +
                                    '<b>Training:</b> ' + training_help + '<br><br>' +
                                    '<b>Testing:</b> ' + testing_help + ' Note that using many cohorts may lead to an empty set of genes and will slow down the module.' + '<br><br>' +
                                    '<b>Dichotomize values:</b> ' + dicho_help,
                            style: 'margin-top: 5px;',
                            title: 'Parameters'
                        }),
                        new Ext.form.Label({
                            text: 'The additional options are used for filtering of the predicting features. Note that if Time point is 0 or less, the filtering options are disabled.'
                        }),
                        new Ext.form.FieldSet({
                            html:   '<b>Absolute fold-change:</b> ' + foldchange_help + '<br><br>' +
                                    '<b>Use genes differentially expressed over time:</b> ' + falsediscoveryrate_help,
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'Additional options'
                        }),
                        new Ext.form.FieldSet({
                            html: '\
                                The first figure in the view tab is a plot of the predicted response vs. the observed response\
                                where each point represents a participant. Each panel represents a cohort and indicates whether\
                                it was used for\
                                training (i.e: selecting predictive features) or testing. The heatmap of selected features\
                                shows the expression of the genes selected\
                                as predictors of the response. If the selected timepoint is later than baseline, the expression\
                                is the fold-change to baseline. The table of genes summarizes the features selected as predictors\
                                of the response by the elastic net.\
                            ',
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'View'
                        }),
                    ],
                    layout: 'fit',
                    tabTip: 'Help',
                    title: 'Help'
                }
            ],
            layoutOnTabChange: true,
            listeners: {
                afterrender: {
                    fn: function(){
                        maskReport = new Ext.LoadMask(
                            this.getEl(),
                            {
                                msg: LABKEY.ext.ISCore.generatingMessage,
                                msgCls: 'mask-loading'
                            }
                        );
                    },   
                    single: true 
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

            Ext.each(
                [
                    cbVariable,
                    cbTimePoint,
                    cbCohortTraining,
                    cbCohortTesting,
                    chDichotomize,
                    nfDichotomize,
                    chFoldChange,
                    nfFoldChange,
                    chFalseDiscoveryRate,
                    tlbrButtons
                ],
                function( e ){ e.setDisabled( bool ); }
            );
        };

        var handleTimepointSelection = function(){
            if ( cbTimePoint.getSelectedField('timepoint') <= 0 ){
                Ext.each(
                    [
                        chFoldChange,
                        dfFoldChange,
                        nfFoldChange,
                        chFalseDiscoveryRate,
                        dfFalseDiscoveryRate
                    ],
                    function( e ){ e.setDisabled( true ); }
                );

                chFoldChange.setValue( false );
                chFalseDiscoveryRate.setValue( false );
            } else {
                Ext.each(
                    [
                        nfFoldChange,
                        chFoldChange,
                        chFalseDiscoveryRate,
                        dfFoldChange,
                        dfFalseDiscoveryRate
                    ],
                    function( e ){ e.setDisabled( false ); }
                );

                chFoldChange.setValue( true );
            }
            cbCohortTraining.clearValue();
            cbCohortTraining.setDisabled( true );
            cbCohortTesting.clearValue();
            cbCohortTesting.setDisabled( true );

            if ( cbTimePoint.getValue() == '' ){
                cbCohortTraining.setDisabled( true );
            } else {
                strCohortTraining.setUserFilters([
                    LABKEY.Filter.create(
                        'timepoint',
                        cbTimePoint.getSelectedField( 'timepoint' ),
                        LABKEY.Filter.Types.EQUAL
                    ),
                    LABKEY.Filter.create(
                        'timepointUnit',
                        cbTimePoint.getSelectedField( 'timepointUnit' ),
                        LABKEY.Filter.Types.EQUAL
                    )
                ]);
                strCohortTraining.load();
            }
        };

        var handleCohortTrainingSelection = function(){
            cbCohortTesting.clearValue();

            checkBtnsStatus();

            if ( cbCohortTraining.getValue() == '' ){
                cbCohortTesting.setDisabled( true );
            } else {
                strCohortTesting.setUserFilters([
                    LABKEY.Filter.create(
                        'cohort',
                        cbCohortTraining.getValue(),
                        LABKEY.Filter.Types.EQUALS_NONE_OF
                    ),
                    LABKEY.Filter.create(
                        'timepoint',
                        cbTimePoint.getSelectedField( 'timepoint' ),
                        LABKEY.Filter.Types.EQUALS
                    ),
                    LABKEY.Filter.create(
                        'timepointUnit',
                        cbTimePoint.getSelectedField( 'timepointUnit' ),
                        LABKEY.Filter.Types.EQUALS
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
                    null,
                    {
                        reportId: 'module:ImmuneResponsePredictor/reports/schemas/study/ImmuneResponsePredictor.Rmd',
                        tabId: 'Source'
                    }
                ) +
                '\' target=\'_blank\' title=\'Click to open the knitr source code in a new window\'></a>'
            );

        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'ISCore';
        this.frame          = false;
        this.items          = pnlTabs;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ImmuneResponsePredictor.superclass.constructor.apply(this, arguments);

    }, // end constructor

    listeners: {
        afterrender: IRPTour
    },   


    resize: function(){
    }
}); // end ImmuneResponsePredictor Panel class

