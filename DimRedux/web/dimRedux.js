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

LABKEY.ext.dimRedux = Ext.extend( Ext.Panel, {

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
	        if (
		        cbAssays.isValid( true ) &&
                cbTimePoints.isValid( true ) &&
                rgTime.isValid( true ) &&
		        rgPlotType.isValid( true )
	        ){
		        btnRun.setDisabled( false );
	        } else {
		        btnRun.setDisabled( true );
 	        }

            if (    cbAssays.getValue()              == cbAssays.originalValue &&
                    cbTimePoints.getValue()          == cbTimePoints.originalValue &&
                    rgTime.getValue()                == rgTime.originalValue &&
		            rgPlotType.getValue()            == rgPlotType.originalValue
            ){
                btnReset.setDisabled( true );
            } else {
                btnReset.setDisabled( false );
            }
        };

        //Help strings
	        var
                timeAs_help = 'Using time as an observation allows for the labeling of points with time, not just by subject.',
                assays_help = 'Assays present in the study.',
                timepoints_help = 'The official study time collected value.',
                labels_help = 'Demographic data that can be used to label the scatter plot values from either a PCA or tSNE analysis.',
                plotTypes_help = 'Either Principle Components Analysis (PCA) or t-distributed Stochastic Neighbor Embedding (tSNE)'
                perplexity_help = 'Parameter passed to Rtsne',
                numComponents_help = 'Number of PCA components to plot pairwise',
                impute_help = "Method for imputing missing (NA) values"
            ;

        /////////////////////////////////////
        //           Stores                //
        /////////////////////////////////////

        /*
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'DimRedux_data_sets',
            success: function(data){
                data.rows.forEach( function(row){
                    if(strTimePoints.byTP[row.Timepoint] == null){
                        strTimePoints.byTP[row.Timepoint] = [row.Name];
                    }else{
                        strTimePoints.byTP[row.Timepoint].push(row.Name);
                    }
                });
                strTimePoints.load();       
            },
            failure: function(errorInfo, options, responseObj){

            }
        });
        */

        var strTimePoints = {
            load: function(){
                var tp = Object.keys(strTimePoints.byTP);
                
                //Order chronologically and account for hours / days
                var hrs = [],
                    days = [];
                tp.forEach( function(x){
                    if(x.match("Days") != null){
                        days.push(Number(x.match(/\d+/)[0]));
                    }else{
                        hrs.push(Number(x.match(/\d+/)[0]));
                    }
                });
                hrs = hrs.sort(function(a,b){ return(a-b) });
                hrs = hrs.map( function(i){ return i + " Hours" });
                days = days.sort(function(a,b){ return(a-b) });
                days = days.map( function(i){ return i + " Days" });
                var allTP = hrs.concat(days);
                
                // Push to store
                allTP.forEach( function(z){
                    strTimePoints.values.push([z,z])
                });
                var tpStore = new Ext.data.SimpleStore({
                    data: strTimePoints.values,
                    id: 0,
                    fields: ['display', 'values']
                });
                cbTimePoints.bindStore(tpStore);
            },
            values: [],
            byTP: {}
        };

        LABKEY.Query.selectRows({                                                               
            schemaName: 'study',
            queryName: 'DimRedux_data_sets',
            success: function(data){
                data.rows.forEach( function(row){
                    if(strTimePoints.byTP[row.Timepoint] == null){
                        strTimePoints.byTP[row.Timepoint] = [row.Name];
                    }else{
                        strTimePoints.byTP[row.Timepoint].push(row.Name);
                    }   
                }); 
                strTimePoints.load();           
            },  
            failure: function(errorInfo, options, responseObj){

            }   
        }); 

        
        var strVar = new Ext.data.SimpleStore({
            data:[
                ['Age', 'age_reported'],
                ['Race', 'race'],
                ['Ethnicity', 'ethnicity'],
                ['Gender', 'gender']
            ],
            id: 0,
            fields: ['display', 'values']
        });

        var strObs = new Ext.data.SimpleStore({
            data:[
                ['Age', 'age_reported'],
                ['Race', 'race'],
                ['Ethnicity', 'ethnicity'],
                ['Gender', 'gender'],
                ['Time', 'time']
            ],
            id: 0,
            fields: ['display', 'values']
        });


        /////////////////////////////////////
        ///      Check and ComboBoxes     ///
        /////////////////////////////////////
        
        var cbLabel = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'display',
            fieldLabel: 'Label',
            lazyInit: false,
            listeners: {
                select: function(){
                    $('#'+cntReport.id).html(reportHolder[cbLabel.getValue()]);
                }
            },  
            store: strVar,
            value: 'age_reported', 
            valueField: 'values',
            width: fieldWidth,
            cls: 'ui-test-labels'
        }); 

        var rgTime = new Ext.form.RadioGroup({
            allowBlank: false,
            fieldLabel: 'Use Time As',
            width: fieldWidth,
            columns: 2,
            items: [
                {
                    boxLabel: 'Variable',
                    checked: true,
                    inputValue: 'Variable',
                    name: 'Time',
                    value: 'variable'
                },{
                    boxLabel: 'Observation',
                    inputValue: 'Observation',
                    name: 'Time',
                    value: 'observation'

                }        
            ],
            value: 'Variable',
            listeners: {
                blur:       checkBtnsStatus,
                change:     function(){
                    // force new selection of timepoints and assays because
                    // assay options are affected by timeAs
                    cbTimePoints.disable();
                    cbTimePoints.clearValue();
                    cbTimePoints.enable();

                    cbAssays.disable();
                    cbAssays.clearValue();
                    cbAssays.store.removeAll();
                    cbAssays.enable();

                    cbLabel.clearValue();
                    cblabel.store.removeAll();
                    if(rgTime.getValue().value == 'observation'){
                        cbLabel.bindStore(strObs);
                    }else{
                        cbLabel.bindStore(strVar);
                    }
                }
            },
            cls: 'ui-test-timebox'

        });
        
        var cbAssays = new Ext.ux.form.ExtendedLovCombo({
            allowBlank: false,
            displayField: 'display',
            fieldLabel: 'Assays',
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
            separator: ',', // IMPORTANT FOR STRSPLIT FN
            store: new Ext.data.SimpleStore({data: [], id: 0, fields: [] }),
            valueField: 'value',
            width: fieldWidth,
            cls: 'ui-test-assays'
        });

        var cbTimePoints = new Ext.ux.form.ExtendedLovCombo({
            allowBlank: false,
            displayField: 'display',
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
                    cbAssays.store.removeAll();
                    var assays = []; 
                    var tps = cbTimePoints.getValue();
                    tps = tps.split(",");
                    tps.forEach( function(y){
                        assays.push(strTimePoints.byTP[y]);
                    });
                    assays = [].concat.apply([], assays);
                    if( rgTime.getValue().value == "variable" ){ 
                        // Allow all assays that have any of the timepoints
                        assays = assays.filter( function(el, i, arr){
                            return arr.indexOf(el) === i;
                        });
                    } else {
                        // Ensure only assays with all timepoints are allowed
                        var counts = {};
                        assays.forEach( function(el){
                            counts[el] = counts[el] ? counts[el] + 1 : 1;
                        });
                        var keys = Object.keys(counts);
                        assays = keys.filter(function(key){ 
                            return counts[key] == tps.length 
                        }) 
                    } 
                    var preStore = []; 
                    assays.forEach( function(z){
                        preStore.push([z,z]);
                    }); 
                    var assayStore = new Ext.data.SimpleStore({
                        data: preStore,
                        id: 0,
                        fields: ['display','value']
                    }); 
                    cbAssays.bindStore(assayStore);
                    cbAssays.enable();
                    checkBtnsStatus();
                }
            },
            separator: ',', // IMPORTANT FOR STRSPLIT FN
            store: new Ext.data.SimpleStore({data: [], id: 0, fields: []}),
            valueField: 'values',
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
                        nmNumComponents.disable();
                        nmPerplexity.enable();
                    }else{
                        nmNumComponents.enable();
                        nmPerplexity.disable();
                    }
                    checkBtnsStatus;
                },
            },
            cls: 'ui-test-plottypes'
        });
        
        var nmPerplexity = new Ext.form.NumberField({
            allowBlank: false,
            fieldLabel: 'tSNE - Perplexity',
            width: fieldWidth,
            value: 5,
            maxValue: 50,
            minValue: 1,
            hidden: false,
            disabled: true
        });

        var nmNumComponents = new Ext.form.NumberField({
            allowBlank: false,
            fieldLabel: 'PCA - Components to Show',
            width: fieldWidth,
            value: 2,
            maxValue: 6, 
            minValue: 2,
            hidden: false
        }); 


        var rgImpute = new Ext.form.RadioGroup({
            allowBlank: false,
            fieldLabel: 'Missing Value Imputation Method',
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
            value: 'Mean',
            listeners: {
                blur:       checkBtnsStatus,
                change:     checkBtnsStatus
            },  
            cls: 'ui-test-impute'
        }); 

        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////
        
        var srcScripts = ""

        var reportHolder = {
            age_reported: null,
            ethnicity: null,
            gender: null,
            race: null
        };

        var lbls = [
                    'age_reported',
                    'ethnicity',
                    'gender',
                    'race'
                    ]
        
        var btnRun = new Ext.Button({
            disabled: true,
            handler: function(){
                setReportRunning( true );

                if( rgTime.getValue().value == 'observation'){
                    lbls.push('time');
                    reportHolder['time'] = null;
                }

                
                    inputParams = { 
                        baseUrl:                LABKEY.ActionURL.getBaseURL(),
                        folderPath:             LABKEY.ActionURL.getContainer(),
                        timeAs:                 rgTime.getValue().value,
                        assays:                 cbAssays.getValue(),
                        timePts:                cbTimePoints.getValue(),
                        label:                  lbls[0],
                        plotType:               rgPlotType.getValue().value,
                        perplexity:             nmPerplexity.getValue(),
                        numComponents:          nmNumComponents.getValue(),
                        impute:                 rgImpute.getValue().value
                    }; 
                    makeReport(inputParams);
                
            },
            text: 'Run'
        });

        var btnReset = new Ext.Button({
            disabled: true,
            handler: function(){
                Ext.each(
                    [
                        rgTime,
                        cbAssays,
                        cbTimePoints,
                        cbLabel,
                        rgPlotType
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
                    cbAssays,
                    cbTimePoints,
                    //cbLabel,
                    rgPlotType,
                    tlbrBtns
                ],
                function( e ){ e.setDisabled( bool ); }
            );
        };        
        
        var makeReport = function(inputParams){
            cnfReport.inputParams = inputParams;
            LABKEY.Report.execute( cnfReport );        
    
        }

        var cnfReport = {
            failure: function( errorInfo, options, responseObj ){
                setReportRunning( false );

                LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:DimRedux/study/dimRedux.Rmd',
            success: function( result ){
                setReportRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if ( errors && errors.length > 0 ){
                    LABKEY.ext.ISCore.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    // Create one copy of source files and trim from plot html 
                    // to avoid long load times when changing plots.
                    var htmlValue = outputParams[0].value;

                    if( cnfReport.inputParams.label == 'age_reported'){
                        srcScripts = htmlValue.match(/style>(?:\s|\S)+head>/g, "style>\n</head"); 
                        srcScripts = srcScripts[0].replace(/style>\n\s/g, "");
                        srcScripts = srcScripts.replace(/<.head>/g, "");
                    }

                    htmlValue = htmlValue.replace(/style>(?:\s|\S)+head>/g, "style>\n</h    ead");                   
                    reportHolder[cnfReport.inputParams.label] = htmlValue;

                    // Determine if other reports left to run
                    var repKeys = Object.keys(reportHolder);
                    var repsLeft = repKeys.filter( function(key){
                        return(reportHolder[key] == null)
                    });
                    
                    // Run next report or show view tab if all done
                    // When showing view tab, inject srcScripts once into
                    // the auto-generated moduleView.
                    if( repsLeft.length == 0 ){
                        $('#'+cntEmptyPnlView.id).html(srcScripts);
                        $('#'+cntReport.id).html(reportHolder['age_reported']);
                        cntEmptyPnlView.setVisible( false );
                        cntReport.setVisible( true );

                        pnlTabs.setActiveTab( 1 );
                        window.HTMLWidgets.staticRender();
                    } else {
                        cnfReport.inputParams.label = repsLeft[0]
                        makeReport(cnfReport.inputParams);
                    }                    
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

        var
            cfTimePoints        = LABKEY.ext.ISCore.factoryTooltipWrapper( cbTimePoints, 'Time point', timepoints_help )//,
           // cfLabel             = LABKEY.ext.ISCore.factoryTooltipWrapper( cbLabel, 'Label', labels_help )
        ;

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
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbLabel, 'Label', labels_help)
                    ],
                    title: 'Display Options',
                    cls: 'ui-test-display-options'
                }),
                cntReport ],
            layout: 'fit',
            tabTip: 'View',
            title: 'View'
        });


        var fsAdditionalOptions = new Ext.form.FieldSet({
            autoScroll: true,
            collapsed: true,
            collapsible: true,
            items: [
                LABKEY.ext.ISCore.factoryTooltipWrapper( nmPerplexity, 'tSNE perplexity', perplexity_help ),
                LABKEY.ext.ISCore.factoryTooltipWrapper( nmNumComponents, 'PCA components to plot', numComponents_help ),
                LABKEY.ext.ISCore.factoryTooltipWrapper( rgImpute, 'Impute', impute_help)
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
            cls: 'ui-test-additional-options'
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
                        LABKEY.ext.ISCore.factoryTooltipWrapper( rgTime, 'Time Usage', timeAs_help),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbTimePoints, 'Timepoints', timepoints_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbAssays, 'Assays', assays_help ),
                       // LABKEY.ext.ISCore.factoryTooltipWrapper( cbLabel, 'Label', labels_help ), 
                        LABKEY.ext.ISCore.factoryTooltipWrapper( rgPlotType, 'Plot Type', plotTypes_help ),


                    ],
                    title: 'Parameters',
                    cls: 'ui-test-parameters'
                }),
                fsAdditionalOptions,
                {
                    border: true,
                    items: [
                        tlbrBtns
                    ]
                }
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
                        reportId: 'module:DimRedux/reports/schemas/study/dimRedux.Rmd',
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

        LABKEY.ext.dimRedux.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end DimRedux Panel class

