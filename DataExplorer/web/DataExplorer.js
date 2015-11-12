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

LABKEY.ext.DataExplorer = Ext.extend( Ext.Panel, {
    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me              = this,
            qwpDataset      = undefined,
            dataregion      = undefined,
            maskPlot        = undefined,
            numVars         = undefined,
            reportSessionId = undefined,
            schemaName      = undefined,
            fieldWidth      = 330,
            labelWidth      = 170,
            tableToVarMap   = {
                'hai': 'virus_strain',
                'neut_ab_titer': 'virus_strain',
                'mbaa': 'analyte',
                'elisa': 'analyte',
                'elispot': 'analyte',
                'pcr': 'entrez_gene_id',
                'fcs_analyzed_result': 'population_name_reported',
                'gene_expression_analysis_results': 'gene_symbol'
            }
        ;

        var manageAdditionalOptions = function(){
            cntPlotMessage.update( '' );
            cntPlot.update( '<div style=\'height: 10px\'></div>' );

            var plotType = cbPlotType.getValue();
            if ( plotType == '' ){
                Ext.each(
                    [
                        cfTextSize,
                        cfAnnotation,
                        cfFacet,
                        cfColor,
                        cfShape,
                        cfSize,
                        cfAlpha,
                        cfAspectRatio
                    ],
                    function( e ){ e.setVisible( false ); }
                );
            } else if ( plotType == 'auto' ){
                Ext.each(
                    [
                        cfAnnotation,
                        cfFacet,
                        cfColor,
                        cfShape,
                        cfSize,
                        cfAlpha
                    ],
                    function( e ){ e.setVisible( false ); }
                );
                cfTextSize.setVisible( true );
                cfAspectRatio.setVisible( true );

                Ext.each(
                    [
                        cbAnnotation,
                        cbColor,
                        cbShape,
                        cbSize,
                        cbAlpha
                    ],
                    function( e ){ e.reset(); }
                );
            } else if ( plotType == 'heatmap' ){
                Ext.each(
                    [
                        cfFacet,
                        cfColor,
                        cfShape,
                        cfSize,
                        cfAlpha
                    ],
                    function( e ){ e.setVisible( false ); }
                );
                cfTextSize.setVisible( true );
                cfAnnotation.setVisible( true );
                cfAspectRatio.setVisible( true );
            } else {
                 Ext.each(
                    [
                        cfTextSize,
                        cfFacet,
                        cfColor,
                        cfShape,
                        cfSize,
                        cfAlpha,
                        cfAspectRatio
                    ],
                    function( e ){ e.setVisible( true ); }
                );
                cfAnnotation.setVisible( false );
            }

            checkBtnsStatus();
            fsAdditionalOptions.doLayout();
        };

        var onRender = function(){
            var dataset = cbDataset.getValue();

            dataregion = qwpDataset.getDataRegion();

            LABKEY.Query.selectDistinctRows({
                column: dataset == 'gene_expression_analysis_results' ? 'analysis_accession/arm_name' : 'arm_accession',
                failure: LABKEY.ext.ISCore.onFailure,
                filterArray: dataregion.getUserFilterArray(),
                queryName: dataset,
                schemaName: schemaName,
                success: function( cohorts ){
                    LABKEY.Query.selectDistinctRows({
                        column: tableToVarMap[ dataset ],
                        failure: LABKEY.ext.ISCore.onFailure,
                        filterArray: dataregion.getUserFilterArray(),
                        queryName: dataset,
                        schemaName: schemaName,
                        success: function( variables ){
                            var numRows = dataregion.totalRows;

                            numVars = variables.values.length;

                            cmpStatus.update(
                                Ext.util.Format.plural( numRows, 'data point' ) + 
                                ' across ' + Ext.util.Format.plural( cohorts.values.length, 'cohort' ) +
                                ' and ' + Ext.util.Format.plural( numVars, 'variable' ) +
                                ( numRows == '1' ? ' is ' : ' are ' ) + 'selected' 
                            );

                            checkBtnsStatus();
                        }
                    });
                }
            });

            $('.labkey-data-region-wrap').doubleScroll();
        };

        var loadDataset = function( params ){
            var
                dataset = cbDataset.getValue(),
                filters = [],
                viewName = dataset == 'gene_expression_analysis_results' ? 'DGEAR' : undefined
            ;

            schemaName = dataset == 'gene_expression_analysis_results' ? 'gene_expression' : 'study';

            if ( params.dataset ){
                var
                    viewName = params.view,
                    ar, cn, ft
                ;

                schemaName = params.schema;

                $.each( params, function( k, v ){
                    ar = k.split( '~' );
                    if ( ar.length == 2 ){

                        ft = LABKEY.Filter.getFilterTypeForURLSuffix( ar[1] );
                        cn = ar[0];

                        if ( ft && cn.substring( 0, 6 ) == 'query.' ){
                            filters.push( LABKEY.Filter.create( cn.substring( 6 ), v, ft ) );
                        }
                    }
                });
            }

            cntPlotMessage.update( '' );
            cntPlot.update( '<div style=\'height: 10px\'></div>' );

            if ( dataset !== '' ){
                if (
                    qwpDataset == undefined ||
                    ( qwpDataset != undefined && qwpDataset.queryName != dataset )
                ){
                    tlbrButtons.setDisabled( true );
                    cmpStatus.update( '' );

                    LABKEY.DataRegions = {};
                    qwpDataset = new LABKEY.QueryWebPart({
                        //bodyClass: 'dataset-body',
                        buttonBar: {
                            items:[
                                LABKEY.QueryWebPart.standardButtons.exportRows,
                                LABKEY.QueryWebPart.standardButtons.pageSize
                            ],
                            position: 'top',
                            showUpdateColumn: false
                        },
                        frame: 'none',
                        queryName: dataset,
                        removeableFilters: filters,
                        schemaName: schemaName,
                        viewName: viewName
                    });

                    me.qwpDataset = qwpDataset;

                    cntEmptyPnlData.setVisible( false );
                    cntDataset.setVisible( true );

                    qwpDataset.on( 'render', onRender );
                    qwpDataset.render( cntDataset.getEl() );
                }

                cfShowStrains.setVisible( dataset == 'hai' || dataset == 'neut_ab_titer' );
            } else {
                cmpStatus.update( '' );
                numVars = undefined;

                qwpDataset = undefined;

                me.qwpDataset = qwpDataset;

                cntEmptyPnlData.setVisible( true );
                cntDataset.setVisible( false );

                checkBtnsStatus();
            }
        };
            
        var checkBtnsStatus = function(){
            if (
                cbDataset.getValue() !== '' &&
                cbPlotType.getValue() !== '' &&
                spnrTextSize.isValid( true ) &&
                spnrHorizontal.isValid( true ) &&
                spnrVertical.isValid( true ) &&
                qwpDataset &&
                qwpDataset.getDataRegion().totalRows
            ){
                btnPlot.setDisabled( false );
                cmpStatus.setDisabled( false );
            } else {
                btnPlot.setDisabled( true );
                cmpStatus.setDisabled( true );
            }

            if (    cbDataset.getValue()        == cbDataset.originalValue &&
                    cbPlotType.getValue()       == cbPlotType.originalValue &&
                    chNormalize.getValue()      == chNormalize.originalValue &&
                    spnrTextSize.getValue()     == spnrTextSize.originalValue &&
                    cbAnnotation.getValue()     == cbAnnotation.originalValue &&
                    cbColor.getValue()          == cbColor.originalValue &&
                    cbShape.getValue()          == cbShape.originalValue &&
                    cbSize.getValue()           == cbSize.originalValue &&
                    cbAlpha.getValue()          == cbAlpha.originalValue &&
                    spnrHorizontal.getValue()   == spnrHorizontal.originalValue &&
                    spnrVertical.getValue()     == spnrVertical.originalValue &&
                    rgFacet.getValue().getGroupValue() == rgFacet.initialConfig.value &&
                    fsAdditionalOptions.collapsed
            ){
                btnReset.setDisabled( true );
            } else {
                btnReset.setDisabled( false );
            }
        };

        // Help strings
        var dataset_help        = 'Select an assay type to visualize. The selected data can be filtered using the grid view under the "Data" tab.';
        var plottype_help       = 'Five different types are available: "Boxplot", "Violin plots", "Lines", "Heatmap", and "Auto". "Auto" is the default, in which case the module determines the best plot type for your data.';
        var normalize_help      = 'Should the data be normalized to baseline (i.e. subtract the day 0 response after log transformation), or simply plot the un-normalized data.';
        var strains_help        = 'For HAI and neutralizing antibody titer experiments, by default the response is expressed as the average titer fold-change for all virus strains. When this option is enabled, the strains are used for facetting.';

        var textsize_help       = 'The size of all the text elements in the plot (including axes, legend, and labels).';
        var annotation_help     = 'Add a row of annotation based on the demographic data. Applicable to the "Heatmap" plot type only, which does not have the other options.';
        var facet_help          = 'The plot will facet by cohorts on the y axis and genes on the x axis. "grid" mode - the scales are consistent for a selected response and a cohort. "wrap" mode - the scales are free. Use "wrap" if you observe empty spaces in the plots.';
        var shape_help          = 'The shape of the data points.';
        var color_help          = 'The color of the data points ("Age" is selected by default).';
        var size_help           = 'The size of the data points.';
        var alpha_help          = 'The transparency of the data points.';
        var aspectratio_help    = 'The ratio of width to height of the plot.';

        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strDataset;

        var populateStore = function( outputArray ){
            outputArray.sort();
            strDataset = new Ext.data.ArrayStore({
                data: outputArray,
                fields: [ 'Label', 'Name' ]
            });

            cbDataset.bindStore( strDataset );
            cbDataset.resizeToFitContent();

            if ( strDataset.getCount() == 0 ){
                componentsSetDisabled( true );
                pnlTabs.getEl().mask(
                    'No data are available for visualization in this study ' +
                    '(e.g. derived or processed immunological data).</br>' +
                    'If you think this is an error, please, post a message on ' + LABKEY.ext.ISCore.supportLink,
                    'infoMask'
                );
            } else {
                cbDataset.setDisabled( false );

                var
                    params,
                    valueToSet,
                    search = window.location.search
                ;

                if ( search && search.charAt( 0 ) == '?' ){
                    params = Ext.urlDecode( search.substring( 1 ) );
                    valueToSet = params.dataset;
                    if ( valueToSet ){
                        if ( cbDataset.findRecord( cbDataset.valueField, valueToSet ) ){
                            cbDataset.setValue( valueToSet );
                            loadDataset( params );
                        } else{
                            cbDataset.clearValue();
                            cbDataset.markInvalid( '"' + valueToSet + '" in the supplied URL is not a valid value, select from the available choices' );
                        }
                    }
                }
            }
        };
       
        var processDataSets = function( inputArray, outputArray ){
            var flags = [];

            Ext.each( inputArray, function( curEl ){
                var
                    curLabel = curEl.Label,
                    curName = curEl.Name
                ;

                LABKEY.Query.executeSql({
                    failure: function(){
                        flags.push( 1 );
                        if ( flags.length == inputArray.length ){
                            populateStore( outputArray );
                        }
                    },
                    sql: 'SELECT COUNT(*) AS Number FROM ' + curName,
                    schemaName: curName == 'gene_expression_analysis_results' ? 'gene_expression' : 'study',
                    containerFilter: 'CurrentAndSubfolders',
                    success: function( d ){
                        if ( d.rows[0].Number != 0 ){
                            outputArray.push( [ curLabel, curName ] );
                        }

                        flags.push( 0 );
                        if ( flags.length == inputArray.length ){
                            populateStore( outputArray );
                        }
                    }
                });
            });
        };

        LABKEY.Query.selectRows({
            queryName: 'data_sets',
            schemaName: 'study',
            success: function( d ){
                LABKEY.Query.getQueryDetails({
                    failure: function(){
                        processDataSets( d.rows, [] );
                    },
                    queryName: 'gene_expression_analysis_results',
                    schemaName: 'gene_expression',
                    success: function(){
                        var inputArray = d.rows;
                        inputArray.push( { Label: 'Gene expression' , Name: 'gene_expression_analysis_results' } );
                        processDataSets( inputArray, [] );

                    }
                });

            }
        });

        var strPlotType = new Ext.data.ArrayStore({
            data: [
                [ 'Auto', 'auto' ],
                [ 'Boxplot', 'boxplot' ],
                [ 'Violin plot', 'violin' ],
                [ 'Heatmap', 'heatmap' ],
                [ 'Lineplot', 'line' ]
            ],
            fields: [ 'display', 'value' ]
        });

        var strShape = new Ext.data.ArrayStore({
            data: [
                [ 'Gender', 'Gender' ],
                [ 'Race', 'Race' ]
            ],
            fields: [ 'name', 'value' ]
        });

        var strDemographics = new Ext.data.ArrayStore({
            data: [
                [ 'Age', 'Age' ],
                [ 'Gender', 'Gender' ],
                [ 'Race', 'Race' ]
            ],
            fields: [ 'name', 'value' ]
        });


        /////////////////////////////////////
        //      Session instanciation      //
        /////////////////////////////////////

        LABKEY.Report.getSessions({
            success: function( responseObj ){
                var i, array = responseObj.reportSessions, length = array.length;
                for ( i = 0; i < length; i ++ ){
                    if ( array[i].clientContext == 'DataExplorer' ){
                        reportSessionId = array[i].reportSessionId;
                        i = length;
                    }
                }
                if ( i == length ){
                    LABKEY.Report.createSession({
                        clientContext : 'DataExplorer',
                        failure: LABKEY.ext.ISCore.onFailure,
                        success: function(data){
                            reportSessionId = data.reportSessionId;
                        }
                    });
                }
            }
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbDataset = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            disabled: true,
            displayField: 'Label',
            fieldLabel: 'Dataset',
            lazyInit: false,
            listeners: {
                change:     loadDataset,
                cleared:    loadDataset,
                select:     loadDataset
            },
            store: strDataset,
            valueField: 'Name',
            width: fieldWidth
        });

        var cbPlotType = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'display',
            fieldLabel: 'Plot type',
            lazyInit: false,
            listeners: {
                change:     manageAdditionalOptions,
                cleared:    manageAdditionalOptions,
                select:     manageAdditionalOptions
            },
            store: strPlotType,
            value: 'auto',
            valueField: 'value',
            width: fieldWidth
        });

        var cbAnnotation = new Ext.ux.form.ExtendedLovCombo({
            displayField: 'name',
            fieldLabel: 'Annotation',
            lazyInit: false,
            store: strDemographics,
            value: [ 'Age' ].join( this.separator ),
            valueField: 'value',
            width: fieldWidth
        });

        var cbColor = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Color',
            lazyInit: false,
            store: strDemographics,
            value: 'Age',
            valueField: 'value',
            width: fieldWidth
       });

       var cbShape = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Shape',
            lazyInit: false,
            store: strShape,
            valueField: 'value',
            width: fieldWidth
        });

        var cbSize = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Size',
            lazyInit: false,
            store: strDemographics,
            valueField: 'value',
            width: fieldWidth
        });

        var cbAlpha = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Alpha',
            lazyInit: false,
            store: strDemographics,
            valueField: 'value',
            width: fieldWidth
        });


        ///////////////////////////////////////
        // Buttons, Radio Groups, Checkboxes //
        ///////////////////////////////////////

        var chNormalize = new Ext.form.Checkbox({
            fieldLabel: 'Normalize to baseline',
            width: fieldWidth
        });

        var chShowStrains = new Ext.form.Checkbox({
            fieldLabel: 'Show individual virus strains',
            width: fieldWidth
        })

        var spnrTextSize = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            allowDecimals: false,
            fieldLabel: 'Text size',
            listeners: {
                afterrender: {
                    fn: function(){
                        this.on( 'valid', checkBtnsStatus );
                    },
                    single: true
                },
                invalid: checkBtnsStatus
            },
            maxValue: 30,
            minValue: 0,
            value: 18,
            width: fieldWidth
        });

        var rgFacet = new Ext.Panel({
            border: false,
            clearInvalid: Ext.emptyFn,
            defaults: {
                border: false,
                flex: 1,
                layout: 'fit'
            },
            eachItem: function( fn, scope ){
                if ( this.items && this.items.each ){
                    this.items.each( function(e){
                        if ( e.items && e.items.each && e.items.length == 1 ){
                            e.items.each( fn, scope || this );
                        }
                    });
                }
            },
            fieldLabel: 'Facet',
            getValue: Ext.form.RadioGroup.prototype.getValue,
            items: [
                { items:
                    new Ext.form.Radio({
                        boxLabel: 'grid',
                        checked: true,
                        inputValue: 'Grid',
                        name: 'facet',
                        value: 'Grid'
                    })
                },
                { items:
                    new Ext.form.Radio({
                        boxLabel: 'wrap',
                        inputValue: 'Wrap',
                        name: 'facet',
                        value: 'Wrap'
                    })
                }
            ],
            layout: 'hbox',
            onDisable: Ext.form.RadioGroup.prototype.onDisable,
            onEnable: Ext.form.RadioGroup.prototype.onEnable,
            reset: Ext.form.RadioGroup.prototype.reset,
            value: 'Grid',
            width: fieldWidth
        });

        var btnPlot = new Ext.Button({
            disabled: true,
            handler: function(){
                var
                    threshold,
                    plotType = cbPlotType.getValue()
                ;

                if ( plotType == 'auto' ){
                    if ( numVars > 10 ){
                        plotType = 'heatmap';
                    } else {
                        plotType = 'boxplot';
                    }
                }

                if ( plotType == 'heatmap' ){
                    threshold = 100; 
                } else {
                    threshold = 10;
                }

                if ( numVars > threshold ){
                    Ext.Msg.show({
                        title: 'Proceed?',
                        closable: false,
                        msg:    'You chose ' + numVars + ' variables to plot.<br />' +
                                'This may take longer than you expect.<br />' +
                                'You can subset the data by filtering the grid in the "Data" tab.<br />' +
                                'Would you still like to proceed?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.WARNING,
                        fn: function(btn){
                            if (btn === 'no'){
                                return;
                            } else {
                                renderPlot();
                            }    
                        }    
                    });  
                }  else {
                    renderPlot();
                }
            },
            text: 'Plot'
        });

        var btnReset = new Ext.Button({
            disabled: true,
            handler: function(){
                Ext.each(
                    [
                        cbDataset,
                        cbPlotType,
                        chNormalize,
                        chShowStrains,
                        spnrTextSize,
                        cbAnnotation,
                        rgFacet,
                        cbColor,
                        cbShape,
                        cbSize,
                        cbAlpha,
                        spnrHorizontal,
                        spnrVertical
                    ],
                    function( e ){ e.reset(); }
                );

                cfShowStrains.setVisible( false );
                manageAdditionalOptions();  // Hide options
                loadDataset( '' );          // Clear the Data tab

                checkBtnsStatus();

                fsAdditionalOptions.collapse();
            },
            text: 'Reset'
        });

        var dfHorizontal = new Ext.form.DisplayField({
            style: 'padding-right: 10px;',
            value: 'horizontal'
        });

        var spnrHorizontal = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            listeners: {
                afterrender: {
                    fn: function(){
                        this.on( 'valid', checkBtnsStatus );
                    },
                    single: true
                },
                invalid: checkBtnsStatus
            },
            maxValue: 10,
            minValue: 1,
            value: 2,
            width: 40
        });

        var dfVertical = new Ext.form.DisplayField({
            style: 'padding-right: 10px;',
            value: 'vertical'
        });

        var spnrVertical = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            listeners: {
                afterrender: {
                    fn: function(){
                        this.on( 'valid', checkBtnsStatus );
                    },
                    single: true
                },
                invalid: checkBtnsStatus
            },
            maxValue: 10,
            minValue: 1,
            value: 1,
            width: 40
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var resizableImage;

        var cnfPlot = {
            failure: function( errorInfo, options, responseObj ){
                setPlotRunning( false );

                LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:DataExplorer/Plot.R',
            success: function( result ){
                setPlotRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    if ( errors[0].indexOf('The report session is invalid') < 0 ){

                        LABKEY.ext.ISCore.onFailure({
                            exception: errors.join('\n')
                        });
                    } else {
                        LABKEY.Report.createSession({
                            clientContext : 'DataExplorer',
                            failure: LABKEY.ext.ISCore.onFailure,
                            success: function(data){
                                reportSessionId = data.reportSessionId;

                                setPlotRunning( true );
                                cnfPlot.reportSessionId = reportSessionId;
                                LABKEY.Report.execute( cnfPlot );
                            }
                        });
                    }
                } else {
                    var p = outputParams[0];

                    if ( p && p.type == 'image' ){
                        var imgId = 'img' + config.webPartDivId;
                        cntPlot.update( '<img id=\'' + imgId + '\' src=\'' + p.value + '\' >' );

                        var
                            width   = Math.min( cntPlot.getWidth(), 800 )
                            height  = width * spnrVertical.getValue() / spnrHorizontal.getValue()
                        ;

                        resizableImage = new Ext.Resizable( imgId, {
                            handles: ' ',
                            height: height,
                            preserveRatio: true,
                            width: width,
                            wrap: true
                        });

                        me.resizableImage = resizableImage;

                        // FancyBox plug in usage
                        $('#' + imgId).wrap('<a class=\'fancybox\' data-fancybox-type=\'image\' href=\'' + p.value + '\' />');

                        Ext.QuickTips.register({
                            target: imgId,
                            text: 'Click on the generated plot to see it in full screen'
                        });
                    }

                    p = outputParams[1];

                    if ( p && p.type == 'text' && p.value !== '\n' ){
                        cntPlotMessage.update( '<div class=\'centered-text padding5px\'>' + p.value + '</div>' );
                    }
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var cntPlot = new Ext.Container({
            border: false,
            html: '<div style=\'height: 10px\'></div>'
        });

        var cntPlotMessage = new Ext.Container();
        
        var cmpStatus = new Ext.Component({
            cls: 'paddingLeft10px'
        });

        var cfShowStrains   = LABKEY.ext.ISCore.factoryTooltipWrapper( chShowStrains, 'Show strains', strains_help, true );
        var cfTextSize      = LABKEY.ext.ISCore.factoryTooltipWrapper( spnrTextSize, 'Text size', textsize_help );
        var cfAnnotation    = LABKEY.ext.ISCore.factoryTooltipWrapper( cbAnnotation, 'Annotation', annotation_help, true );
        var cfFacet         = LABKEY.ext.ISCore.factoryTooltipWrapper( rgFacet, 'Facet', facet_help, true );
        var cfColor         = LABKEY.ext.ISCore.factoryTooltipWrapper( cbColor, 'Color', color_help, true );
        var cfShape         = LABKEY.ext.ISCore.factoryTooltipWrapper( cbShape, 'Shape', shape_help, true );
        var cfSize          = LABKEY.ext.ISCore.factoryTooltipWrapper( cbSize, 'Size', size_help, true );
        var cfAlpha         = LABKEY.ext.ISCore.factoryTooltipWrapper( cbAlpha, 'Alpha', alpha_help, true );
        var cfAspectRatio   = LABKEY.ext.ISCore.factoryTooltipWrapper(
            {
                border: false,
                defaults: {
                    border: false,
                    flex: 1,
                    layout: 'hbox'
                },
                fieldLabel: 'Aspect ratio',
                items: [
                    {
                        items: [
                            dfHorizontal,
                            spnrHorizontal,
                        ]
                    },{
                        items: [
                            dfVertical,
                            spnrVertical,
                        ]
                    }
                ],
                layout: 'hbox',
                width: fieldWidth
            },
            'Aspect ratio', aspectratio_help
        );

        var fsAdditionalOptions = new Ext.form.FieldSet({
            autoScroll: true,
            collapsed: true,
            collapsible: true,
            items: [
                cfTextSize,
                cfAnnotation,
                cfFacet,
                cfColor,
                cfShape,
                cfSize,
                cfAlpha,
                cfAspectRatio
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
            titleCollapse: true
        });

        var tlbrButtons = new Ext.Toolbar({
            border: true,
            defaults: {
                style: 'padding-top: 1px; padding-bottom: 1px;',
                width: 45
            },
            enableOverflow: true,
            items: [
                btnPlot,
                btnReset,
                cmpStatus
            ],
            style: 'padding-right: 2px; padding-left: 2px;'
        });

        var pnlInputView = new Ext.form.FormPanel({
            autoScroll: true,
            bodyStyle: 'padding: 4px;',
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
                                this.getEl().on( 'click', function(){ LABKEY.help.Tour.show('immport-dataexplorer-tour'); } );
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
                        { html: 'For information and help on how to use the Data Explorer module, click the' },
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
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbDataset, 'Dataset', dataset_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( cbPlotType, 'Plot type', plottype_help ),
                        LABKEY.ext.ISCore.factoryTooltipWrapper( chNormalize, 'Normalize', normalize_help ),
                        cfShowStrains
                    ],
                    labelWidth: labelWidth,
                    title: 'Parameters'
                }),
                fsAdditionalOptions,
                new Ext.Panel({
                    border: true,
                    items: [
                        tlbrButtons,
                        cntPlotMessage,
                        cntPlot
                    ],
                    style: 'padding-right: 2px; padding-left: 2px;'
                })
            ],
            tabTip: 'Input / View',
            title: 'Input / View'
        });

        var cntEmptyPnlData = new Ext.Container({
            defaults: {
                border: false
            },
            items: [
                { html: 'Go to the' },
                new Ext.Container({
                    autoEl: 'a',
                    html: '&nbsp;\'Input / View\'&nbsp;',
                    listeners: {
                        afterrender: {
                            fn: function(){
                                this.getEl().on( 'click', function(){ pnlTabs.setActiveTab( 0 ); } );
                            },
                            single: true
                        }
                    }
                }),
                { html: 'tab to select a dataset to display below. You will then be able to filter this data here before plotting.' }
            ],
            layout: 'hbox'
        });

        var cntDataset = new Ext.Container({
            defaults: {
                border: false
            },
            items: [],
            layout: 'fit'
        });

        var pnlData = new Ext.Panel({
            autoScroll: true,
            bodyStyle: 'padding: 1px;',
            defaults: {
                autoHeight: true,
                border: false,
                hideMode: 'offsets'
            },
            items: [ cntEmptyPnlData, cntDataset ],
            tabTip: 'Data',
            title: 'Data'
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
                pnlInputView,
                pnlData,
                new Ext.Panel({
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: 'This module can be used to quickly plot a selected immunological response variable (e.g. HAI) in one or more cohorts across multiple analytes (when applicable). Several graphical options are made available including lines, boxplots, violin plots, and heatmaps. Demographics such as gender and age can be added to the plot using aesthetic variables such as color, shape etc.',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: 'For boxplots, violin plots, and lines the visualization is achieved using the <a href="http://cran.r-project.org/web/packages/ggplot2/index.html" target="_blank">ggplot2</a> R package. The heatmap are drawn using the <a href="http://cran.r-project.org/web/packages/pheatmap/index.html" targe="_blank">pheatmap</a> package.',
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
                            html:   '<b>Dataset</b>: ' + dataset_help + '</br></br>' +
                                    '<b>Plot type</b>: ' + plottype_help + '</br></br>' +
                                    '<b>Normalize to baseline</b>: ' + normalize_help + '<br><br>' +
                                    '<b>Show individual virus strains</b>: ' + strains_help,
                            style: 'margin-top: 5px;',
                            title: 'Parameters'
                        }),
                        new Ext.form.Label({
                            text: 'Parameters in the "Additional options" section can be used to customize the plot and modify it based on the demographics. Available choices are Age, Gender, and Race.'
                        }),
                        new Ext.form.FieldSet({
                            html:   '<b>Text size:</b> ' + textsize_help + '</br></br>' +
                                    '<b>Annotation:</b> ' + annotation_help + '</br></br>' +
                                    '<b>Facet:</b> ' + facet_help + '</br></br>' +
                                    '<b>Shape:</b> ' + shape_help + '</br></br>' +
                                    '<b>Color:</b> ' + color_help + '</br></br>' +
                                    '<b>Size:</b> ' + size_help + '</br></br>' +
                                    '<b>Alpha:</b> ' + alpha_help + '</br></br>' +
                                    '<b>Aspect ratio:</b> ' + aspectratio_help,
                            style: 'margin-top: 5px;',
                            title: 'Additional options'
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
                        maskPlot = new Ext.LoadMask(
                            this.getEl(),
                            {
                                msg: LABKEY.ext.ISCore.generatingMessage,
                                msgCls: 'mask-loading'
                            }
                        );
                    },   
                    single: true 
                },
                tabchange: function( tabPanel, activeTab ){
                    if ( activeTab.title == 'Data' ){
                        $('.labkey-data-region-wrap').doubleScroll( 'refresh' );
                    } 
                }
            },
            minTabWidth: 100,
            resizeTabs: true
        });


        /////////////////////////////////////
        //             Functions           //
        /////////////////////////////////////

        var renderPlot = function(){
            var
                width   = Math.min( cntPlot.getWidth(), 800 ),
                height  = width * spnrVertical.getValue() / spnrHorizontal.getValue()
            ;

            cntPlotMessage.update( '' );
            cntPlot.update( '<div style=\'height: 10px\'></div>' );

            cnfPlot.inputParams = {
                datasetName:        cbDataset.getValue(),
                datasetDisplay:     cbDataset.getRawValue(),
                plotType:           cbPlotType.getValue(),
                normalize:          chNormalize.getValue(),
                filters:            Ext.encode( dataregion.getUserFilter() ),
                textSize:           spnrTextSize.getValue(),
                show_strains:       chShowStrains.getValue(),
                facet:              rgFacet.getValue().getGroupValue(),
                shape:              cbShape.getValue(),
                color:              cbColor.getValue(),
                legend:             cbAnnotation.getValue(),
                size:               cbSize.getValue(),
                alpha:              cbAlpha.getValue(),
                imageWidth:         1.5 * width,
                imageHeight:        1.5 * height
            };

            setPlotRunning( true );
            cnfPlot.reportSessionId = reportSessionId;
            LABKEY.Report.execute( cnfPlot );
        };
        
        var setPlotRunning = function( bool ){
            if ( bool ){
                maskPlot.show();
            } else {
                maskPlot.hide();
            }
            componentsSetDisabled( bool );
        };

        var componentsSetDisabled = function( bool ){
            Ext.each(
                [
                    cbDataset,
                    cbPlotType,
                    chNormalize,
                    chShowStrains,
                    spnrTextSize,
                    cbAnnotation,
                    rgFacet,
                    cbColor,
                    cbShape,
                    cbSize,
                    cbAlpha,
                    spnrHorizontal,
                    spnrVertical,
                    dfHorizontal,
                    dfVertical,
                    btnPlot,
                    btnReset,
                    cmpStatus
                ],
                function( e ){ e.setDisabled( bool ); }
            );
        };

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
                        reportId: 'module:DataExplorer/reports/schemas/Plot.R',
                        tabId: 'Source'
                    }
                ) +
                '\' target=\'_blank\' title=\'Click to open the R source code in a new window\'></a>'
            );

        // jQuery-related

        jQuery('.fancybox').fancybox({
            closeBtn: false,
            helpers: {
                buttons: {
                    tpl:
                        '<div id=\'fancybox-buttons\'>' +
                            '<ul>' +
                                '<li>' +
                                    '<a class=\'btnToggle\' title=\'Toggle size\' href=\'javascript:;\'></a>' +
                                '</li>' +
                                '<li>' +
                                    '<a class=\'btnClose\' title=\'Close\' href=\'javascript:jQuery.fancybox.close();\'></a>' +
                                '</li>' +
                            '</ul>' +
                        '</div>'
                }
            },
            type: 'image'
        });


        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'ISCore';
        this.frame          = false;
        this.items          = pnlTabs;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        this.cntPlot = cntPlot;

        LABKEY.ext.DataExplorer.superclass.constructor.apply(this, arguments);

    }, // end constructor

    listeners: {
        afterrender: DETour
    },

    resize : function(){
        if ( this.qwpDataset ){
            this.qwpDataset.render();
        }

        if ( this.resizableImage != undefined ){
            var width = Math.min( this.cntPlot.getWidth(), 800 );
            this.resizableImage.resizeTo( width, width * this.resizableImage.height / this.resizableImage.width );
        }
    }
}); // end DataExplorer Panel class

