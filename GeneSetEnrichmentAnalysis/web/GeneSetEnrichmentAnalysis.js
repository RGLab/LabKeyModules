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

LABKEY.ext.GeneSetEnrichmentAnalysis = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var description         = '<br>This module can be used to perform a gene set enrichment analysis across time (or across a prespecified contrast) within a specified cohort. It uses the CAMERA method of the <a href="http://www.bioconductor.org/packages/release/bioc/html/limma.html" target="_blank">Limma</a> R package for performing gene set enrichment analysis.<br><br>'
            me                  = this,
            maskReport          = undefined,
            fieldWidth          = 240,
            flagCohortSelect    = undefined
            ;

        var checkBtnRunStatus = function(){
            if (
                cbSignature.isValid( true ) &&
                cbCohort.isValid( true )
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
                loadexception: LABKEY.ext.GeneSetEnrichmentAnalysis_Lib.onFailure
            },
            queryName: 'expression_matrices_cohorts',
            schemaName: 'study'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbSignature = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'name',
            fieldLabel: 'Modules',
            listeners: {
                change:     checkBtnRunStatus,
                cleared:    checkBtnRunStatus,
                select:     checkBtnRunStatus
            },
            store: new Ext.data.ArrayStore({
                data: [
                    [ 'MSigDB c7', 'MSigDB c7' ],
                    [ 'Blood transcript', 'Blood transcript' ],
                    [ 'Baylor', 'Baylor' ]
                ],
                fields: [ 'name', 'name' ]
            }),
            valueField: 'name',
            width: fieldWidth
        });

        var cbCohort = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'cohort',
            fieldLabel: 'Cohort',
            lazyInit: false,
            listeners: {
                change: function(){
                    if ( ! flagCohortSelect ) {
                        handleCohortSelection();
                    }
                },
                cleared: function(){
                    btnRun.setDisabled( true );
                },
                focus: function(){
                    flagCohortSelect = false;
                },
                select: function(){
                    flagCohortSelect = true;

                    handleCohortSelection();
                }
            },
            store: strCohortTraining,
            valueField: 'cohort',
            width: fieldWidth
        });


        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                cnfReport.inputParams = {
                    signature:  cbSignature.getValue(),
                    cohort:     cbCohort.getValue()
                };

                setReportRunning( true );
                LABKEY.Report.execute( cnfReport );
            },
            text: 'Run'
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                setReportRunning( false );

                LABKEY.ext.GeneSetEnrichmentAnalysis_Lib.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:GeneSetEnrichmentAnalysis/GeneSetEnrichmentAnalysis.Rmd',
            success: function( result ){
                setReportRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    LABKEY.ext.GeneSetEnrichmentAnalysis_Lib.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    var p = outputParams[0];

                    pnlView.update(p.value);

                    $('#res_table').dataTable();

                    pnlTabs.setActiveTab(1);
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var pnlInput = new Ext.form.FormPanel({
            bodyStyle: { paddingTop: '1px' },
            defaults: {
                autoHeight: true,
                forceLayout: true,
                hideMode: 'offsets'
            },
            deferredRender: false,
            items: [
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        cbCohort,
                        cbSignature
                    ],
                    title: 'Parameters'
                }),
                btnRun
            ],
            labelWidth: 100,
            tabTip: 'Input',
            title: 'Input'
        });

        var pnlView = new Ext.Panel({
            bodyStyle: 'padding: 1px;',
            defaults: {
                autoHeight: true,
                hideMode: 'offsets'
            },
            html: 'Switch to the \'Input\' tab, select the parameter values and click the \'RUN\' button to generate the report',
            layout: 'fit',
            tabTip: 'View',
            title: 'View'
        });

        var pnlTabs = new Ext.TabPanel({
            activeTab: 0,
            autoHeight: true,
            defaults: {
                autoHeight: true,
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
                new Ext.Panel({
                    bodyStyle: 'padding: 1px;',
                    defaults: {
                        autoHeight: true,
                        hideMode: 'offsets'
                    },
                    html: description,
                    layout: 'fit',
                    tabTip: 'About',
                    title: 'About'
                }),
                new Ext.Panel({
                    bodyStyle: 'padding: 1px;',
                    defaults: {
                        autoHeight: true,
                        hideMode: 'offsets'
                    },
                    html: '<br><b>Cohort:</b> The cohort with the subjects of interest<br><br><b>Module:</b> The gene sets to be used for the analysis<br><br>',
                    layout: 'fit',
                    tabTip: 'Help',
                    title: 'Help'
                })

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
        };

        var handleCohortSelection = function(){
            if ( cbCohort.getValue() == '' ){
                btnRun.setDisabled( true );
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
                        reportId: 'module:GeneSetEnrichmentAnalysis/reports/schemas/GeneSetEnrichmentAnalysis.Rmd',
                        tabId: 'Source'
                    }
                ) +
                '\' target=\'_blank\' title=\'Click to open the knitr source code in a new window\'></a>'
            );

        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'geneSetEnrichmentAnalysis';
        this.frame          = false;
        this.items          = pnlTabs;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.GeneSetEnrichmentAnalysis.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end GeneSetEnrichmentAnalysis Panel class

