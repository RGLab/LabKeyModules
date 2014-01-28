// vim: sw=4:ts=4:nu:nospell:fdc=4
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

        ////////////////////////////////////
        //  Generate necessary HTML divs  //
        ////////////////////////////////////

        $('#' + config.webPartDivId).append(
            '<div id=\'wpGraph' + config.webPartDivId + '\' class=\'centered-text\'>' +
                '<div style=\'height: 20px\'></div>' +
            '</div>'
        );


        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me              = this,
            maskPlot        = undefined,
            fieldWidth      = 400,
            reportSessionId = undefined
            ;

        var checkBtnPlotStatus = function(){
            if (    cbTimePoint.getValue() != '' &&
                    cbCohorts.getValue() != '' &&
                    cbGenes.getValue() != ''
            ){
                btnPlot.setDisabled( false );
            } else {
                btnPlot.setDisabled( true );
            }
        };


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////

        var strCohort = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                loadexception: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure
            },
            queryName: 'cohorts',
            schemaName: 'study'
        });

        var strTimePoint = new LABKEY.ext.Store({
            listeners: {
                load: function(){
                    cbTimePoint.setDisabled( false );
                },
                loadexception: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure
            },
            queryName: 'timepoints',
            schemaName: 'study'
        });

        var strGene = new LABKEY.ext.Store({
            listeners: {
                loadexception: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure
            },
            queryName: 'gene',
            schemaName: 'lists'
        });


        /////////////////////////////////////
        //     ComboBoxes / TextFields     //
        /////////////////////////////////////

        var cbCohorts = new Ext.ux.form.ExtendedLovCombo({
            displayField: 'cohort',
            fieldLabel: 'Cohorts',
            listeners: {
                change: function(){
                    if ( this.getValue() == '' ){
                        cbTimePoint.clearValue();
                        btnPlot.setDisabled( true );
                        cbTimePoint.setDisabled( true );
                    } else {
                        cbTimePoint.clearValue();
                        strTimePoint.load( { params: { 'query.param.COHORT_VALUE': this.getRawValue() } } );
                    }
                },
                cleared: function(){
                    cbTimePoint.clearValue();
                    btnPlot.setDisabled( true );
                    cbTimePoint.setDisabled( true );
                },
                select: function(){
                    cbTimePoint.clearValue();
                    strTimePoint.load( { params: { 'query.param.COHORT_VALUE': this.getRawValue() } } );
                }
            },
            store: strCohort,
            valueField: 'cohort',
            width: fieldWidth
        });

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'displayTimepoint',
            fieldLabel: 'Time point',
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
//            lazyInit: false,
            listeners: {
                additem:    checkBtnPlotStatus,
                clear:      checkBtnPlotStatus,
                removeItem: checkBtnPlotStatus,
                focus: function (){
                    this.initList();
                    if( this.triggerAction == 'all' ) {
                        this.doQuery( this.allQuery, true );
                    } else {
                        this.doQuery( this.getRawValue() );
                    }
                }
            },
            listWidth: 270,
            minListWidth: 270,
            mode: 'remote',
            pageSize: 10,
            store: strGene,
            triggerAction: 'query',
            valueField: 'gene_symbol',
            width: fieldWidth
        });


        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnPlot = new Ext.Button({
            disabled: true,
            handler: function(){
/*                LABKEY.Query.selectRows({
                    failure: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure,
                    filterArray: [
//                        LABKEY.Filter.create( 'expression_matrix_accession', cbCohorts.getValue() ),
                        LABKEY.Filter.create( 'timepoint', cbTimePoint.getValue() )
                    ],
                    queryName: 'study_cohorts_info',
                    schemaName: 'study',
                    success: function(data){
                        var count = data.rows.length;
                        if ( count == 1 ){*/
                            /*cnfPlot.inputParams = {
                                cohorts:            Ext.encode( cbCohorts.getCheckedArray() ),
                                timePoint:          cbTimePoint.getValue(),
                                timePointDisplay:   cbTimePoint.getRawValue(),
                                genes:              Ext.encode( cbGenes.getValuesAsArray() )
                            };*/

                            wpGraphConfig.cohorts           = Ext.encode( cbCohorts.getCheckedArray() ),
                            wpGraphConfig.genes             = Ext.encode( cbGenes.getValuesAsArray() ),
                            wpGraphConfig.timePoint         = cbTimePoint.getValue();
                            wpGraphConfig.timePointDisplay  = cbTimePoint.getValue();
                            wpGraphConfig.reportSessionId   = reportSessionId;

                            setPlotRunning( true );

//                            LABKEY.Report.execute( cnfPlot );

                            wpGraph.render();
                        /*} else if ( count > 1 ) {
                            LABKEY.ext.GeneExpressionExplorer_Lib.onFailure({
                                exception: 'The selected values do not result in a unique set of parameters.'
                            });
                        } else if ( count < 1 ) {
                            LABKEY.ext.GeneExpressionExplorer_Lib.onFailure({
                                exception: 'The selected values result in an empty set of parameters.'
                            });
                        }
                    }
                });*/
            },
            text: 'Plot'
        });


        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var cnfPlot = {
            failure: function( errorInfo, options, responseObj ){
                setPlotRunning( false );

                LABKEY.ext.GeneExpressionExplorer_Lib.onFailure( errorInfo, options, responseObj );
            },
            reportId: 'module:GeneExpressionExplorer/Plot.R',
            success: function( result ){
                setPlotRunning( false );

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    LABKEY.ext.GeneExpressionExplorer_Lib.onFailure({
                        exception: errors.join('\n')
                    });
                } else {
                    var p = outputParams[0];

                    if ( p && p.type == 'image' ){
                        cntPlot.update('<img src=\'' + p.value + '\' >');
                    }
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var cntPlot = new Ext.Container({
            contentEl: 'wpGraph' + config.webPartDivId
        });

        var pnlMain = new Ext.form.FormPanel({
            autoHeight: true,
            autoScroll: true,
            bodyStyle: 'padding: 4px;',
            defaults: {
                autoHeight: true,
                forceLayout: true,
                hideMode: 'offsets'
            },
            deferredRender: false,
            forceLayout: true,
            items: [
                new Ext.ux.form.ExtendedComboBox({
                    displayField: 'name',
                    fieldLabel: 'Response',
                    store: new Ext.data.ArrayStore({
                        data: [ [ 'HAI', 'HAI' ] ],
                        fields: [ 'name', 'name' ]
                    }),
                    valueField: 'name',
                    width: fieldWidth
                }),
                new Ext.Spacer({
                    height: 20,
                    html: '&nbsp'
                }),
                cbCohorts,
                cbTimePoint,
                cbGenes,
                new Ext.form.FieldSet({
                    autoScroll: true,
                    collapsed: true,
                    collapsible: true,
                    items: [
                        new Ext.form.Checkbox({
                            checked: false,
                            fieldLabel: 'Toggle'
                        })
                    ],
                    title: 'Additional parameters'
                }),
                btnPlot,
                cntPlot
            ],
            labelWidth: 150,
            listeners: {
                afterrender: function(){
                    maskPlot = new Ext.LoadMask(
                        this.getEl(),
                        {
                            msg: 'Generating the report...',
                            msgCls: 'mask-loading'
                        }
                    );
                }
            }
        });



        var wpGraphConfig = {
            reportId: 'module:GeneExpressionExplorer/Plot.R',
            title: 'Graph'
        };

        var resizableImage;

        var wpGraph = new LABKEY.WebPart({
            failure: function( errorInfo, options, responseObj ){
                setPlotRunning( false );

                LABKEY.ext.GeneExpressionExplorer_Lib.onFailure(errorInfo, options, responseObj);
            },
            frame: 'none',
            partConfig: wpGraphConfig,
            partName: 'Report',
            renderTo: 'wpGraph' + config.webPartDivId,
            success: function(){
                setPlotRunning( false );

                var img = $('#wpGraph' + config.webPartDivId + ' img'), imgId = undefined;
                if ( img.length > 1 ){
                    imgId = img[1].id;
                }

                if ( $('#wpGraph' + config.webPartDivId + ' .labkey-error').length > 0 ){
                    removeById( imgId );

                    var inputArray = $('#wpGraph' + config.webPartDivId + ' pre')[0].innerHTML;
                    if ( inputArray.indexOf('The report session is invalid') < 0 ){
                        if ( inputArray.indexOf('must have only one flow frame per panel') < 0 ){
                            LABKEY.ext.GeneExpressionExplorer_Lib.onFailure({
                                exception: inputArray
                            });

                            cntPlot.getEl().frame("ff0000");
                        } else {
                            $('#wpGraph' + config.webPartDivId + ' div *').remove();

                            Ext.Msg.alert('Error', 'The data chosen for plotting is such that rows (excluding the file names column) are not unique and so the plotting engine cannot proceed');
                        }
                    } else {
                        $('#wpGraph' + config.webPartDivId + ' div *').remove();
                        $('#wpGraph' + config.webPartDivId + ' div').attr( 'style', 'height: 7px');

                        LABKEY.Report.createSession({
//                            clientContext : 'GeneExpressionExplorer',
                            failure: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure,
                            success: function(data){
                                reportSessionId = data.reportSessionId;

                                wpGraphConfig.reportSessionId = reportSessionId;

                                setPlotRunning( true );
                                wpGraph.render();
                            }
                        });
                    }

                } else {

                    var width = cntPlot.getWidth(), height = width;

                    resizableImage = new Ext.Resizable( imgId, {
                        disableTrackOver: true,
                        dynamic: true,
                        handles: 's',
                        height: height,
                        listeners: {
                            resize: function(){
                                var widthToSet = cntPlot.getWidth(), img = this.getEl().dom;
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
//                    $('#' + imgId).wrap('<a class=\'fancybox\' data-fancybox-type=\'image\' href=\'' + $('#' + imgId)[0].src + '\' />');

                    Ext.QuickTips.register({
                        target: imgId,
                        text: 'Click on the generated plot to see it in full screen'
                    });
                }
            }
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
            cbCohorts.setDisabled( bool );
            cbTimePoint.setDisabled( bool );
            cbGenes.setDisabled( bool );
        };


        // jQuery-related

        jQuery('.fancybox').fancybox({
            closeBtn: false,
            helpers: {
                buttons: {
                    tpl:
                        '<div id="fancybox-buttons">' +
                            '<ul>' +
                                '<li>' +
                                    '<a class="btnToggle" title="Toggle size" href="javascript:;"></a>' +
                                '</li>' +
                                '<li>' +
                                    '<a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a>' +
                                '</li>' +
                            '</ul>' +
                        '</div>'
                }
            },
            type: 'image'
        });


        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'geneExpressionExplorer';
        this.frame          = false;
        this.items          = pnlMain;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.GeneExpressionExplorer.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize: function(){
    }
}); // end GeneExpressionExplorer Panel class

