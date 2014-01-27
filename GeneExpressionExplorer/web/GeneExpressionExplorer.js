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
            me          = this,
            maskPlot    = undefined,
            fieldWidth  = 400
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
                            cnfPlot.inputParams = {
                                cohorts:            Ext.encode( cbCohorts.getCheckedArray() ),
                                timePoint:          cbTimePoint.getValue(),
                                timePointDisplay:   cbTimePoint.getRawValue(),
                                genes:              Ext.encode( cbGenes.getValuesAsArray() )
                            };

                            setPlotRunning( true );

                            LABKEY.Report.execute( cnfPlot );
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

                    if ( p.type == 'image' ){
                        imgUrl = p.value;

                        cntPlot.update('<img src=\'' + p.value + '\' >');
                    }
                }
            }
        };


        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////

        var cntPlot = new Ext.Container({

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

