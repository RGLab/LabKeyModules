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
            arrayCohorts                        = [],
            arrayTimePoints                     = []
            ;


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strGrandTable = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                load: function(){
                    arrayCohorts = this.collect( 'cohort' );
                    Ext.each( arrayCohorts, function(r, i, p){ p[i] = [ r ]; } );
                    strCohort.loadData( arrayCohorts );
                },
                loadexception: LABKEY.ext.HAI_vs_GE_Lib.onFailure
            },
            queryName: 'study_cohorts_info',
            schemaName: 'study'
        });

        var strCohort = new Ext.data.ArrayStore({
            data: [],
            fields: ['cohort', 'cohort'],
            listeners: {
                loadexception: LABKEY.ext.HAI_vs_GE_Lib.onFailure
            }
        });

        var strTimePoint = new Ext.data.ArrayStore({
            data: [],
            fields: ['timepoint', 'timepoint'],
            listeners: {
                loadexception: LABKEY.ext.HAI_vs_GE_Lib.onFailure
            }
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var chDichotomize = new Ext.form.Checkbox({
            fieldLabel: 'Dichotomize'
        });

        var cbCohort = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'cohort',
            emptyText: 'Click...',
            fieldLabel: 'Select a cohort',
            listeners: {
                change: function(){
                    if ( this.getValue() == '' ){
                        cbTimePoint.clearValue();
                        cbTimePoint.setDisabled( true );
                        btnRun.setDisabled( true );
                    } else {
                        strGrandTable.filter( 'cohort', this.getValue(), false, true, true );

                        arrayTimePoints = strGrandTable.collect( 'timepoint' );
                        Ext.each( arrayTimePoints, function(r, i, p){ p[i] = [ r ]; } );
                        strTimePoint.loadData( arrayTimePoints );
                    }
                },
                cleared: function(){
                    cbTimePoint.clearValue();
                    cbTimePoint.setDisabled( true );
                    btnRun.setDisabled( true );
                },
                select: function(){
                    strGrandTable.filter( 'cohort', this.getValue(), false, true, true );

                    arrayTimePoints = strGrandTable.collect( 'timepoint' );
                    Ext.each( arrayTimePoints, function(r, i, p){ p[i] = [ r ]; } );
                    strTimePoint.loadData( arrayTimePoints );
                }
            },
            store: strCohort,
            valueField: 'cohort',
            width: 240
        });
        strCohort.on( 'load', function(){ cbCohort.setDisabled( false ); } );

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'timepoint',
            emptyText: 'Click...',
            fieldLabel: 'Select a time point',
            listeners: {
                change: function(){
                    if ( this.getValue() == '' ){
                        btnRun.setDisabled( true );
                    } else {
                        strGrandTable.filterBy(
                            function(r){
                                return  r.get( 'cohort' )       == cbCohort.getValue() &&
                                        r.get( 'timepoint' )    == cbTimePoint.getValue();
                            }
                        );

                        var count = strGrandTable.getCount();
                        if ( count == 1 ){
                            btnRun.setDisabled( false );
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
                },
                cleared: function(){
                    btnRun.setDisabled( true );
                },
                select: function(){
                    strGrandTable.filterBy(
                        function(r){
                            return  r.get( 'cohort' )       == cbCohort.getValue() &&
                                    r.get( 'timepoint' )    == cbTimePoint.getValue();
                        }
                    );

                    var count = strGrandTable.getCount();
                    if ( count == 1 ){
                        btnRun.setDisabled( false );
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
            },
            store: strTimePoint,
            valueField: 'timepoint',
            width: 240
        });
        strTimePoint.on( 'load', function(){ cbTimePoint.setDisabled( false ); } );

        var nfFalseDiscoveryRate = new Ext.form.NumberField({
            emptyText: 'Type...',
            fieldLabel: 'False discovery rate threshold',
            height: 22,
            value: 0.02,
            width: 240
        });

        var nfFoldChange = new Ext.form.NumberField({
            emptyText: 'Type...',
            fieldLabel: 'Fold change threshold',
            height: 22,
            value: 0,
            width: 240
        });


        /////////////////////////////////////
        //             Buttons             //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                var r = strGrandTable.getAt( 0 );

                if ( r != undefined ){
                    cnfReport.inputParams = {
                        timePoint:                  cbTimePoint.getValue(),
                        analysisAccession:          r.get( 'analysis_accession' ),
                        expressionMatrixAccession:  r.get( 'expression_matrix_accession' ),
                        fdrThreshold:               nfFalseDiscoveryRate.getValue(),
                        fcThreshold:                nfFoldChange.getValue()
                    };

                    setReportRunning( true );

                    LABKEY.Report.execute( cnfReport );
                } else {
                    LABKEY.ext.HAI_vs_GE_Lib.onFailure({
                        exception: 'The values selected result in an empty set of parameters.'
                    });
                }
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
                cbCohort,
                cbTimePoint,
                nfFalseDiscoveryRate,
                nfFoldChange,
                btnRun
            ],
            layout: {
                labelWidth: 185,
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

