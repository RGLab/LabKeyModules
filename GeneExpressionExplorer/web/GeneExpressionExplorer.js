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

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            me              = this,
            maskPlot        = undefined,
            reportSessionId = undefined,
            fieldWidth      = 400
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
            autoLoad: true,
            listeners: {
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
                        failure: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure,
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

        var cbCohorts = new Ext.ux.form.ExtendedLovCombo({
            displayField: 'cohort',
            fieldLabel: 'Cohorts',
            listeners: {
                change:     checkBtnPlotStatus,
                cleared:    checkBtnPlotStatus,
                select:     checkBtnPlotStatus
            },
            store: strCohort,
            valueField: 'cohort',
            width: fieldWidth
        });

        var cbTimePoint = new Ext.ux.form.ExtendedComboBox({
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
            lazyInit: false,
            listeners: {
                additem:    checkBtnPlotStatus,
                clear:      checkBtnPlotStatus,
                removeItem: checkBtnPlotStatus,
                focus: function (){
                    if (this.disabled) {
                        return;
                    }
                    if (this.isExpanded()) {
                        this.multiSelectMode = false;
                    } else if (this.pinList) {
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


        /////////////////////////////////////
        //    Buttons and Radio Groups     //
        /////////////////////////////////////

        var btnPlot = new Ext.Button({
            disabled: true,
            handler: function(){
                cnfPlot.inputParams = {
                    cohorts:            Ext.encode( cbCohorts.getCheckedArray() ),
                    timePoint:          cbTimePoint.getValue(),
                    timePointDisplay:   cbTimePoint.getRawValue(),
                    genes:              Ext.encode( cbGenes.getValuesAsArray() )
                };

                var width = cntPlot.getWidth();
                cnfPlot.inputParams.imageWidth = width;
                if ( ! chAspectRatio.getValue() ){
                    cnfPlot.inputParams.imageHeight = width;
                } else {
                    cnfPlot.inputParams.imageHeight = width * spnrVertical.getValue() / spnrHorizontal.getValue();
                }

                setPlotRunning( true );
                cnfPlot.reportSessionId = reportSessionId;
                LABKEY.Report.execute( cnfPlot );
            },
            text: 'Plot'
        });


        var spnrHorizontal = new Ext.ux.form.SpinnerField({
            fieldLabel: 'horizontal',
            maxValue: 10,
            minValue: 1,
            value: 1,
            width: 40
        });

        var spnrVertical = new Ext.ux.form.SpinnerField({
            fieldLabel: 'vertical',
            maxValue: 10,
            minValue: 1,
            value: 1,
            width: 40
        });

        var dfHorizontal = new Ext.form.DisplayField({
//            cls: 'bold-text',
            value: 'horizontal'
        });

        var dfVertical = new Ext.form.DisplayField({
//            cls: 'bold-text',
            value: 'vertical'
        });

        var chAspectRatio = new Ext.form.Checkbox({
            boxLabel: 'Control plot\'s aspect ratio',
            checked: true,
//            ctCls: 'bold-text',
            handler: function(a,b){
                spnrHorizontal.setDisabled(!b);
                dfHorizontal.setDisabled(!b)
                spnrVertical.setDisabled(!b);
                dfVertical.setDisabled(!b);

                if ( !b ){
                    lastValueHorizontalAspect   = spnrHorizontal.getValue();
                    lastValueVerticalAspect     = spnrVertical.getValue();
                    spnrHorizontal.setValue(1);
                    spnrVertical.setValue(1);
                } else {
                    spnrHorizontal.setValue( lastValueHorizontalAspect );
                    spnrVertical.setValue( lastValueVerticalAspect );
                }
            },
            margins: { top: 0, right: 0, bottom: 10, left: 4 },
            width: 236
        });

        /////////////////////////////////////
        //      Back-end Configuration     //
        /////////////////////////////////////

        var resizableImage;

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
                    if ( errors[0].indexOf('The report session is invalid') < 0 ){

                        LABKEY.ext.GeneExpressionExplorer_Lib.onFailure({
                            exception: errors.join('\n')
                        });
                    } else {
                        LABKEY.Report.createSession({
                            clientContext : 'GeneExpressionExplorer',
                            failure: LABKEY.ext.GeneExpressionExplorer_Lib.onFailure,
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
                        $('#' + imgId).wrap('<a class=\'fancybox\' data-fancybox-type=\'image\' href=\'' + p.value + '\' />');

                        Ext.QuickTips.register({
                            target: imgId,
                            text: 'Click on the generated plot to see it in full screen'
                        });
                    }

                    console.log( result.outputParams[1] );
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var cntPlot = new Ext.Container({});

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
                        new Ext.Panel({
                            bodyStyle: 'padding: 4px;',
                            defaults: {
                                bodyStyle: 'padding: 4px;',
                                border: false
                            },
                            items: [
                                { items: chAspectRatio },
                                new Ext.Panel({
                                    items: [
                                        dfHorizontal,
                                        new Ext.Toolbar.Spacer({
                                            width: 10
                                        }),
                                        spnrHorizontal,
                                        new Ext.Toolbar.Spacer({
                                            width: 30
                                        }),
                                        dfVertical,
                                        new Ext.Toolbar.Spacer({
                                            width: 10
                                        }),
                                        spnrVertical
                                    ],
                                    layout: {
                                        align: 'middle',
                                        type: 'hbox'
                                    }
                                })
                            ],
                            style: 'padding-bottom: 4px;'
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

        this.cntPlot = cntPlot;

        LABKEY.ext.GeneExpressionExplorer.superclass.constructor.apply(this, arguments);

    }, // end constructor

    resize : function(){
        if ( typeof this.resizableImage != 'undefined' ){
            var width = this.cntPlot.getWidth();
            this.resizableImage.resizeTo( width, width * this.resizableImage.height / this.resizableImage.width );
        }
    }}); // end GeneExpressionExplorer Panel class

