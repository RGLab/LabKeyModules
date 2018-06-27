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

LABKEY.ext.LogRes = Ext.extend( Ext.Panel, {

    // config is expected only to include a 'webPartDivId'
    // for use in the jQuery component
    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me                          = this,
            maskReport                  = undefined,
            fieldWidth                  = 250,
            labelWidth                  = 200,
            flagAssay                   = undefined
            ;

        var checkBtnsStatus = function(){
            if ( cbIrp.isValid( true ) ){
                btnRun.setDisabled( false );
            } else {
                btnRun.setDisabled( true );
            }

            if (cbIrp.getValue() == cbIrp.originalValue){
                btnReset.setDisabled( true );
            } else {
                btnReset.setDisabled( false );
            }
        };

        //Help strings
        var 
            irp_help = 'Using time as an observation allows for the labeling of points with time, not just by subject.',
            transform_help = "help here"
         ;

        /////////////////////////////////////
        //           Stores                //
        /////////////////////////////////////
        
        var strIrp = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'logRes_irpAssays',
            autoLoad: true
        })

        var strTransform = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'LogRes_assayDates',
            listeners: {
                onLoad: function(){
                    // based on assay selection look at whether there are multiple dates
                    var dates = [];
                    this.data.rows.forEach(function(row){
                        if(row.Label == cbIrp.getValue() && row.study_time_collected_unit){
                            dates.push(row.study_time_collected);
                        }
                    })
                    
                    // if multiple dates then all for fc or mfc, else just none
                    if(dates.length() > 1 && dates.contains('0')){
                        var txOps = [
                                ['Modified Fold Change', 'mfc'],
                                ['Fold Change', 'fc'],
                                ['None', 'none']
                              ]
                    }else{
                        var txOps = [ ['None', 'none'] ]
                    }

                    var tmpStore = Ext.data.SimpleStore({
                        data: txOps,
                        id: 0,
                        fields: ['Name', 'Value']
                    });

                    cbTransform.bindStore(tmpStore);
                }
            },
            autoLoad: false
        })
        

        /////////////////////////////////////
        ///      Check and ComboBoxes     ///
        /////////////////////////////////////
        
        var cbIrp = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'Label',
            fieldLabel: 'Assays',
            lazyInit: false,
            disabled: false,
            listeners: {
                change:     function(){
                    checkBtnsStatus();
                },
                cleared:    function(){
                    checkBtnsStatus();
                },
                select:     function(){
                    cbTransform.enable();
                    checkBtnsStatus();
                }
            },
            store: strIrp,
            valueField: 'Name',
            width: fieldWidth,
            listWidth: fieldWidth,
            cls: 'ui-test-irp'
        });

        var cbTransform = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'Label',
            fieldLabel: 'Transformation Method',
            lazyInit: false,
            disabled: true,
            listeners: {
                change:     function(){
                    checkBtnsStatus();
                },
                cleared:    function(){
                    checkBtnsStatus();
                },
                select:     function(){
                    checkBtnsStatus();
                }
            },
            store: strTransform,
            valueField: 'Name',
            width: fieldWidth,
            listWidth: fieldWidth,
            cls: 'ui-test-transform'
        });


        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////
        
        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                setReportRunning( true );

                if( rgTime.getValue().value == 'observation'){
                    lbls.push('time');
                    reportHolder['time'] = null;
                }
                    // Run Report 
                    inputParams = { 
                        baseUrl:                LABKEY.ActionURL.getBaseURL(),
                        folderPath:             LABKEY.ActionURL.getContainer(),
                        irp:                    cbAssays.getValue(),
                        transform:              cbTransform.getValue(), 
                    }; 
                    cnfReport.inputParams = inputParams;
                    LABKEY.Report.execute( cnfReport );    
            },
            text: 'Run'
        });

        var btnReset = new Ext.Button({
            disabled: true,
            handler: function(){
                Ext.each(
                    [
                        cbIrp,
                        cbTransform
                    ],
                    function( e ){ e.reset(); }
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
        
        var setReportRunning = function( bool ){
            if ( bool ){
                maskReport.show();
            } else {
                maskReport.hide();
            }
            // disable btns during report run
            Ext.each(
                [
                    cbIrp,
                    cbTransform
                ],
                function( e ){ e.setDisabled( bool ); }
            );
        };        
            
        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                setReportRunning( false );

                LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:LogRes/study/logRes.Rmd',
            success: function( result ){

                var errors = result.errors;
                var outputParams = result.outputParams;

                if ( errors && errors.length > 0 ){
                    setReportRunning( false );
                    
                    // Trim to expected errors with useful info for user
                    errors = errors[0].match(/R Report Error(?:\s|\S)+/g);

                    // If unexpected R Report Error fail gracefully
                    if( errors == null){
                        errors = ["\nUnexpected Error in R Markdown Report. Please notify an adminstrator."]
                    }
                    LABKEY.ext.ISCore.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    $('#'+cntReport.id).html(outputParams[0].value);
                        
                    setReportRunning( false ); // Wait until all html is loaded

                    cntEmptyPnlView.setVisible( false );
                    cntReport.setVisible( true );

                    pnlTabs.setActiveTab( 1 );
                    window.HTMLWidgets.staticRender();                    
                }
            }
        };

        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var tlbrBtns = new Ext.Toolbar({
            defaults: {
                width: 45
            },
            enableOverflow: true,
            items: [
                btnRun,
                btnReset
            ]
        });

        // var pnlInputs
        var cntEmptyPnlView = new Ext.Container({
            defaults: {
                border: false
            },
            items: [
                { html: 'Switch to the' },
                new Ext.Container({
                    autoEl: {
                        href: '#',
                        tag: 'a'
                    },
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
            items: [ 
                cntEmptyPnlView, 
                cntReport ],
            layout: 'fit',
            tabTip: 'View',
            title: 'View'
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
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbIrp, 'Immune Response', irp_help),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbTransform, 'Transformation Method', transform_help )
                    ],
                    title: 'Parameters',
                    cls: 'ui-test-parameters'
                })
            ],
            labelWidth: labelWidth,
            tabTip: 'Input',
            title: 'Input'
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
                            html: 'This module can be used to automatically run a generalized linear model regression to assess whether demographic data can predict immune response.',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: 'Text about transformation method resources here.',
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
        
        //jquery related
        $('#' + config.webPartDivId)
            .parents('.panel-body')
            .prev()
            .find('.labkey-wp-title-text')
            .wrap(
                '<a href=\'' +
                LABKEY.ActionURL.buildURL(
                    'reports',
                    'runReport',
                    null,
                    {
                        reportId: 'module:LogRes/reports/schemas/study/logRes.Rmd',
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

        LABKEY.ext.LogRes.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end LogRes Panel class
