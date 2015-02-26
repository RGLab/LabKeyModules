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

LABKEY.ext.GeneSetEnrichmentAnalysis = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
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
                loadexception: LABKEY.ext.ISCore.onFailure
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
                    [ 'Blood transcription', 'Blood transcription' ],
                    [ 'MSigDB c7', 'MSigDB c7' ],
                    [ 'G2 (Trial 8) Modules', 'G2 (Trial 8) Modules' ]
                ],
                fields: [ 'name', 'name' ]
            }),
            value: 'Blood transcription',
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

                LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:GeneSetEnrichmentAnalysis/GeneSetEnrichmentAnalysis.Rmd',
            success: function( result ){
                setReportRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    LABKEY.ext.ISCore.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    var p = outputParams[0];

                    pnlView.update(p.value);

                    $('#res_table_GSEA').dataTable();

                    pnlTabs.setActiveTab(1);
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var tlbrRun = new Ext.Toolbar({
            border: true,
            defaults: {
                style: 'padding-top: 1px; padding-bottom: 1px;'
            },
            disabled: true,
            enableOverflow: true,
            items: [ btnRun ],
            style: 'padding-right: 2px; padding-left: 2px;'
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
                {
                    border: false,
                    defaults: {
                        border: false
                    },
                    items: [
                        { html: 'For information and help on how to use the Gene Set Enrichment Analysis module, click the' },
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
                        cbCohort,
                        cbSignature
                    ],
                    title: 'Parameters'
                }),
                new Ext.Panel({
                    border: true,
                    items: [
                        tlbrRun
                    ],
                    style: 'padding-right: 2px; padding-left: 2px;'
                })
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
            items: {
                border: false,
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
                    { html: 'tab, select the parameter values and click the \'RUN\' button to generate the report' },
                ],
                layout: 'hbox'
            },
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
                new Ext.Panel({
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: 'This module can be used to perform a gene set enrichment analysis across time (or across a prespecified contrast) within a specified cohort. ',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: 'The gene set enrichment analysis is performed using the CAMERA method of the <a href="http://www.bioconductor.org/packages/release/bioc/html/limma.html" target="_blank">Limma</a> R package.',
                            style: 'margin-top: 5px;',
                            title: 'Details'
                        }),
                        new Ext.form.FieldSet({
                            html: LABKEY.ext.ISCore.Contributors,
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'Contributors'
                        })
                    ],
                    layout: 'fit',
                    tabTip: 'About',
                    title: 'About'
                }),
                new Ext.Panel({
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: '<b>Cohort:</b> The cohorts with subjects of interest<br><br>\
                                   <b>Modules:</b> The modules used for grouping genes, currently the following modules are available:<br><ul>\
                                      <li><a href="http://www.immuneprofiling.org/meni/meni-paper/btm-landing.gsp" target="_blank">Blood transcription</a>: Set of transcription modules in blood.</li>\
                                      <li><a href="http://www.broadinstitute.org/gsea/msigdb/collections.jsp" target="_blank">MSigDB c7</a>: Gene sets that represent cell states and perturbations within the immune system.</li>\
                                      <li><a href="http://www.biir.net/public_wikis/module_annotation/G2_Trial_8_Modules" target="_blank">G2 (Trial 8) Modules</a>: Repertoire of co-clustering genes.</li>\
                                   </ul>',
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'Parameters'
                        })
                    ],
                    layout: 'fit',
                    tabTip: 'Help',
                    title: 'Help'
                })

            ],
            layoutOnTabChange: true,
            listeners: {
                afterrender: {
                    fn: function(){
                        maskReport = new Ext.LoadMask(
                            this.getEl(),
                            {
                                msg: 'Generating the plot...',
                                msgCls: 'mask-loading'
                            }
                        );
                    },
                    single: true
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
                    null,
                    {
                        reportId: 'module:GeneSetEnrichmentAnalysis/reports/schemas/GeneSetEnrichmentAnalysis.Rmd',
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

        LABKEY.ext.GeneSetEnrichmentAnalysis.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end GeneSetEnrichmentAnalysis Panel class

