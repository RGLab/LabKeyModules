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

LABKEY.ext.DimensionReduction = Ext.extend( Ext.Panel, {

    // config is expected only to include a 'webPartDivId'
    // for use in the jQuery component
    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me                          = this,
            maskReport                  = undefined,
            fieldWidth                  = 300,
            labelWidth                  = 250,
            flagAssay                   = undefined
            ;


        ////////////////////////////////////////////////////
        ///  inputItems Created after Data is Loaded     ///
        ////////////////////////////////////////////////////
        var renderInputElements = function( strAssays, gridPnl, tpsDbl){

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
                        cbAssays,
                        cbTimePoints,
                        rgPlotType,
                        tlbrBtns
                    ],
                    function( e ){ e.setDisabled( bool ); }
                );
            };

            var cnfReport = {
                failure: function( errorInfo, options, responseObj ){
                    setReportRunning( false );

                    LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
                },
                reportId: 'module:DimensionReduction/DimensionReduction.Rmd',
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
            
            var checkBtnsStatus = function(){
                if (
                    cbAssays.isValid( true ) &&
                    cbTimePoints.isValid( true ) &&
                    rgAggregate.isValid( true ) &&
                    rgPlotType.isValid( true ) &&
                    currPidCnt != 0

                ){
                    btnRun.setDisabled( false );
                } else {
                    btnRun.setDisabled( true );
                }

                if (    cbAssays.getValue()              == cbAssays.originalValue &&
                        cbTimePoints.getValue()          == cbTimePoints.originalValue &&
                        rgAggregate.getValue()           == rgAggregate.originalValue &&
                        rgPlotType.getValue()            == rgPlotType.originalValue
                ){
                    btnReset.setDisabled( true );
                } else {
                    btnReset.setDisabled( false );
                }
            };

            //Help strings
            var
                aggregate_help = 'Aggregating by subject-timepoint allows for the labeling of points with time, not just by subject.',
                assays_help = 'Assays present in the study.',
                timepoints_help = 'The official study time collected value.',
                labels_help = 'Demographic data that can be used to label the scatter plot values from either a PCA or tSNE analysis.',
                plotTypes_help = 'Either Principle Components Analysis (PCA) or t-distributed Stochastic Neighbor Embedding (tSNE)'
                perplexity_help = 'Parameter passed to Rtsne',
                numComponents_help = 'Number of PCA components to plot pairwise',
                impute_help = "Method for imputing missing (NA) values within a single feature in an assay",
                response_help = "Immune response data that can be used for labels if present"
            ;

            /////////////////////////////////////
            //    Buttons and Radio Groups     //
            /////////////////////////////////////
        
            var btnRun = new Ext.Button({
                disabled: true,
                handler: function(){
                    setReportRunning( true );

                    // Run Report
                    inputParams = {
        
                        // Non-User Selected Params - url and path injected via report engine
                        //baseUrl:                LABKEY.ActionURL.getBaseURL(),
                        //folderPath:             LABKEY.ActionURL.getContainer(),
                        filteredPids:           filteredPids.join(";"),

                        // User Selected Main Params
                        aggregateBy:              rgAggregate.getValue().value,
                        assays:                 cbAssays.getValue(),
                        timePts:                cbTimePoints.getValue(),
                        plotType:               rgPlotType.getValue().value,
                        
                        // User Selected Additional Options
                        perplexity:             nmPerplexity.getValue(),
                        numComponents:          nmNumComponents.getValue(),
                        impute:                 rgImpute.getValue().value,
                        responseVar:            rgResponse.getValue().value
                    };
                    cnfReport.inputParams = inputParams;
                    LABKEY.Report.execute( cnfReport );
                },
                text: 'Run',
                cls: 'ui-test-run'
            });

            var btnReset = new Ext.Button({
                disabled: true,
                handler: function(){
                    Ext.each(
                        [
                            rgAggregate,
                            cbAssays,
                            cbTimePoints,
                            rgPlotType
                        ],
                        function( e ){ e.reset(); }
                    );

                    cntEmptyPnlView.setVisible( true );
                    cntReport.setVisible( false );

                    checkBtnsStatus();

                    fsAdditionalOptions.collapse();
                },
                text: 'Reset',
                cls: 'ui-test-reset'
            });

            var rgAggregate = new Ext.form.RadioGroup({
                allowBlank: false,
                fieldLabel: 'Aggregate By',
                width: fieldWidth,
                columns: 2,
                items: [
                    {
                        boxLabel: 'Subject',
                        checked: true,
                        inputValue: 'Subject',
                        name: 'Aggregate',
                        value: 'subject'
                    },{
                        boxLabel: 'Subject-Timepoint',
                        inputValue: 'Subject-Timepoint',
                        name: 'Aggregate',
                        value: 'subject-tp'

                    }        
                ],
                value: 'Subject',
                listeners: {
                    blur:       checkBtnsStatus,
                    change:     function(){
                        // force new selection of timepoints and assays because
                        // assay options are affected by aggregateBy
                        cbTimePoints.disable();
                        cbTimePoints.clearValue();
                        cbTimePoints.enable();

                        cbAssays.disable();
                        cbAssays.clearValue();
                    }
                },
                cls: 'ui-test-timebox'

            });

            // To ensure filtering from cbTimepoints works, need following:
            // 1. lastQuery - defaults to not reloading if query is same
            // 2. beforequery listener - defaults to true means reset
            // 3. other listeners - need to handle timepoint selection each
            // time or resets to original store
            var cbAssays = new Ext.ux.form.ExtendedLovCombo({
                allowBlank: false,
                displayField: 'Label',
                fieldLabel: 'Assays',
                lazyInit: false,
                disabled: true,
                listeners: {
                    focus:      function(){
                        handleTpSelect();
                    },
                    change:     function(){
                        handleTpSelect();
                        checkBtnsStatus();
                    },
                    cleared:    function(){
                        handleTpSelect();
                        checkBtnsStatus();
                    },
                    select:     function(){
                        handleAssaySelect();
                        handleTpSelect();
                        checkBtnsStatus();
                    },
                    beforequery: function(qe){
                        qe.combo.onLoad(); // Loads store with current filter applied
                        return false; // Stops store from resetting to unfiltered
                    }
                },
                separator: ',', // IMPORTANT FOR STRSPLIT FN
                store: strAssays,
                valueField: 'Name',
                width: fieldWidth,
                listWidth: fieldWidth,
                lastQuery: '', // If lastQuery is left as default then does not reload
                cls: 'ui-test-assays'
            });

            var handleTpSelect = function(){
                var tpsSelected = cbTimePoints.getValue().split(",");
                cbAssays.store.filterBy( function(record){
                    var tpsAvailable = record.data.Timepoints.split(";");
                    var intersect = tpsAvailable.filter( function(val){
                        return( tpsSelected.indexOf(val) !== -1) ;
                    });
                    var subtp = rgAggregate.getValue().value == 'subject-tp';
                    if( (!subtp & intersect.length > 0) | (subtp & intersect.length == tpsSelected.length) ){
                        return(true)
                    }
                });
            }

            // Selection of assay causes the subject/feature counter to update
            var handleAssaySelect = function(){
                var tps = cbTimePoints.getValue().split(",");
                var assays = cbAssays.getValue().split(",");
                
                var assayIdx = cbAssays.getCheckedArrayInds();
                var tpsIdx = cbTimePoints.getCheckedArrayInds();
                
                // count equals all viable assay * timepoint combinations for selection
                var cnt = 0;
                assayIdx.forEach( function(a){
                    tpsIdx.forEach( function(t){
                        cnt =  gridData[a][t + 1] != "" ? cnt + 1 : cnt
                    });
                });

                // put new filter on store for assays and time points
                strAssayData.filterBy( function(record){
                    return( tps.includes(record.data.Timepoint) & assays.includes(record.data.Name) ) 
                });
                
                // calculate subs and features
                // get unique set of pids
                var pids = strAssayData.collect("ParticipantId");
                
                // Group by participantId and get subject and feature data
                var dat = strAssayData.data.items;   
                var sumByPid = [];
                pids.forEach( function(el){
                    // get data for just pid
                    var filtDat = dat.filter( function(rec){ return(rec.data.ParticipantId == el) });
        
                    // sum features
                    var feats = []
                    filtDat.forEach( function(rec){ feats.push(rec.data.Features) })
                    var sum = feats.reduce((a,b) => a + b, 0)

                    // return rows aka count of assays
                    sumByPid.push({ sum: sum, count: filtDat.length, pid: el})
                });
                
                // Filter down to pids with all assay * timepoint combinations
                sumByPid = sumByPid.filter( function(rec){ return(rec.count == cnt) });
                
                // Generate new html for counter with correct sub and feature values
                // Note: when subs are 0 length then maxFeatures will be NaN
                currPidCnt = sumByPid.length
                var maxFeatures = currPidCnt == 0 ? 0 : Math.max( ...Ext.pluck(sumByPid, "sum") );

                var titleHtml = '<b>Count of subjects and features to be analyzed based on selections:</b><br>'
                var subjectsHtml = "<p><i>Subjects: </i>" + currPidCnt;  
                var featuresHtml = "    <i>Features: </i>" + maxFeatures + "</p>";
                jQuery( '#tpAssayCounter')[0].innerHTML = titleHtml + subjectsHtml + featuresHtml;
            }

            var cbTimePoints = new Ext.ux.form.ExtendedLovCombo({
                allowBlank: false,
                displayField: 'timepoint',
                fieldLabel: 'Assay Timepoints',
                lazyInit: false,
                disabled: false,
                listeners: {
                    change:     function(){
                        checkBtnsStatus();
                    },
                    cleared:    function(){
                        cbAssays.disable();
                        cbAssays.reset();
                        checkBtnsStatus();
                    },
                    select:     function(){
                        cbAssays.disable();
                        cbAssays.clearValue();
                        handleTpSelect();
                        cbAssays.enable();
                    }
                },
                separator: ',', // IMPORTANT FOR STRSPLIT FN
                store: new Ext.data.SimpleStore({
                    id: 0,
                    fields: ['timepoint', 'timepoint'],
                    data: tpsDbl                                                                                                                                                                                        
                }),
                valueField: 'timepoint',
                width: fieldWidth,
                cls: 'ui-test-timepoints'
            });
            
            var rgPlotType = new Ext.form.RadioGroup({
                allowBlank: false,
                fieldLabel: 'Plot type',
                width: fieldWidth,
                columns: 2,
                items: [
                    {
                        boxLabel: 'PCA',
                        checked: true,
                        inputValue: 'PCA',
                        name: 'plotType',
                        value: 'PCA'
                    },{
                        boxLabel: 'tSNE',
                        inputValue: 'tSNE',
                        name: 'plotType',
                        value: 'tSNE'
                    }
                ],
                value: 'PCA',
                listeners: {
                    blur:       checkBtnsStatus,
                    change:     function(){
                        if(this.getValue().value == "tSNE"){
                            nmPerplexity.enable();
                        }else{
                            nmPerplexity.disable();
                        }
                        checkBtnsStatus;
                    },
                },
                cls: 'ui-test-plottype'
            });
            
            var nmPerplexity = new Ext.form.NumberField({
                allowBlank: false,
                fieldLabel: 'tSNE - Perplexity',
                width: fieldWidth,
                value: 5,
                maxValue: 50,
                minValue: 1,
                hidden: false,
                disabled: true,
                cls: 'ui-test-perplexity'
            });

            var nmNumComponents = new Ext.form.NumberField({
                allowBlank: false,
                fieldLabel: 'Components to Plot',
                width: fieldWidth,
                value: 2,
                maxValue: 6, 
                minValue: 2,
                hidden: false,
                cls: 'ui-test-components'
            }); 

            var rgImpute = new Ext.form.RadioGroup({
                allowBlank: false,
                fieldLabel: 'Missing Value Imputation',
                width: fieldWidth,
                columns: 2,
                items: [
                    {   
                        boxLabel: 'Mean',
                        checked: true,
                        inputValue: 'Mean',
                        name: 'Impute',
                        value: 'mean'
                    },{ 
                        boxLabel: 'Median',
                        inputValue: 'Median',
                        name: 'Impute',
                        value: 'median'
                    },{   
                        boxLabel: 'KNN',
                        inputValue: 'KNN',
                        name: 'Impute',
                        value: 'knn'
                    },{ 
                        boxLabel: 'None',
                        inputValue: 'None',
                        name: 'Impute',
                        value: 'none'
                    } 
                ],  
                value: 'None',
                listeners: {
                    blur:       checkBtnsStatus,
                    change:     checkBtnsStatus
                },  
                cls: 'ui-test-impute'
            }); 

            var rgResponse = new Ext.form.RadioGroup({
                allowBlank: false,
                fieldLabel: 'Immune Response Label',
                width: fieldWidth,
                columns: 2,
                items: [
                    { 
                        boxLabel: 'HAI',
                        checked: true,
                        inputValue: 'HAI',
                        name: 'Response',
                        value: 'hai'
                    },{
                        boxLabel: 'NAb',
                        inputValue: 'NAb',
                        name: 'Response',
                        value: 'neut_ab_titer'
                    }
                ],
                value: 'HAI',
                listeners: {
                    blur:       checkBtnsStatus,
                    change:     checkBtnsStatus
                },
                cls: 'ui-test-response'
            });

            /*var
                cfTimePoints = LABKEY.ext.ISCore.factoryTooltipWrapper( cbTimePoints, 'Time point', timepoints_help )
            ;*/

            var fsAdditionalOptions = new Ext.form.FieldSet({
                autoScroll: true,
                collapsed: true,
                collapsible: true,
                items: [
                    LABKEY.ext.ISCore.factoryTooltipWrapper( nmPerplexity, 'tSNE perplexity', perplexity_help ),
                    LABKEY.ext.ISCore.factoryTooltipWrapper( nmNumComponents, 'PCA components to plot', numComponents_help ),
                    LABKEY.ext.ISCore.factoryTooltipWrapper( rgImpute, 'Impute', impute_help),
                    LABKEY.ext.ISCore.factoryTooltipWrapper( rgResponse, 'Response', response_help)
                ],
                labelWidth: labelWidth,
                listeners: {
                    afterrender: {
                        fn: function(){
                            this.on( 'collapse', checkBtnsStatus );
                        },
                        single: true
                    },
                    expand: checkBtnsStatus
                },
                title: 'Additional options',
                titleCollapse: true,
                cls: 'ui-test-additional-options',
                itemCls: 'ui-test-additional-options-item'
            });

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

            var inputItems =  [
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        new Ext.Container({
                            border: false,
                            items: [],
                            layout: 'fit',
                            id: 'tpAssayHeader',
                            cls: 'ui-test-assayheader',
                            html: '<p><b>Note:</b> Each cell shows subjects / features available for that assay at the specified timepoint</p><br>'
                        }),
                        new Ext.Container({
                            border: false,
                            items: gridPnl, 
                            layout: 'fit',
                            id: 'tpAssayGrid',
                            cls: 'ui-test-assaygrid'
                        }),
                        new Ext.Container({
                            border: false,
                            items: [], 
                            layout: 'fit',
                            id: 'tpAssayCounter',
                            cls: 'ui-test-assaycounter',
                            html: '<b>Count of subjects and features to be analyzed based on selections: </b><br>'  
                        }),         
                    ],
                    title: 'Available Assay Data',
                    cls: 'ui-test-available-data',
                    itemCls: 'ui-test-available-data-item'
                }),
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        LABKEY.ext.ISCore.factoryTooltipWrapper( rgAggregate, 'Aggregating', aggregate_help),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbTimePoints, 'Timepoints', timepoints_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbAssays, 'Assays', assays_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( rgPlotType, 'Plot Type', plotTypes_help ),
                    ],
                    title: 'Parameters',
                    cls: 'ui-test-parameters',
                    itemCls: 'ui-test-parameters-item'
                }),
                fsAdditionalOptions,
                {
                    border: true,
                    items: [
                        tlbrBtns
                    ]
                }
            ]

            pnlInput.removeAll();
            pnlInput.add(inputItems);
            pnlInput.doLayout();
        }
        

        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        // ----- pnlInput temporary holder onLoad ----- 
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
                    border: false,
                    items: [], 
                    layout: 'fit',
                    id: 'loadingBanner',
                    cls: 'ui-test-loading-banner',
                    html: '<p><b>Meta-data is loading and may take a couple of minutes. Thank you for your patience!</b></p>'
                }),  
            ],
            labelWidth: labelWidth,
            tabTip: 'Input',
            title: 'Input',
            cls: 'ui-test-input'
        });

        // ----- pnlView elements ------
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
            title: 'View',
            cls: 'ui-test-view'
        });

        // --- pnlTabs Main UI element on load ----
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
                            html: 'This module can be used to automatically run a PCA or tSNE dimension reduction analysis on selected study assay data and represent the resulting points with demographic-based labels for determining possible QC/QA concerns.',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: 'Text about PCA and tSNE resources here.',
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
                    title: 'About',
                    cls: 'ui-test-about'
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
                        reportId: 'module:DimensionReduction/reports/schemas/study/DimensionReduction.Rmd',
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

        LABKEY.ext.DimensionReduction.superclass.constructor.apply(this, arguments);
    
        /////////////////////////////////////
        //    Stores and Grid Data         //
        /////////////////////////////////////
        
        /* Doing this last because queries take 30 to 40 seconds and 
        want to load inputItems only when all data is ready. Also, important
        to generate lov combo boxes with full store so selectAllRecord is not
        undefined, which can happen when initializing with empty store and then
        binding a new store.*/

        // -------- Grid and Store Setup -------------
        var gridCols = [{
            header: '<b>Label</b>',
            dataIndex: 'Label',
            width: 120
        }];

        var gridFields = ['Label'];
        var gridData = [];

        var uniqLbls = [];
        var uniqTps = [];

        var strAssaysLoaded = false;
        var strAssayDataLoaded = false;

        var filteredPids = [];
        var currPidCnt = 0;

        // --------- Callback --------------
        var checkQueries = function(){
            var gridPnl = new Ext.grid.GridPanel({
                store: new Ext.data.SimpleStore({
                    id: 0,
                    data: gridData,
                    fields: gridFields
                }),
                columns: gridCols,
                forceFit: false,
                overflowX: true,
                //width: do not use, messes up scroll.
                height: (uniqLbls.length + 1) * 30,
                columnLines: true,
                frame: false,
                cls: 'custom-grid'
             });


            if( gridData.length > 0 & strAssaysLoaded == true & strAssayDataLoaded == true){
                
                // Generate TimePoints store here because via query bogged down
                var tpsDbl = [];
                uniqTps.forEach( function(el){
                    tpsDbl.push([el,el])
                })

                renderInputElements( strAssays, gridPnl, tpsDbl );
            }
        }

        // ---------- Stores ---------------

        var strAssays = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'DimRedux_assay_by_timepoints',
            autoLoad: true,
            listeners: {
                load: function(){
                    strAssaysLoaded = true;
                    checkQueries();
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            }
        })

        var strAssayData = new LABKEY.ext.Store({
            schemaName: 'study',
            queryName: 'DimRedux_assay_data_computed',
            autoLoad: true,
            listeners: {
                load: function(){
                    strAssayDataLoaded = true;
                    filteredPids = this.collect("ParticipantId");
                    checkQueries();
                },      
                loadexception: LABKEY.ext.ISCore.onFailure
            }       
        })          

        // ------ Grid Helper Fn ------------

        // Get unique values from array
        var getUniq = function(arry){
            var uniqArry = arry.filter( function( el, i, arr){
                return( arr.indexOf(el) === i );
            })
            return(uniqArry)
        }

        // Get timepoints by study time collected unit 
        var getTpsByStcu = function(arry, stcu){
            var filteredVals = arry.filter( function( el, i, arr){
                return( el.includes(stcu) );
            });
            return(filteredVals)
        }

        // Correctly order timepoint array by number but with stcu added back
        var orderByTp = function(arry, stcu){
            var digits = [];
            arry.forEach( function(el){
                 digits.push(parseFloat(el.match(/(-|)\d+/)[0]));
            });

            // order numeric array ascending
            digits = digits.sort(function(a, b){ return a - b;});

            var ordered = [];
            digits.forEach( function(el){
                 ordered.push(el + " " + stcu);
            });

            return(ordered)
        }

        // ------- Fill in Grid --------------

        // Fill in gridData to show timepoints present
        // for each assay

        new LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'DimRedux_assay_data_gathered',
            success: function(data){


                // Get timepoint vals for grid colnames and order correctly
                // NOTE: must remove any decimal value timepoints
                // or json parser errors on unexpected numerical literal
                var tps = Ext.pluck( data.rows, "timepoint");
                uniqTps = getUniq(tps);

                uniqTps = uniqTps.filter(function(x){
                    return( x.match('\\.') == null )
                })

                var days = getTpsByStcu( uniqTps, "Days" );
                days = orderByTp(days, "Days");

                var hours = getTpsByStcu( uniqTps, "Hours" );
                hours = orderByTp(hours, "Hours");

                uniqTps = hours.concat(days);

                // Get assay label values for grid rownames
                // Note uniqLbls is global b/c needed in checkQueries
                // to render correctly.
                var lbls = Ext.pluck( data.rows, "Label");
                uniqLbls = getUniq(lbls);

                // Fill grid
                uniqLbls.forEach( function(lbl){
                    var rowArr = [lbl];
                    uniqTps.forEach( function(tp){
                        rowArr.push('');
                    });
                    gridData.push(rowArr);
                });

                uniqTps.forEach( function(tp){
                    gridCols.push({
                        header: "<b>" + tp + "</b>",
                        dataIndex: tp,
                        width: 90
                    });
                    gridFields.push(tp);
                });

                // Update gridData where tp present
                data.rows.forEach(function(row){
                    // ignore decimal timepoints b/c json parser error
                    if(row.timepoint.match('\\.') == null){
                        // get gridData row of assay
                        var lblIdx = uniqLbls.indexOf(row.Label);
                        var tpIdx = uniqTps.indexOf(row.timepoint);
                        // change corresponding tp value
                        gridData[lblIdx][tpIdx + 1] = [row.subjects, "/", row.features].join(' '); // +1 b/c label first
                    }
                });
                checkQueries();
            }
        })
    }, // end constructor

    resize: function(){
    }
}); // end DimRedux Panel class


