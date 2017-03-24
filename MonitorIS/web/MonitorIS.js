Ext.namespace('LABKEY.ext');

LABKEY.ext.MonitorIS = Ext.extend( Ext.Panel, {

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
        // Help strings
        var plotType_help = 'The type of plot: barplots and line are available.'

        // Stores
        var strPlotType = new Ext.data.ArrayStore({
            data: [
                [ 'Barplot', 'bar' ],
                [ 'Lineplot', 'line' ]
            ],
            fields: [ 'display', 'value' ]
        });
        var strByTime = new Ext.data.ArrayStore({
            data: [
                [ 'Day', 'day' ],
                [ 'Week', 'week' ],
                [ 'Month', 'month' ],
                [ 'Year', 'year' ]
            ],
            fields: [ 'display', 'value']
        });

        // Dropdown
        var cbPlotType = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'display',
            fieldLabel: 'Plot type',
            id: 'cbPlotType',
            lazyInit: false,
            store: strPlotType,
            value: 'bar',
            valueField: 'value',
            width: fieldWidth
        });
        var startDate = new Ext.form.DateField({
            fieldLabel: 'From',
            width: fieldWidth
        });
        var endDate = new Ext.form.DateField({
            fieldLabel: 'To',
            width: fieldWidth,
            value: new Date()
        });
        var byTime = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'display',
            fieldLabel: 'By',
            id: 'byTime',
            lazyInit: false,
            store: strByTime,
            value: 'day',
            valueField: 'value',
            width: fieldWidth
        });

        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnRun = new Ext.Button({
            disabled: false,
            handler: function(){
                cnfReport.inputParams = {
                    plotType: cbPlotType.getValue(),
                    from: startDate.getValue(),
                    to: endDate.getValue(),
                    by: byTime.getValue()
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
            reportId: 'module:MonitorIS/MonitorIS.Rmd',
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

                    pnlTabs.setActiveTab( 1 );
                    
                    window.HTMLWidgets.staticRender();
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
                //Info message at the top
                {
                    bodyStyle: 'padding-top: 10px;',
                    border: false,
                    defaults: {
                        border: false
                    },
                    items: [
                        { html: 'For information and help on how to use the Monitor module, click the' },
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
                //Fields
                new Ext.form.FieldSet({
                    items: [
                        startDate,
                        endDate,
                        LABKEY.ext.ISCore.factoryTooltipWrapper(cbPlotType, 'Plot type', plotType_help),
                        byTime
                    ],
                    title: 'Parameters'
                }),
                //Run buttonbar
                {
                    border: true,
                    items: [
                        tlbrButtons
                    ],
                    style: 'padding-right: 2px; padding-left: 2px;'
                }
            ],
            labelWidth: 50,
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
            items: [ cntEmptyPnlView, cntReport ],
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
                            html: 'This module can be used by program managers to monitor the usage of ImmuneSpace. ',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: 'MonitorIS uses <a href="https://cran.r-project.org/web/packages/RGoogleAnalytics/index.html" target="_blank">RGoogleAnalytics</a> and LabKey monitoring tools to query usage statistics.',
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
                    items: [
                       new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: '<b></b> ' + plotType_help + '<br><br>',
                            style: 'margin-bottom: 2px; margin-top: 5px;',
                            title: 'Parameters'
                        }),
                        new Ext.form.FieldSet({
                            html: 'After a run, the <b>View</b> tab will open where the output shows plots of the number of new users and number of logins for the selected period.',
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
                    cbPlotType,
                    startDate,
                    endDate,
                    byTime,
                    btnRun
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
                        reportId: 'module:MonitorIS/reports/schemas/MonitorIS.Rmd',
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

        LABKEY.ext.MonitorIS.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end MonitorIS Panel class

