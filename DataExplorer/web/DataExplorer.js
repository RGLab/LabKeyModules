// vim: sw=4:ts=4:nu:nospell
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

LABKEY.ext.DataExplorer = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me              = this,
            maskPlot        = undefined,
            reportSessionId = undefined,
            fieldWidth      = 400,
            labelWidth      = 130,
            aspectRatio     = 0.5
            ;

        var checkBtnPlotStatus = function(){
            var dataset = cbDataset.getValue();
            if (    dataset !== '' &&
                    spnrTextSize.isValid( true )
            ){
                if ( qwpDataset == undefined ){

                    qwpDataset = new LABKEY.QueryWebPart({
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
                        renderTo: pnlData.getEl(),
                        schemaName: 'study'
                    });

                } else if ( qwpDataset.queryName != dataset ) {
                    qwpDataset.queryName = dataset;
                    qwpDataset.render();
                }

                btnPlot.setDisabled( false );
            } else {
                qwpDataset = undefined;
                pnlData.getEl().update('Please, go to the "Input / View" tab to select a dataset to display below. You will then be able to filter this data here before plotting.'),
                btnPlot.setDisabled( true );
                cntPlot.update( '<div style=\'height: 10px\'></div>' );
                btnSaveAsPdf.setDisabled( true );
            }
        };


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        // IF EVER THE 'ShowByDefault' COLUMN OF THE 'Datasets' TABLE DOES NOT REFLECT PROPERLY WHETHER THE DATASET IS ACTUALLY EMPTY
        // OR NOT, THEN CAN RESORT TO THE DYNAMIC, YET MORE COSTLY APPROACH BELOW

        // var strDataset;
       
        // var processDataSets = function( inputArray, outputArray ){
        //     if ( inputArray.length == 0 ){
        //         strDataset = new Ext.data.ArrayStore({
        //             data: outputArray,
        //             fields: [ 'Name', 'Name' ]
        //         });

        //         cbDataset.bindStore( strDataset );
        //     } else {
        //         var curName = inputArray.pop().Name;

        //         LABKEY.Query.executeSql({
        //             sql: 'SELECT COUNT(*) AS Number FROM ' + curName,
        //             schemaName: 'study',
        //             success: function( d ){
        //                 if ( d.rows[0].Number != 0 ){
        //                     outputArray.push( [ curName, curName ] );
        //                 }

        //                 processDataSets( inputArray, outputArray );
        //             }
        //         });               
        //     }
        // };
 
        // LABKEY.Query.selectRows({
        //     queryName: 'data_sets',
        //     schemaName: 'study',
        //     success: function( d ){
        //         var toAdd = [];

        //         processDataSets( d.rows, toAdd );
        //     }
        // });

        var strDataset = new LABKEY.ext.Store({
            autoLoad: true,
            queryName: 'data_sets',
            schemaName: 'study'
        });

        var strPlotType = new Ext.data.ArrayStore({
            data: [
                [ 'Auto', 'auto' ],
                [ 'Boxplot', 'boxplot' ],
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
            displayField: 'Label',
            fieldLabel: 'Choose a dataset',
            lazyInit: false,
            listeners: {
                change:     checkBtnPlotStatus,
                cleared:    checkBtnPlotStatus,
                select:     checkBtnPlotStatus
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
            store: strPlotType,
            value: 'auto',
            valueField: 'value',
            width: fieldWidth
        });

        var cbColor = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Color',
            hidden: true,
            lazyInit: false,
            store: strDemographics,
            value: 'Age',
            valueField: 'value',
            width: fieldWidth
        });

       var cbShape = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Shape',
            hidden: true,
            lazyInit: false,
            store: strShape,
            value: 'Gender',
            valueField: 'value',
            width: fieldWidth
        });

        var cbSize = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Size',
            hidden: true,
            lazyInit: false,
            store: strDemographics,
            valueField: 'value',
            width: fieldWidth
        });

        var cbAlpha = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Alpha',
            hidden: true,
            lazyInit: false,
            store: strDemographics,
            valueField: 'value',
            width: fieldWidth
        });


        ///////////////////////////////////////
        // Buttons, Radio Groups, Checkboxes //
        ///////////////////////////////////////

        var chNormalize = new Ext.form.Checkbox({
            fieldLabel: 'Normalize to baseline'
        });

        var spnrTextSize = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            allowDecimals: false,
            fieldLabel: 'Text size',
            listeners: {
                invalid:
                    function(){
                        btnPlot.setDisabled( true );
                        btnSaveAsPdf.setDisabled( true );
                    },
                valid:      checkBtnPlotStatus
            },
            maxValue: 30,
            minValue: 0,
            value: 18,
            width: 40
        });

        var rgFacet = new Ext.form.RadioGroup({
            columns: [ 100, 100 ],
            fieldLabel: 'Facet',
            hidden: true,
            items: [
                {
                    boxLabel: 'Grid',
                    checked: true,
                    inputValue: 'Grid',
                    name: 'facet',
                    value: 'Grid'
                },
                {
                    boxLabel: 'Wrap',
                    inputValue: 'Wrap',
                    name: 'facet',
                    value: 'Wrap'
                }
            ]
        });

        var btnPlot = new Ext.Button({
            disabled: true,
            handler: function(){
                var
                    width   = Math.min( cntPlot.getWidth(), 800 ),
                    height  = width * aspectRatio
                ;

                cnfPlot.inputParams = {
                    datasetName:        cbDataset.getValue(),
                    datasetDisplay:     cbDataset.getRawValue(),
                    plotType:           cbPlotType.getValue(),
                    normalize:          chNormalize.getValue(),
                    filters:            Ext.encode( qwpDataset.getDataRegion().getUserFilter() ),
                    textSize:           spnrTextSize.getValue(),
                    facet:              rgFacet.getValue().getGroupValue(),
                    shape:              cbShape.getValue(),
                    color:              cbColor.getValue(),
                    size:               cbSize.getValue(),
                    alpha:              cbAlpha.getValue(),
                    imageWidth:         1.5 * width,
                    imageHeight:        1.5 * height
                };

                setPlotRunning( true );
                cnfPlot.reportSessionId = reportSessionId;
                LABKEY.Report.execute( cnfPlot );
            },
            text: 'Plot'
        });

        var btnSaveAsPdf = new Ext.Button({
            disabled: true,
            handler: function(){
                
            },
            text: 'Save as pdf'
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
                            height  = width * aspectRatio
                        ;

                        resizableImage = new Ext.Resizable( imgId, {
                            disableTrackOver: true,
                            dynamic: true,
                            handles: 's',
                            height: height,
                            listeners: {
                                resize: function(){
                                    var widthToSet = Math.min( cntPlot.getWidth(), 800 ), img = this.getEl().dom;
                                    var width = img.offsetWidth, height = img.offsetHeight;
                                    if ( width > widthToSet ){
                                        resizableImage.resizeTo( widthToSet, height / width * widthToSet );
                                    }
                                }
                            },
                            maxWidth: width,
                            minHeight: 50,
                            minWidth: 50,
                            pinned: true,
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

                        btnSaveAsPdf.setDisabled( false );
                    }
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var cntPlot = new Ext.Container({
            html: '<div style=\'height: 10px\'></div>'
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
                new Ext.form.FieldSet({
                    autoScroll: true,
                    items: [
                        new Ext.Spacer({
                            height: 20,
                            html: '&nbsp'
                        }),
                        cbDataset,
                        cbPlotType,
                        chNormalize
                    ],
                    labelWidth: labelWidth,
                    title: 'Parameters'
                }),
                new Ext.form.FieldSet({
                    autoScroll: true,
                    collapsed: true,
                    collapsible: true,
                    items: [
                        spnrTextSize,
                        rgFacet,
                        cbColor,
                        cbShape,
                        cbSize,
                        cbAlpha
                    ],
                    labelWidth: labelWidth,
                    title: 'Additional options',
                    titleCollapse: true
                }),
                btnPlot,
                cntPlot,
                btnSaveAsPdf
            ],
            tabTip: 'Input / View',
            title: 'Input / View'
        });

        var qwpDataSet = undefined;

        var pnlData = new Ext.Panel({
            autoScroll: true,
            bodyStyle: 'padding: 1px;',
            defaults: {
                autoHeight: true,
                hideMode: 'offsets'
            },
            html: 'Please, go to the "Input / View" tab to select a dataset to display below. You will then be able to filter this data here before plotting.',
            layout: 'fit',
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
                            html: 'This module can be used to quickly plot a selected immunological response variable (e.g. HAI) in one or more cohorts across multiple analytes (when applicable). Visualization is achieved using the <a href="http://cran.r-project.org/web/packages/ggplot2/index.html" target="_blank">ggplot2</a> R package, and several graphical options are made available including lines, boxplots and heatmaps. Demographics variables such as gender and age can be added to the plot using aesthetic variables such as color, shape etc.',
                            style: 'margin-top: 5px;',
                            title: 'Description'
                        }),
                        new Ext.form.FieldSet({
                            html: '',
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
                            html: '<b>Choose a dataset</b>: Select an assay type to visualize. The selected data can be filtered using the grid view under the data tab.</br></br><b>Plot type</b>: 4 different types are available: "Boxplot", "Lines", "Heatmap", and "Auto". By default, the "Auto" option is selected, in which case the module will try to figure out the best plot type for your data.</br></br><b>Normalize to baseline</b>: Should the data be normalized to baseline (i.e. subtract the day 0 response after log transformation), or simply plot the un-normalized data.',
                            style: 'margin-top: 5px;',
                            title: 'Predictors'
                        }),
                        new Ext.form.Label({
                            text: 'Parameters in the "Additional options" section can be used to customize the plot and modify it based on the demographics. Available choices are Age, Gender, and Race.'
                        }),
                        new Ext.form.FieldSet({
                            html: '<b>Text size:</b> The size of all text elements on the plot (Including axis, legend and labels)<br><br><b>Facet:</b> The plot will facet by cohorts on the y axis and genes on the x axis. In Grid mode, the scales are consistent for a gene and for a cohort. In wrap mode, the scales are free. Use wrap if you observe empty spaces in the plots<br><br><b>Shape:</b> The shape of the data points (Gender is selected by default)<br><br><b>Color:</b> The color of the data points (Age is selected by default)<br><br><b>Size:</b> The size of the data points<br><br><b>Alpha:</b> The transparency of the data points',
                            style: 'margin-bottom: 2px; margin-top: 5px;',
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
                afterrender: function(){
                    maskPlot = new Ext.LoadMask(
                        this.getEl(),
                        {
                            msg: 'Generating the plot...',
                            msgCls: 'mask-loading'
                        }
                    );
                }
            },
            minTabWidth: 100,
            resizeTabs: true
        });


        /////////////////////////////////////
        //             Functions           //
        /////////////////////////////////////
        
        var setPlotRunning = function( bool ){
            if ( bool ){
                maskPlot.show();
            } else {
                maskPlot.hide();
            }
            btnPlot.setDisabled( bool );
            cbDataset.setDisabled( bool );
            cbPlotType.setDisabled( bool );
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

    resize : function(){
        if ( qwpDataset != undefined ){
            qwpDataset.render();
        }

        if ( this.resizableImage != undefined ){
            var width = Math.min( this.cntPlot.getWidth(), 800 );
            this.resizableImage.resizeTo( width, width * this.resizableImage.height / this.resizableImage.width );
        }
    }}); // end DataExplorer Panel class

