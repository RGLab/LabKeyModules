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

        var checkBtnsStatus = function(){
            if (
                cbModules.isValid( true ) &&
                cbCohort.isValid( true )
            ){
                btnRun.setDisabled( false );
            } else {
                btnRun.setDisabled( true );
            }

            if (    cbModules.getValue()    == cbModules.originalValue &&
                    cbCohort.getValue()     == cbCohort.originalValue
            ){
                btnReset.setDisabled( true );
            } else {
                btnReset.setDisabled( false );
            }
        };


        // Help text
        var cohort_help  = 'The cohorts with participants of interest.';
        var modules_help = 'The modules used for grouping genes, currently the following are available:<br><ul><li><a href="http://www.interactivefigures.com/meni/meni-paper/btm-landing.gsp" target="_blank">Blood transcription</a>: Set of transcription modules in blood.</li><li><a href="http://www.broadinstitute.org/gsea/msigdb/collections.jsp" target="_blank">MSigDB c7</a>: Gene sets that represent cell states and perturbations within the immune system.</li><li><a href="http://www.biir.net/public_wikis/module_annotation/G2_Trial_8_Modules" target="_blank">G2 (Trial 8) Modules</a>: Repertoire of co-clustering genes.</li></ul>';


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strCohort = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                load: function(){
                    cbCohort.setDisabled( this.getCount() === 0 );

                    decodeParams( window.location.hash );
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'GSEA_expression_matrices_cohorts',
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
            id: 'cbCohort',
            lazyInit: false,
            listeners: {
                blur: checkBtnsStatus,
                change: function(){
                    if ( ! flagCohortSelect ) {
                        checkBtnsStatus();
                    }
                },
                cleared: checkBtnsStatus,
                focus: function(){
                    flagCohortSelect = false;
                },
                select: function(){
                    flagCohortSelect = true;
                    checkBtnsStatus();
                }
            },
            store: strCohort,
            valueField: 'cohort',
            width: fieldWidth
        });

        var cbModules = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'name',
            fieldLabel: 'Modules',
            id: 'cbModules',
            listeners: {
                change:     checkBtnsStatus,
                cleared:    checkBtnsStatus,
                select:     checkBtnsStatus
            },
            qtipField: 'qtip',
            store: new Ext.data.ArrayStore({
                data: [
                    [ 'Blood transcription', 'Blood transcription', 'Set of transcription modules in blood.' ],
                    [ 'MSigDB c7', 'MSigDB c7', 'Gene sets that represent cell states and perturbations within the immune system.' ],
                    [ 'G2 (Trial 8) Modules', 'G2 (Trial 8) Modules', 'Repertoire of co-clustering genes.' ]
                ],
                fields: [ 'name', 'value', 'qtip' ]
            }),
            value: 'Blood transcription',
            valueField: 'value',
            width: fieldWidth
        });

        
        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                cnfReport.inputParams = {
                    signature:  cbModules.getValue(),
                    cohort:     cbCohort.getValue()
                };

                setReportRunning( true );
                LABKEY.Report.execute( cnfReport );
            },
            text: 'Run'
        });

        var cntShare = new Ext.Container({
            hidden: false, //true,
            html: 
'<a class="labkey-text-link bold-text" style="margin-bottom: 20px;">' +
'<span class="button-icon""><img src="/_images/icon_permalink.png"></span>' +
'Share' + '</a>'
,
            listeners: {
                afterrender: {
                    fn: function(){
                        this.getEl().on( 'click', function(){
                            var address = window.location.href;
                            var hash    = address.indexOf( '#' );
                            if ( hash >= 0 ){ address = address.substring( 0, hash ); }

                            Ext.Msg.show({
                                buttons: { ok: 'Close' },
                                closable : false,
                                fn: null,
                                icon: Ext.Msg.INFO,
                                minWidth: Ext.Msg.minPromptWidth,
                                msg: 'Copy the link to this report:',
                                multiline: false,
                                prompt: true,
                                scope: undefined,
                                title: 'Share',
                                value: address + encodeParams( [ cbCohort, cbModules ] ),
                                width: 300
                            });

                            $('.ext-mb-input').focus(function(){
                                this.select();
                            });
                        });
                    },
                    single: true
                }
            }
        });

        var btnReset = new Ext.Button({
            disabled: true,
            handler: function(){
                cbCohort.reset();
                cbModules.reset();

                cntEmptyPnlView.setVisible( true );
                cntShare.setVisible( false );
                cntReport.setVisible( false );

                checkBtnsStatus();
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
            reportId: 'module:GeneSetEnrichmentAnalysis/GeneSetEnrichmentAnalysis.Rmd',
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
                    if ( LABKEY.ActionURL.getContainer() !== '/Studies' ){ cntShare.setVisible( true ); }
                    cntReport.setVisible( true );

                    $('#res_table_GSEA').dataTable();

                    pnlTabs.setActiveTab( 1 );
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var tlbrButtons = new Ext.Toolbar({
            defaults: {
                style: 'padding-top: 1px; padding-bottom: 1px;',
                width: 45
            },
            enableOverflow: true,
            items: [ btnRun, btnReset ],
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
                new Ext.Container({
                    autoEl: 'a',
                    cls: 'labkey-text-link bold-text',
                    html: 'quick help',
                    listeners: {
                        afterrender: {
                            fn: function(){
                                this.getEl().on( 'click', function(){ LABKEY.help.Tour.show('immport-gsea-tour'); } );
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
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbCohort, 'Cohort', cohort_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbModules, 'Modules', modules_help )
                    ],
                    title: 'Parameters'
                }),
                {
                    border: true,
                    items: [
                        tlbrButtons
                    ],
                    style: 'padding-right: 2px; padding-left: 2px;'
                }
            ],
            labelWidth: 60,
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
                { html: 'tab, select the parameter values and click the \'RUN\' button to generate the report.' },
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
            items: [
                cntEmptyPnlView,
           //     cntShare,
                cntReport
            ],
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
                },
                {
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: '<b>Cohort:</b> ' + cohort_help + '<br><br>' +
                                  '<b>Modules:</b> ' + modules_help,
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'Parameters'
                        }),
                        new Ext.form.FieldSet({
                            html: 'After a run, the <b>View</b> tab will open where the output shows a table of each gene module at each timepoint ranked by P-values and a heatmap of the most enriched gene sets. Use the "Search" at the top right corner of the table to look for the modules shown in the heatmap. The names in the module column are clickable and will open a new tab in the browser to the official description of the module.',
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'View'
                        })
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

        var getParamString = function( el ){
            return el.getValue();
        };

        var encodeParams = function( arrayToProcess ){
            var obj = {};
            Ext.each( arrayToProcess, function( e ){
                obj[ e.getId() ] = getParamString( e );
            });
            return Ext.urlEncode( obj, '#' );
        };

        var decodeParams = function( hash ){
            var toProcess, arrayToProcess, e;
            if ( hash && hash.charAt( 0 ) == '#' && hash.charAt( 1 ) == '&' ){
                toProcess = Ext.urlDecode( hash.substring( 2 ) );
                $.each( toProcess, function( k, v ){
                    e = Ext.getCmp( k );
                    if ( e ){
                        if ( e.findRecord( e.valueField, v ) ){
                            e.setValue( v );
                        } else{
                            e.clearValue();
                            e.markInvalid( '"' + v + '" in the supplied URL is not a valid value, select from the available choices' );
                        }
                    }
                });

                checkBtnsStatus();
                if ( ! btnRun.disabled ){ btnRun.handler(); }
            }
        };

        var setReportRunning = function( bool ){
            if ( bool ){
                maskReport.show();
            } else {
                maskReport.hide();
            }

            Ext.each(
                [
                    cbCohort,
                    cbModules,
                    btnRun,
                    btnReset,
                    cntShare
                ],
                function( e ){ e.setDisabled( bool ); }
            );
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

    listeners: {
        afterrender: GSEATour
    },

    resize: function(){
    }
}); // end GeneSetEnrichmentAnalysis Panel class

