// vim: sw=4:ts=4:nu:nospell:
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

LABKEY.ext.GeneExpressionExplorer = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me              = this,
            maskPlot        = undefined,
            reportSessionId = undefined,
            fieldWidth      = 400,
            labelWidth      = 130
            ;

        var checkBtnPlotStatus = function(){
            chNormalize.setDisabled( cbTimePoint.getValue() === 0 );

            if (    cbResponse.isValid( true ) &&
                    cbCohorts.isValid( true ) &&
                    cbTimePoint.isValid( true ) &&
                    cbGenes.isValid( true ) &&
                    spnrTextSize.isValid( true )
            ){
                btnPlot.setDisabled( false );
            } else {
                btnPlot.setDisabled( true );
            }
        };

        var manageCbGenesState = function(){
            var tempSQL = '',
                tempArray = cbCohorts.getCheckedArray('featureSetId'),
                len = tempArray.length
            ;
            if ( len >= 1 ){
                cbGenes.setDisabled( false );
                tempSQL +=  strngSqlStartGenes +
                            strngSqlWhereGenes +
                            tempArray[0];
                if ( len > 1 ) {
                    for ( var i = 1; i < len; i ++ ){
                        tempSQL +=  strngSqlIntersectGenes +
                                    strngSqlStartGenes +
                                    strngSqlWhereGenes +
                                    tempArray[i];
                    }
                }
            } else {
                cbGenes.clearValue();
                cbGenes.setDisabled( true );
            }
            strGene.setSql( tempSQL );

            checkBtnPlotStatus();
        };


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strCohort = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'cohorts_gee',
            schemaName: 'study'
        });

        var strTimePoint = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                load: function(){
                    var field = { name: 'displayTimepoint' };
                    field = new Ext.data.Field(field);
                    this.recordType.prototype.fields.replace(field);
                    this.each( function(r){
                        if ( ! r.data[field.name] ){
                            r.data[field.name] = r.data['timepoint'] +  ' ' + r.data['timepointUnit'];
                        }
                    });

                    cbTimePoint.bindStore( this );
                },
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            queryName: 'timepoints_gee',
            schemaName: 'study'
        });

        var strngSqlStartGenes      =   'SELECT' +
                                        ' DISTINCT GeneSymbol as gene_symbol' +
                                        ' FROM featureannotation',
            strngSqlWhereGenes      =   ' WHERE featureannotationsetid = ',
            strngSqlIntersectGenes  =   ' INTERSECT '
        ; 

        var strGene = new LABKEY.ext.Store({
            listeners: {
                loadexception: LABKEY.ext.ISCore.onFailure
            },
            schemaName: 'Microarray',
            sql: strngSqlStartGenes
        });

        var strDemographics = new Ext.data.ArrayStore({
            data: [
                [ 'Age', 'Age' ],
                [ 'Gender', 'Gender' ],
                [ 'Race', 'Race' ]
            ],
            fields: [ 'name', 'name' ]
        });

        var strShape = new Ext.data.ArrayStore({
            data: [
                [ 'Gender', 'Gender' ],
                [ 'Race', 'Race' ]
            ],
            fields: [ 'name', 'name' ]
        });


        /////////////////////////////////////
        //      Session instanciation      //
        /////////////////////////////////////

        LABKEY.Report.getSessions({
            success: function( responseObj ){
                var i, array = responseObj.reportSessions, length = array.length;
                for ( i = 0; i < length; i ++ ){
                    if ( array[i].clientContext == 'GeneExpressionExplorer' ){
                        reportSessionId = array[i].reportSessionId;
                        i = length;
                    }
                }
                if ( i == length ){
                    LABKEY.Report.createSession({
                        clientContext : 'GeneExpressionExplorer',
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

        var cbResponse = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'name',
            fieldLabel: 'Response',
            lazyInit: false,
            listeners: {
                change:     checkBtnPlotStatus,
                cleared:    checkBtnPlotStatus,
                select:     checkBtnPlotStatus
            },
            store: new Ext.data.ArrayStore({
                data: [ [ 'HAI', 'HAI' ] ],
                fields: [ 'name', 'name' ]
            }),
            valueField: 'name',
            width: fieldWidth
        });

        var cbCohorts = new Ext.ux.form.ExtendedLovCombo({
            allowBlank: false,
            displayField: 'cohort',
            fieldLabel: 'Cohorts',
            lazyInit: false,
            listeners: {
                change:     manageCbGenesState,
                cleared:    manageCbGenesState,
                select:     manageCbGenesState
            },
            store: strCohort,
            valueField: 'cohort',
            width: fieldWidth
        });

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
            allowBlank: false,
            displayField: 'displayTimepoint',
            fieldLabel: 'Time point',
            lazyInit: false,
            listeners: {
                change:     checkBtnPlotStatus,
                cleared:    checkBtnPlotStatus,
                select:     checkBtnPlotStatus
            },
            store: strTimePoint,
            valueField: 'timepoint',
            width: fieldWidth
        });

        var cbGenes = new Ext.ux.form.SuperBoxSelect({
            allowBlank: false,
            disabled: true,
            displayField: 'gene_symbol',
            fieldLabel: 'Genes',
            getParams: function(q){
                var params = {},
                    paramNames = this.store.paramNames;
                if(this.pageSize){
                    params[paramNames.start] = 0;
                    params[paramNames.limit] = this.pageSize;
                }

                strGene.setUserFilters([
                    LABKEY.Filter.create(
                        'gene_symbol',
                        q,
                        LABKEY.Filter.Types.CONTAINS
                    )
                ]);

                return params;
            },
            lazyInit: false,
            listeners: {
                additem:    checkBtnPlotStatus,
                clear:      checkBtnPlotStatus,
                removeItem: checkBtnPlotStatus,
                focus: function (){
                    if ( this.disabled ) {
                        return;
                    }
                    if ( this.isExpanded() ) {
                        this.multiSelectMode = false;
                    } else if ( this.pinList ) {
                        this.multiSelectMode = true;
                    }

                    this.initList();
                    if( this.triggerAction == 'all' ) {
                        this.doQuery( this.allQuery, true );
                    } else {
                        this.doQuery( this.getRawValue() );
                    }
                }
            },
            mode: 'remote',
            pageSize: 10,
            store: strGene,
            triggerAction: 'query',
            valueField: 'gene_symbol',
            width: fieldWidth
        });

        var cbShape = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Shape',
            lazyInit: false,
            store: strShape,
            value: 'Gender',
            valueField: 'name',
            width: fieldWidth
        });

        var cbColor = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Color',
            lazyInit: false,
            store: strDemographics,
            value: 'Age',
            valueField: 'name',
            width: fieldWidth
        });

        var cbSize = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Size',
            lazyInit: false,
            store: strDemographics,
            valueField: 'name',
            width: fieldWidth
        });

        var cbAlpha = new Ext.ux.form.ExtendedComboBox({
            displayField: 'name',
            fieldLabel: 'Alpha',
            lazyInit: false,
            store: strDemographics,
            valueField: 'name',
            width: fieldWidth
        });


        ///////////////////////////////////////
        // Buttons, Radio Groups, Checkboxes //
        ///////////////////////////////////////

        var chNormalize = new Ext.form.Checkbox({
            fieldLabel: 'Normalize to baseline'
        });

        var btnPlot = new Ext.Button({
            disabled: true,
            handler: function(){
                var width = Math.min( cntPlot.getWidth(), 800 );

                cnfPlot.inputParams = {
                    response:           cbResponse.getValue(),
                    cohorts:            Ext.encode( cbCohorts.getCheckedArray() ),
                    timePoint:          cbTimePoint.getValue(),
                    timePointDisplay:   cbTimePoint.getRawValue(),
                    normalize:          chNormalize.getValue(),
                    genes:              Ext.encode( cbGenes.getValuesAsArray() ),
                    textSize:           spnrTextSize.getValue(),
                    facet:              rgFacet.getValue().getGroupValue(),
                    shape:              cbShape.getValue(),
                    color:              cbColor.getValue(),
                    size:               cbSize.getValue(),
                    alpha:              cbAlpha.getValue(),
                    imageWidth:         width,
                    imageHeight:        width
                };

                setPlotRunning( true );
                cnfPlot.reportSessionId = reportSessionId;
                LABKEY.Report.execute( cnfPlot );
            },
            text: 'Plot'
        });


        var spnrTextSize = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            allowDecimals: false,
            fieldLabel: 'Text size',
            listeners: {
                invalid:    function(){ btnPlot.setDisabled(true); },
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


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var resizableImage;

        var cnfPlot = {
            failure: function( errorInfo, options, responseObj ){
                setPlotRunning( false );

                LABKEY.ext.ISCore.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:GeneExpressionExplorer/Plot.R',
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
                            clientContext : 'GeneExpressionExplorer',
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

                        var width = Math.min( cntPlot.getWidth(), 800 );

                        resizableImage = new Ext.Resizable( imgId, {
                            disableTrackOver: true,
                            dynamic: true,
                            handles: 's',
                            height: width,
                            listeners: {
                                resize: function(){
                                    var widthToSet = Math.min( cntPlot.getWidth(), 800 ), img = this.getEl().dom;
                                    var width = img.offsetWidth;
                                    if ( width > widthToSet ){
                                        resizableImage.resizeTo( widthToSet, widthToSet );
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
                    }
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var cntPlot = new Ext.Container({});

        var pnlInputView = new Ext.form.FormPanel({
            autoScroll: true,
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
                        cbResponse,
                        new Ext.Spacer({
                            height: 20,
                            html: '&nbsp'
                        }),
                        cbCohorts,
                        cbTimePoint,
                        chNormalize,
                        cbGenes
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
                        cbShape,
                        cbColor,
                        cbSize,
                        cbAlpha
                    ],
                    labelWidth: labelWidth,
                    title: 'Additional options',
                    titleCollapse: true
                }),
                btnPlot,
                cntPlot
            ],
            tabTip: 'Input / View',
            title: 'Input / View'
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
                new Ext.Panel({
                    defaults: {
                        autoHeight: true,
                        bodyStyle: 'padding-bottom: 1px;',
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.form.Label(),
                        new Ext.form.FieldSet({
                            html: 'This module can be used to quickly plot the expression level of one or more genes against a selected immunological response variable (e.g. HAI) in one or more cohorts.</br>Visualization is achieved using the <a href="http://cran.r-project.org/web/packages/ggplot2/index.html" target="_blank">ggplot2</a> R package. Demographics variables such as gender and age can be added to the plot using aesthetic variables such as color, shape etc.',
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
                        new Ext.form.Label({
                            text: 'The following parameters are required to generate the plot'
                        }),
                        new Ext.form.FieldSet({
                            html: '<b>Response:</b> The variable to plot against the expression of selected genes<br><br><b>Cohorts:</b> The cohorts with subjects of interest<br><br><b>Time point:</b> The time point to plot<br><br><b>Normalize to baseline:</b> Should the data be normalized to baseline (i.e. subtract the day 0 response after log transformation), or simply plot the un-normalized data<br><br><b>Genes:</b> The genes to plot',
                            style: 'margin-top: 5px;',
                            title: 'Parameters'
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
            cbResponse.setDisabled( bool );
            cbCohorts.setDisabled( bool );
            cbTimePoint.setDisabled( bool );
            cbGenes.setDisabled( bool );
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
                        reportId: 'module:GeneExpressionExplorer/reports/schemas/Plot.R',
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

        LABKEY.ext.GeneExpressionExplorer.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize : function(){
        if ( this.resizableImage != undefined ){
            var width = Math.min( this.cntPlot.getWidth(), 800 );
            this.resizableImage.resizeTo( width, width * this.resizableImage.height / this.resizableImage.width );
        }
    }}); // end GeneExpressionExplorer Panel class

