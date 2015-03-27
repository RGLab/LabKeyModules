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

        var strCohort = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                load: function(){
                    if ( this.getCount() > 0 ){
                        cbCohort.setDisabled( false );
                    }

                    decodeParams( window.location.hash, [ cbCohort, cbSignature ] );
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'expression_matrices_cohorts',
            schemaName: 'study'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbCohort = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            disabled: true,
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
            store: strCohort,
            valueField: 'cohort',
            width: fieldWidth
        });

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

        var taImportExport = new Ext.form.TextArea({
            //value: '#Cohort=LAIV group 2008&Modules=Blood transcription'
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

        var tabItems = [
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
                        html: LABKEY.ext.ISCore.contributors,
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
                                  <li><a href="http://www.interactivefigures.com/meni/meni-paper/btm-landing.gsp" target="_blank">Blood transcription</a>: Set of transcription modules in blood.</li>\
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
        ];
        if ( false ){ tabItems.push(
            new Ext.Panel({
                defaults: {
                    autoHeight: true,
                    bodyStyle: 'padding-bottom: 1px;',
                    hideMode: 'offsets'
                },
                items: [
                    taImportExport,
                    {
                        border: false,
                        items: [
                            new Ext.Button({
                                handler: function(){
                                    var hash = taImportExport.getValue();
                                    var ind = hash.indexOf( '#' );
                                    if ( ind >= 0 ){
                                        hash = hash.substring( ind );

                                        decodeParams( hash, [ cbCohort, cbSignature ] );
                                    }
                                },
                                text: 'Import from text',
                                width: 200
                            }),
                            new Ext.Button({
                                handler: function(){
                                    var address = window.location.href;
                                    var hash    = address.indexOf( '#' );
                                    if ( hash >= 0 ){ address = address.substring( 0, hash ); }
                                    taImportExport.setValue( address + '#' + encodeParams( [ cbCohort, cbSignature ] ) );
                                },
                                text: 'Export',
                                width: 200
                            }),
                            new Ext.Button({
                                handler: function(){
                                    taImportExport.setValue( '' );
                                },
                                text: 'Clear',
                                width: 200
                            })
                        ],
                        layout: 'hbox'
                    }
                ],
                layout: 'fit',
                tabTip: 'Import / Export',
                title: 'Import / Export'
            })
        ); }

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
            items: tabItems,
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

        var formParamString = function( el ){
            return el.getValue();
        };

        var encodeParams = function( arrayToProcess ){
            var result = '';
            if ( arrayToProcess.length >= 1 ){
                result += formParamString( arrayToProcess[0] );
            }
            for ( var i = 1; i < arrayToProcess.length ; i ++ ){
                result += '&' + formParamString( arrayToProcess[i] );
            }
            return result;
        };

        var decodeParams = function( hash, els ){
            var arrayToProcess;
            if ( hash && hash.charAt( 0 ) == '#' ){
                hash = hash.substring( 1 );
                arrayToProcess = hash.split( '&' );
                if ( arrayToProcess.length != els.length ){
                    LABKEY.ext.ISCore.onFailure({
                        exception: 'Parsing failure, the number of parameters spcified does not match the number of parameters needed'
                    });
                } else{
                    Ext.each(
                        els,
                        function( e, i ){
                            if ( e.findRecord( e.valueField, arrayToProcess[i] ) ){
                                e.setValue( arrayToProcess[i] );
                            } else{
                                e.clearValue();
                                e.markInvalid( '"' + arrayToProcess[i] + '" in the supplied URL is not a valid value, select from the available choices' );
                            }
                        }
                    );
                    checkBtnRunStatus();
                }
            }
        };

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
            } else{
                checkBtnRunStatus()
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

