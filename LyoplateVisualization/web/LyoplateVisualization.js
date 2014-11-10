// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 *  Copyright 2012 Fred Hutchinson Cancer Research Center
 *
 *  Licensed under the Apache License, Version 2.0 (the 'License');
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

Ext.namespace('LABKEY.ext');

LABKEY.ext.LyoplateVisualization = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////
        var
            me                          = this,

            reportSessionId             = undefined,
            selectedAnalysisPath        = undefined,
            lastValueHorizontalAspect   = undefined,
            lastValueVerticalAspect     = undefined,
            listStudyVars               = [],

            flagGraphLoading            = undefined,
            flagProjectionSelect        = undefined,
            flagAnalysisSelect          = undefined,
            flagAnalysisLoadedFromDisk  = undefined,
            flagAnalysisLoadedFromDB    = undefined,
            fileNameFilter	            =
                LABKEY.Filter.create(
                    'name',
                    [],
                    LABKEY.Filter.Types.IN
                )
        ;


        /////////////////////////////////////
        //             Strings             //
        /////////////////////////////////////
        var strngErrorContactWithLink = ' Please, contact support, if you have questions.'


        ///////////////////////////////////
        //            Stores             //
        ///////////////////////////////////
        var strngSqlStartTable =    'SELECT' +
                                    ' DISTINCT FCSFiles.Name AS name,' +
                                    ' FCSFiles.RowId AS FileIdLink',
            strngSqlEndTable =      ' FROM FCSFiles' +
                                    ' WHERE FCSFiles.Run.FCSFileCount != 0 AND FCSFiles.Run.ProtocolStep = \'Keywords\''
            ;

        var strFilteredTable = new LABKEY.ext.Store({
            listeners: {
                load: onStrFilteredTableLoad,
                loadexception: function(p, o, r){
                    flagAnalysisLoadedFromDB = false;
                    onNoAnalysis();

                    if ( r.responseText.indexOf('Unknown field FCSFiles.Sample.') >= 0 ){
                        LABKEY.ext.Lyoplate.onFailure({
                            exception: 'Seems like the external metadata from the Sample Set associated with this folder\'s FCS files and this analysis has been removed, cannot proceed. </br>'
                        });
                    } else {
                        LABKEY.ext.Lyoplate.onFailure({
                            exception: r.responseText
                        });
                    }
                }
            },
//        nullRecord: {
//            displayColumn: 'myDisplayColumn',
//            nullCaption: '[other]'
//        },
            remoteSort: false,
            schemaName: 'flow',
            sortInfo: {
                field: 'name',
                direction: 'ASC'
            },
            sql: strngSqlStartTable + strngSqlEndTable
        });

        var strGatingSet = new LABKEY.ext.Store({
            autoLoad: true,
            listeners: {
                load: function(){
                    onNoAnalysis();

                    selectedAnalysisPath = undefined;

                    if ( this.getCount() < 1 ){
                        // disable all
                        pnlTabs.getEl().mask('Seems like there are no analyses to visualize, you need to import or create one.' + strngErrorContactWithLink, 'infoMask');
                        cbAnalysis.setDisabled( true );
                        pnlAnalysis.setDisabledViaClass( true );
                    } else {
                        pnlTabs.getEl().unmask();
                        cbAnalysis.setDisabled( false );
                        pnlAnalysis.setDisabledViaClass( false );
                    }
                },
                loadexception: LABKEY.ext.Lyoplate.onFailure
            },
            queryName: 'GatingSet',
            schemaName: 'opencyto_preprocessing'
        });

        var strParentPopulation = new LABKEY.ext.Store({
            listeners: {
                loadexception: LABKEY.ext.Lyoplate.onFailure
            },
            queryName: 'ParentPopulation',
            remoteSort: false,
            schemaName: 'opencyto_preprocessing',
            sortInfo: {
                field: 'Index',
                direction: 'ASC'
            }
        });

        var strProjection = new LABKEY.ext.Store({
            listeners: {
                load: function(){
                    var count = this.getCount();

                    if ( count == 1 ){
                        cbProjection.setValue( this.getAt(0).data.Projection );

                        setAxes();

                    } else if ( count > 1 ){
                        if ( cbParentPopulation.getValue() != '' ){
                            cbParentPopulation.blur();
                            cbProjection.focus();

                            cbXAxis.reset();
                            cbYAxis.reset();

                            manageTlbrGraph();

                            if ( ! cbProjection.isExpanded() ){
                                cbProjection.expand();
                            }
                        }
                    }
                },
                loadexception: LABKEY.ext.Lyoplate.onFailure
            },
            queryName: 'Projection',
            remoteSort: false,
            schemaName: 'opencyto_preprocessing',
            sortInfo: {
                field: 'Projection',
                direction: 'ASC'
            }
        });

        var strXAxis = new Ext.data.ArrayStore({
            data: [],
            fields: ['XChannel', 'XInclMarker']
        });

        var strYAxis = new Ext.data.ArrayStore({
            data: [],
            fields: ['YChannel', 'YInclMarker']
        });

        var strOverlay = new LABKEY.ext.Store({
            listeners: {
                loadexception: LABKEY.ext.Lyoplate.onFailure
            },
            queryName: 'Population',
            schemaName: 'opencyto_preprocessing',
            sortInfo: {
                field: 'Index',
                direction: 'ASC'
            }
        });

        /////////////////////////////////////
        //      Session instanciation      //
        /////////////////////////////////////
        LABKEY.Report.getSessions({
            success: function( responseObj ){
                var i, array = responseObj.reportSessions, length = array.length;
                for ( i = 0; i < length; i ++ ){
                    if ( array[i].clientContext == 'LyoplateVisualization' ){
                        reportSessionId = array[i].reportSessionId;
                        i = length;
                    }
                }
                if ( i == length ){
                    LABKEY.Report.createSession({
                        clientContext : 'LyoplateVisualization',
                        failure: LABKEY.ext.Lyoplate.onFailure,
                        success: function(data){
                            reportSessionId = data.reportSessionId;
                        }
                    });
                }
            }
        });

        /////////////////////////////////////
        //          CheckBoxes             //
        /////////////////////////////////////
        var chEnableBinning = new Ext.form.Checkbox({
            boxLabel: 'Enable binning',
            checked: true,
            ctCls: 'bold-text',
            handler: function(a,b) {
                if ( !b ){
                    pnlBin.hide();
                } else {
                    pnlBin.show();
                }
            },
            margins: { top: 0, right: 0, bottom: 10, left: 4 },
            width: 136
        });

        var chAspectRatio = new Ext.form.Checkbox({
            boxLabel: 'Control plot\'s aspect ratio',
            checked: true,
            ctCls: 'bold-text',
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

        var customOnRender = function(ct, position){
            Ext.form.Checkbox.superclass.onRender.call(this, ct, position);
            if(this.inputValue !== undefined){
                this.el.dom.value = this.inputValue;
            }
            this.wrap = this.el.wrap({cls: 'x-form-check-wrap' + ' ' + this.cls });
            if(this.boxLabel){
                this.wrap.createChild({tag: 'label', htmlFor: this.el.id, cls: 'x-form-cb-label', html: this.boxLabel});
            }
            if(this.checked){
                this.setValue(true);
            }else{
                this.checked = this.el.dom.checked;
            }
            // Need to repaint for IE, otherwise positioning is broken
            if (Ext.isIEQuirks) {
                this.wrap.repaint();
            }
            this.resizeEl = this.positionEl = this.wrap;
        };

        var chAppendFileName = new Ext.form.Checkbox({
            boxLabel: 'Append file name',
            cls: 'extra10pxPaddingLeft',
            hidden: true,
            hideLable: true,
            listeners: {
                check: manageTlbrGraph
            },
            onRender: customOnRender
        });

        var chEnableGrouping = new Ext.form.Checkbox({
            boxLabel: 'Enable grouping',
            checked: true,
            cls: 'extra10pxPaddingLeft',
            hidden: true,
            onRender: customOnRender
        });


        /////////////////////////////////////
        //     Slider/Radio-s/Spinners     //
        /////////////////////////////////////
        var tip = new Ext.slider.Tip({
            getText: function(thumb){
                return String.format('<b>hexbin parameter: {0}</b>', Math.pow(2, thumb.value + 5 ) );
            }
        });

        var sldrBin = new Ext.Slider({
            flex: 1,
            increment: 1,
            margins: { top: 0, right: 5, bottom: 0, left: 5 },
            minValue: 0,
            maxValue: 4,
            plugins: tip,
            value: 0
        });

        var factoryRadioCnf = function( i ){
            var val = Math.pow(2, i);
            return {
                boxLabel: String( val ),
                inputValue: val,
                name: 'bin',
                value: val,
                xtype: 'radio'
            };
        };

        var pnlBin = new Ext.Panel({
            defaults: {
                border: false,
                style: 'padding-right: 20px;'
            },
            items: [
                { items: Ext.apply( factoryRadioCnf(5), { checked: true } ) },
                { items: factoryRadioCnf(6) },
                { items: factoryRadioCnf(7) },
                { items: factoryRadioCnf(8) },
                { items: factoryRadioCnf(9) }
            ],
            layout: 'hbox'
        });

        var spnrHorizontal = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            fieldLabel: 'horizontal',
            listeners: {
                invalid: function(){ tlbrGraph.setDisabled( true ); },
                valid: manageTlbrGraph
            },
            maxValue: 10,
            minValue: 1,
            value: 1,
            width: 40
        });

        var spnrVertical = new Ext.ux.form.SpinnerField({
            allowBlank: false,
            fieldLabel: 'vertical',
            listeners: {
                invalid: function(){ tlbrGraph.setDisabled( true ); },
                valid: manageTlbrGraph
            },
            maxValue: 10,
            minValue: 1,
            value: 1,
            width: 40
        });


        /////////////////////////////////////
        //          ComboBoxes             //
        /////////////////////////////////////

        var cbAnalysis = new Ext.ux.form.ExtendedComboBox({
            displayField: 'Name',
            listeners: {
                change: function(){
                    if ( this.getValue() == '' ){
                        onNoAnalysis();
                    } else {
                        if ( ! flagAnalysisSelect ){
                            pnlParentPopulation.setDisabledViaClass( false );
                            cbParentPopulation.setDisabled( false );

                            loadData();
                        }
                    }
                },
                cleared: function(){
                    onNoAnalysis();
                },
                focus: function(){
                    flagAnalysisSelect = false;
                },
                select: function(){
                    flagAnalysisSelect = true;

                    pnlParentPopulation.setDisabledViaClass( false );
                    cbParentPopulation.setDisabled( false );

                    loadData();
                }
            },
            qtipField: 'Description',
            store: strGatingSet,
            valueField: 'Id'
        });

        var cbParentPopulation = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'Path',
            listeners: {
                blur: function(){
                    manageTlbrGraph();

                    if ( this.getValue() == '' ){
                        setDisabledControls( true );
                    } else {
                        setDisabledControls( false );

                        if( ! flagProjectionSelect ){
                            filterOverlay();
                            filterProjection();
                        }
                    }
                },
                change: function(){
                    manageTlbrGraph();

                    if ( this.getValue() == '' ){
                        setDisabledControls( true );
                    } else {
                        setDisabledControls( false );

                        if( ! flagProjectionSelect ){
                            filterOverlay();
                            filterProjection();
                        }
                    }
                },
                cleared: function(){
                    manageTlbrGraph();

                    setDisabledControls( true );
                },
                focus: function(){
                    flagProjectionSelect = false;
                },
                select: function(){
                    manageTlbrGraph();

                    setDisabledControls( false );

                    filterOverlay();
                    filterProjection();

                    flagProjectionSelect = true;
                }
            },
            store: strParentPopulation,
            valueField: 'Path'
        });

        var cbProjection = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'Projection',
            listeners: {
                change: setAxes,
                select: setAxes
            },
            store: strProjection,
            triggerAction: 'all',
            typeAhead: false,
            valueField: 'Projection'
        });

        var cbXAxis = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'XInclMarker',
            lastQuery: '',
            listeners:{
                beforequery: function(qe){
                    qe.combo.onLoad();
                    return false;
                },
                change:     xAxisHandler,
                cleared:    xAxisHandler,
                select:     xAxisHandler
            },
            store: strXAxis,
            valueField: 'XChannel'
        });

        var cbYAxis = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'YInclMarker',
            lastQuery: '',
            listeners:{
                beforequery: function(qe){
                    qe.combo.onLoad();
                    return false;
                },
                change:     yAxisHandler,
                cleared:    yAxisHandler,
                select:     yAxisHandler
            },
            store: strYAxis,
            valueField: 'YChannel'
        });

        var cbOverlay = new Ext.ux.form.ExtendedComboBox({
            disabled: true,
            displayField: 'Path',
            lastQuery: '',
            listeners:{
                beforequery: function(qe){
                    qe.combo.onLoad();
                    return false;
                }
            },
            onTrigger2Click : function(){
                this.collapse();
                this.clearValue();          // clear contents of combobox BUT DON'T REMOVE THE FILTER !
                this.fireEvent('cleared');  // send notification that contents have been cleared
            },
            store: strOverlay,
            valueField: 'Path'
        });

        /////////////////////////////////////
        //             Buttons             //
        /////////////////////////////////////
        var btnReset = new Ext.Button({
            disabled: true,
            handler: function(){
                var cols = pnlTable.getColumnModel();
                Ext.each( cols.columns, function(c, i){
                    cols.setHidden(i, false);
                });

                pnlTable.filters.clearFilters();
                Ext.each( pnlTable.filters.filters.items, function(f, i){
                    if ( i == 0 ){
                        f.setValue('');
                    } else {
                        f.menu.setSelected([]);
                    }
                });

                smCheckBox.selectAll();
            },
            text: 'Reset',
            tooltip: 'Reset the filtering and show hidden columns'
        });

        var btnGraph = new Ext.Button({
            disabled: true,
            handler: setPlotParameters,
            text: 'Graph',
            tooltip: 'Plot'
        });

        var btnSwap = new Ext.Button({
            disabled: true,
            handler: function(){
            var tempX = cbXAxis.getValue(),
                tempY = cbYAxis.getValue();
                cbXAxis.reset();
                cbYAxis.reset();
                cbXAxis.setValue( tempY );
                cbYAxis.setValue( tempX );

                manageTlbrGraph();

                strYAxis.filterBy(
                    function(record){
                        return record.get('YChannel') != tempY;
                    }
                );

                strXAxis.filterBy(
                    function(record){
                        return record.get('XChannel') != tempX;
                    }
                );
            },
            text: '<>',
            tooltip: 'Swap the axes values'
        });

        /////////////////////////////////////
        //             Web parts           //
        /////////////////////////////////////
        var cnfLoad = {
            failure: function( errorInfo, options, responseObj ){
                cbAnalysis.setDisabled(false);
                flagGraphLoading = false;
                maskGraph.hide();
                maskLoad.hide();

                flagAnalysisLoadedFromDisk = false;
                onNoAnalysis();

                LABKEY.ext.Lyoplate.onFailure(errorInfo, options, responseObj);
            },
            reportId: 'module:LyoplateVisualization/Load.R',
            success: function( result ){
                cbAnalysis.setDisabled(false);
                flagGraphLoading = false;
                maskGraph.hide();
                maskLoad.hide();

                var errors = result.errors;

                if (errors && errors.length > 0) {
                    /*
                     msg : errors[0].replace(/\n/g, '<P>'),
                     */

                    if ( errors[0].indexOf('The report session is invalid') < 0 ){

                        flagAnalysisLoadedFromDisk = false;
                        onNoAnalysis();

                        LABKEY.ext.Lyoplate.onFailure({
                            exception: errors[0]
                        });
                    } else {
                        LABKEY.Report.createSession({
                            clientContext : 'LyoplateVisualization',
                            failure: LABKEY.ext.Lyoplate.onFailure,
                            success: function(data){
                                reportSessionId = data.reportSessionId;

                                loadDataFromDisk();
                            }
                        });
                    }
                } else {
                    manageTlbrGraph();


                    flagAnalysisLoadedFromDisk = true;

                    if ( flagAnalysisLoadedFromDB ){
                        selectedAnalysisPath = cbAnalysis.getSelectedField( 'Path' );

                        cbAnalysis.triggerBlur();
                        cbParentPopulation.focus();
                        cbParentPopulation.expand();
                        cbParentPopulation.restrictHeight();
                    }
                }
            }
        };

        // Mask for the loading
        var maskLoad = undefined, maskGraph = undefined;

        var cnfGraph = {
            failure: function( errorInfo, options, responseObj ){
                manageTlbrGraph();
                maskGraph.hide();

                LABKEY.ext.Lyoplate.onFailure(errorInfo, options, responseObj);
            },
            inputParams: {},
            reportId: 'module:LyoplateVisualization/Plot.R',
            success: function( result ){
                manageTlbrGraph();
                maskGraph.hide();

                var errors = result.errors;
                var outputParams = result.outputParams;

                if (errors && errors.length > 0){
                    if ( errors[0].indexOf('The report session is invalid') < 0 ){
                        if ( errors[0].indexOf('must have only one flow frame per panel') < 0 ){
                            LABKEY.ext.Lyoplate.onFailure({
                                exception: errors.join('\n')
                            });

                            pnlGraphTemp.getEl().frame('ff0000');
                        } else {
                            Ext.Msg.alert('Error', 'The data chosen for plotting is such that rows (excluding the file names column) are not unique and so the plotting engine cannot proceed');
                        }
                    } else {
                        LABKEY.Report.createSession({
                            clientContext : 'LyoplateVisualization',
                            failure: LABKEY.ext.Lyoplate.onFailure,
                            success: function(data){
                                reportSessionId = data.reportSessionId;

                                tlbrGraph.setDisabled(true);
                                maskGraph.show();
                                cnfGraph.reportSessionId = reportSessionId;
                                LABKEY.Report.execute( cnfGraph );
                            }
                        });
                    }
                } else {
                    var p = outputParams[0];

                    if ( p && p.type == 'image' ){

                        var imgId = 'img' + config.webPartDivId;
                        pnlGraphTemp.update( '<img id=\'' + imgId + '\' src=\'' + p.value + '\' >' );

                        var width = pnlTopContainer.getWidth();
                        var height;
                        if ( ! chAspectRatio.getValue() ){
                            height = width;
                        } else {
                            height = width * spnrVertical.getValue() / spnrHorizontal.getValue();
                        }

                        resizableImage = new Ext.Resizable( imgId, {
                            disableTrackOver: true,
                            dynamic: true,
                            handles: 's',
                            height: height,
                            listeners: {
                                resize: function(){
                                    var widthToSet = pnlTopContainer.getWidth(), img = this.getEl().dom;
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
                }
            }
        };


        var resizableImage;

        /////////////////////////////////////
        //  Panels, Containers, Components //
        /////////////////////////////////////
        var dfHorizontal = new Ext.form.DisplayField({
            cls: 'bold-text',
            value: 'horizontal'
        });

        var dfVertical = new Ext.form.DisplayField({
            cls: 'bold-text',
            value: 'vertical'
        });

        var pnlOptions = new Ext.Panel({
            items:
                new Ext.Panel({
                    autoHeight: true,
                    border: false,
                    defaults: {
                        autoHeight: true,
                        columnWidth: 1,
                        hideMode: 'offsets'
                    },
                    items: [
                        new Ext.Panel({
                            bodyStyle: 'padding: 4px;',
                            defaults: {
                                bodyStyle: 'padding: 4px;',
                                border: false
                            },
                            items: [
                                { items: chEnableBinning },
                                pnlBin
                            ],
                            style: 'padding-bottom: 4px; padding-top: 4px;'
                        }),
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
                    layout: 'column',
                    style: 'padding-right: 4px; padding-left: 4px;',
                    title: 'Plot options:'
                }),
            layout: 'fit',
            tabTip: 'Options',
            title: 'Options'
        });

/////////////////////////////////////

        var tlbrGraph = new Ext.Toolbar({
            cls: 'white-background',
            defaults: {
                style: 'padding-top: 1px; padding-bottom: 1px;'
            },
            disabled: true,
            enableOverflow: true,
            items: [
                btnGraph,
                chAppendFileName,
                chEnableGrouping
            ]
        });

        var cnfPanel = {
            autoHeight: true,
            border: false,
            headerCssClass: 'simple-panel-header',
            headerStyle: 'padding-top: 0px;',
            layout: 'fit',
            style: 'padding-right: 4px; padding-left: 4px;'
        };

        var cnfSetDisabledViaClass = {
            setDisabledViaClass: function(bool){
                if ( bool ){
                    this.addClass('x-item-disabled');
                } else {
                    this.removeClass('x-item-disabled');
                }
            }
        };

        var pnlAnalysis = new Ext.Panel( Ext.apply({
            items: Ext.apply({
                items: cbAnalysis,
                title: 'Analysis'
            }, cnfPanel),
            listeners: {
                afterrender: {
                    fn: function(){
                        maskLoad = new Ext.LoadMask(
                            this.getEl(),
                            {
                                msg: 'Reading and loading the data...',
                                msgCls: 'mask-loading'
                            }
                        );
                    },
                    single: true
                }
            }
        }, cnfSetDisabledViaClass) );

        var pnlParentPopulation = new Ext.Panel( Ext.apply({
            cls: 'x-item-disabled',
            items: Ext.apply({
                items: cbParentPopulation,
                title: 'Parent population'
            }, cnfPanel)
        }, cnfSetDisabledViaClass) );

        var pnlProjection = new Ext.Panel( Ext.apply({
            cls: 'x-item-disabled',
            items: {
                border: false,
                headerCssClass: 'simple-panel-header',
                headerStyle: 'padding-top: 0px;',
                items: cbProjection,
                layout: 'fit',
                style: 'padding-right: 4px; padding-left: 4px;',
                title: 'Projection'
            },
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'end'
            }
        }, cnfSetDisabledViaClass) );

        var pnlAxes = new Ext.Panel( Ext.apply({
            cls: 'x-item-disabled',
            items: {
                border: false,
                defaults: {
                    border: false,
                    headerCssClass: 'simple-panel-header',
                    headerStyle: 'padding-top: 0px;',
                    style: 'padding-right: 4px; padding-left: 4px;'
                },
                items: [
                    {
                        flex: 1,
                        items: cbXAxis,
                        layout: 'fit',
                        title: 'X-Axis'
                    },
                    {
                        items: btnSwap,
                        title: '&nbsp'
                    },
                    {
                        flex: 1,
                        items: cbYAxis,
                        layout: 'fit',
                        title: 'Y-Axis'
                    }
                ],
                layout: {
                    type: 'hbox',
                    align: 'stretchmax'
                }
            },
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'end'
            }
        }, cnfSetDisabledViaClass) );

        var pnlOverlay = new Ext.Panel( Ext.apply({
            cls: 'x-item-disabled',
            items: {
                border: false,
                headerCssClass: 'simple-panel-header',
                headerStyle: 'padding-top: 0px;',
                items: cbOverlay,
                layout: 'fit',
                style: 'padding-right: 4px; padding-left: 4px;',
                title: 'Overlay set'
            },
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'end'
            }
        }, cnfSetDisabledViaClass) );

        var pnlPlotControls = new Ext.Panel({
            bbar: tlbrGraph,
            border: true,
            defaults: {
                border: false,
                height: 65,
                style: 'padding-bottom: 2px; padding-top: 2px;'
            },
            items: [
                {
                    defaults: {
                        border: false,
                        flex: 1,
                        height: 60,
                        layout: {
                            type: 'vbox',
                            align: 'stretch',
                            pack: 'end'
                        }
                    },
                    items: [
                        pnlAnalysis,
                        pnlParentPopulation
                    ],
                    layout: {
                        type: 'hbox',
                        align: 'stretchmax'
                    }
                },
                pnlProjection,
                pnlAxes,
                pnlOverlay
            ],
            listeners: {
                afterlayout: function(){
                    pnlParentPopulation.doLayout();
                }
            },
            minWidth: 186,
            plugins: [ new Ext.ux.MsgBus() ],
            region: 'center',
            title: 'Select analysis and gates'
        });

        pnlPlotControls.subscribe(
            'analysesReload',
            {
                fn:function(){
                    strGatingSet.reload();
                    onNoAnalysis();
                }
            }
        );


        var cmpTableStatus = new Ext.Component({
            cls: 'bold-text',
            html: '',
            listeners: {
                render: function(){
                    new Ext.ToolTip({
                        target: this.getEl(),
                        listeners: {
                            beforeshow: function(tip) {
                                var msg = this.getEl().dom.innerHTML;
                                tip.update( Ext.util.Format.htmlEncode( msg ) );
                                return (msg.length > 0);
                            },
                            scope: this
                        },
                        renderTo: document.body
                    });
                }
            }
        });

        cmpTableStatus.addClass( 'extra10pxPaddingLeft' ); // so that this class does not get propagated to the toolbar's overflow menu

        var smCheckBox = new Ext.grid.CheckboxSelectionModel({
            checkOnly: true,
            listeners: {
                selectionchange: function(){
                    updateTableStatus();

                    manageTlbrGraph();
                }
            },
            sortable: true
        });

        var tableMinimumWidth = 169;


        var tlbrTable = new Ext.Toolbar({
            cls: 'white-background',
            defaults: {
                style: 'padding-top: 1px; padding-bottom: 1px;'
            },
            enableOverflow: true,
            items: [ btnReset, cmpTableStatus ]
        });

        var pnlTable = new Ext.grid.GridPanel({
            bbar: tlbrTable,
            collapseMode: 'mini',
            collapsible: true,
            columnLines: true,
            columns: [],
            loadMask: {
                msg: 'Loading pheno data, please, wait...',
                msgCls: 'mask-loading'
            },
            listeners: {
                render: function(){
                    LABKEY.ext.Lyoplate.initTableQuickTips( this );
                    pnlTable.getView().el.hide();
                }
            },
            minWidth: tableMinimumWidth,
            monitorResize: true,
            plugins: [
                new Ext.ux.grid.AutoSizeColumns(),
                new Ext.ux.plugins.CheckBoxMemory({ idProperty: 'name' }),
                new Ext.ux.grid.GridFilters({
                    encode: false,
                    local: true
                })
            ],
            region: 'east',
            selModel: smCheckBox,
            split: true,
            store: strFilteredTable,
            stripeRows: true,
            title: 'Sub-select, filter and re-order study variables',
            useSplitTips: true,
            viewConfig: {
                columnsText: 'Show/hide columns',
                deferEmptyText: false,
                emptyText: 'No rows to display',
                splitHandleWidth: 10
            },
            width: this.determineTableWidth(
                tableMinimumWidth,
                this.tableRegularWidth,
                pnlPlotControls.minWidth,
                this.plotOptsRegularWidth,
                document.getElementById(config.webPartDivId).offsetWidth - 15
            )
        });

        var defaultGraphHTML = '<div id=\'wpGraph' + config.webPartDivId + '\' class=\'centered-text\' style=\'height: 30px\'></div>';

        var pnlGraphTemp = new Ext.Panel({
            border: true,
            html: defaultGraphHTML,
            listeners: {
                afterrender: {
                    fn: function(){
                        // Mask for the plot
                        maskGraph = new Ext.LoadMask(
                            this.getEl().dom.children[0],
                            {
                                msg: 'Generating the graphics, please, wait...',
                                msgCls: 'mask-loading'
                            }
                        );
                    },
                    single: true
                }
            }
        });

        var pnlTopContainer = new Ext.Panel({
            border: false,
            defaults: {
                autoScroll: true
            },
            height: 325,
            items: [
                pnlPlotControls,
                pnlTable
            ],
            layout: {
                type: 'border'
            }
        });

        var pnlVisualize = new Ext.Panel({
            defaults: {
                style: 'padding-bottom: 4px; padding-right: 4px; padding-left: 4px;'
            },
            items: [
                pnlTopContainer,
                pnlGraphTemp
            ],
            tabTip: 'Visualize',
            title: 'Visualize'
        });

        var pnlTabs = new Ext.TabPanel({
            activeTab: 0,
            autoHeight: true,
            defaults: {
                autoHeight: true,
                hideMode: 'offsets'
            },
            items: [ pnlVisualize, pnlOptions ],
            layoutOnTabChange: true,
            listeners: {
                tabchange: function( tabPanel, tab ){
                    if ( tab.title == 'Visualize' ){
                        me.pnlTable.setWidth(
                            me.determineTableWidth(
                                me.pnlTable.minWidth,
                                me.tableRegularWidth,
                                me.pnlPlotControls.minWidth,
                                me.plotOptsRegularWidth,
                                me.pnlTopContainer.getWidth() - 5
                            )
                        );
                    } else if ( tab.title == 'Options' ){
                        tab.doLayout();
                    }
                }
            },
            minTabWidth: 100,
            resizeTabs: true
        });


        /////////////////////////////////////
        //             Functions           //
        /////////////////////////////////////

        function loadDataFromDisk(){
            flagAnalysisLoadedFromDisk = undefined;
            flagGraphLoading = true;
            cbAnalysis.setDisabled(true);
            tlbrGraph.setDisabled(true);
            maskGraph.msg = 'Reading and loading the data, please, wait...';
            maskGraph.show();
            maskLoad.show();

            cnfLoad.reportSessionId = reportSessionId;
            LABKEY.Report.execute( cnfLoad );
        };

        function onStrFilteredTableLoad(){

            if ( flagAnalysisLoadedFromDisk == false ){
                return;
            }

            var curValue, newColumns;

            newColumns = [
                LABKEY.ext.Lyoplate.factoryRowNumberer( strFilteredTable ),
                smCheckBox,
                {
                    dataIndex: 'name',
                    dragable: false,
                    enableColumnMove: false,
                    filter: {
                        type: 'string'
                    },
                    header: 'File Name',
                    hideable: false,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        metaData.attr = 'ext:qtip=\'' + value + '\'';
                        return '<a href=\'' +
                            LABKEY.ActionURL.buildURL(
                                'flow-well',
                                'showWell',
                                null,
                                {
                                    wellId: record.get('FileIdLink')
                                }
                            ) +
                            '\' target=\'_blank\'>' + value + '</a>';
                    },
                    tooltip: 'File Name'
                }
            ];

            Ext.each( listStudyVars, function(r){
                curValue = r[1];

                newColumns.push({
                    dataIndex: curValue,
                    filter: {
                        options: strFilteredTable.collect( curValue ),
                        type: 'list'
                    },
                    header: r[0],
                    renderer: function( value, metaData, record, rowIndex, colIndex, store ){
                        metaData.attr = 'ext:qtip=\'' + value + '\'';
                        return value;
                    },
                    tooltip: r[0]
                });
            });

            pnlTable.reconfigure(
                strFilteredTable,
                new Ext.grid.CustomColumnModel({
                    columns: newColumns,
                    defaults: {
                        resizable: true,
                        sortable: true
                    },
                    disallowMoveBefore: 2,
                    getActiveColumnsDataIndices: function(){
                        var array = [],
                            cm = this,
                            cols = cm.columns,
                            len = cols.length
                            ;

                        for ( var i = cm.disallowMoveBefore; i < len; i ++ ){
                            if ( ! cols[i].hidden ){
                                array.unshift( LABKEY.QueryKey.decodePart( cols[i].dataIndex ) );
                            }
                        }

                        return array;
                    },
                    listeners: {
                        hiddenchange: manageTlbrGraph
                    }
                })
            );

            smCheckBox.selectAll();

            pnlTable.getView().el.show();
            btnReset.setDisabled(false);

            tlbrTable.add( cmpTableStatus );
            cmpTableStatus.show();
            tlbrTable.doLayout();

            flagAnalysisLoadedFromDB = true;

            if ( flagAnalysisLoadedFromDisk ){
                selectedAnalysisPath = cbAnalysis.getSelectedField( 'Path' );

                cbAnalysis.triggerBlur();
                cbParentPopulation.focus();
                cbParentPopulation.expand();
                cbParentPopulation.restrictHeight();
            }
        };

        function onNoAnalysis(){
            cbAnalysis.reset();

            cbParentPopulation.reset();

            pnlParentPopulation.setDisabledViaClass( true );
            cbParentPopulation.setDisabled( true );

            setDisabledControls( true );

            pnlGraphTemp.update( defaultGraphHTML );

            pnlTable.getView().el.hide();
            btnReset.setDisabled(true);

            tlbrTable.remove( cmpTableStatus, false );
            tlbrTable.getLayout().unhideItem( cmpTableStatus ); // neccesity
            cmpTableStatus.hide();
            tlbrTable.doLayout();

            manageTlbrGraph();
        };

        function filterOverlay(){
            var v = cbParentPopulation.getValue() + '/';

            cbOverlay.clearValue();

            strOverlay.filterBy(
                function(record){
                    if ( v == 'root/' ){
                        return record.get('Path') != 'root';
                    } else {
                        if ( record.get('Path').indexOf(v) < 0 ){
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            );
        };

        function filterProjection(){

            strProjection.setUserFilters([
                LABKEY.Filter.create(
                    'AnalysisId',
                    cbAnalysis.getValue()
                ),
                LABKEY.Filter.create(
                    'Path',
                    cbParentPopulation.getValue()
                )
            ]);

            strProjection.load();
        };

        function setDisabledControls(bool){
            if ( bool ){
                cbProjection.clearValue();
                cbXAxis.clearValue();
                cbYAxis.clearValue();
                cbOverlay.clearValue();
            }

            pnlProjection.setDisabledViaClass(bool);
            cbProjection.setDisabled(bool);

            pnlAxes.setDisabledViaClass(bool);
            cbXAxis.setDisabled(bool);
            cbYAxis.setDisabled(bool);
            btnSwap.setDisabled(bool);

            pnlOverlay.setDisabledViaClass(bool);
            cbOverlay.setDisabled(bool);
        };

        function loadData(){
            var AnalysisPath    = cbAnalysis.getSelectedField( 'Path'),
                AnalysisId      = cbAnalysis.getValue();

            if ( AnalysisPath != selectedAnalysisPath ){

                /////////////////////////////////////
                // Dispatch data loading from disk //
                /////////////////////////////////////
                cnfLoad.inputParams = {
                    gsPath: Ext.util.Format.undef( AnalysisPath )
                };

                loadDataFromDisk();
                /////////////////////////////////////


                flagAnalysisLoadedFromDB = undefined;

                // Filter populations by analysis id
                strParentPopulation.setUserFilters([
                    LABKEY.Filter.create(
                        'AnalysisId',
                        AnalysisId
                    )
                ]);
                strParentPopulation.load();

                strOverlay.setUserFilters([
                    LABKEY.Filter.create(
                        'AnalysisId',
                        AnalysisId
                    )
                ]);
                strOverlay.load();


                // Filter axes by analysis id
                var listAxes = [];

                LABKEY.Query.selectRows({
                    columns: ['Display', 'Key', 'AnalysisId'],
                    failure: function(e, r, o){
                        flagAnalysisLoadedFromDB = false;
                        onNoAnalysis();

                        LABKEY.ext.Lyoplate.onFailure(e, r, o);
                    },
                    filterArray: [
                        LABKEY.Filter.create( 'AnalysisId', AnalysisId )
                    ],
                    queryName: 'Axes',
                    schemaName: 'opencyto_preprocessing',
                    success: function(data){
                        Ext.each(
                            data.rows,
                            function( r ){
                                listAxes.push( [ r.Key, r.Display ] );
                            }
                        );

//                        listAxes.sort();

                        listAxes.unshift( ['Time', 'Time'] );

                        strXAxis.loadData( listAxes );
                        strYAxis.loadData( listAxes );
//                        listAxis.unshift( ['[histrogram]'] );

                        // Filter sample file names by analysis id
                        LABKEY.Query.selectRows({
                            columns: ['name, AnalysisId'],
                            failure: function(e, r, o){
                                flagAnalysisLoadedFromDB = false;
                                onNoAnalysis();

                                LABKEY.ext.Lyoplate.onFailure(e, r, o);
                            },
                            filterArray: [
                                LABKEY.Filter.create( 'AnalysisId', AnalysisId )
                            ],
                            queryName: 'AnalysisFiles',
                            schemaName: 'opencyto_preprocessing',
                            success: function(data){
                                var tempArray = [];
                                Ext.each( data.rows, function(r){ tempArray.push( r.name ); } );
                                fileNameFilter =
                                    LABKEY.Filter.create(
                                        'name',
                                        tempArray.join(';'),
                                        LABKEY.Filter.Types.IN
                                    );

                                filterStudyVarsAndLoadTableSource( AnalysisId );
                            }
                        });
                    }
                });

            } else {
                filterStudyVarsAndLoadTableSource( AnalysisId );
            }
        }; // end of loadData()

        function filterStudyVarsAndLoadTableSource( AnalysisId ){
            // Filter study variables by analysis id and reload the table source
            LABKEY.Query.selectRows({
                columns: [ 'StudyVarId', 'StudyVarName', 'AnalysisId' ],
                failure: function(e, r, o){
                    flagAnalysisLoadedFromDB = false;
                    onNoAnalysis();

                    LABKEY.ext.Lyoplate.onFailure(e, r, o);
                },
                filterArray: [
                    LABKEY.Filter.create( 'AnalysisId', AnalysisId )
                ],
                queryName: 'StudyVars',
                schemaName: 'opencyto_preprocessing',
                success: function(data){
                    var toAdd, curVal;

                    listStudyVars = [];

                    Ext.each( data.rows, function(r){
                        curVal = r.StudyVarName;
                        if ( curVal.slice(0,1) == 'R' ){ // Keyword study variable, starts with 'Row'
                            toAdd = curVal.slice(14);
                            curVal = LABKEY.QueryKey.encodePart( curVal ); // need to encode for Labkey to consume
                            listStudyVars.push([
                                toAdd + ' (Keyword)',
                                curVal,
                                'CAST( FCSFiles.Keyword."' + toAdd + '" AS VARCHAR ) AS "' + curVal + '"'
                            ]);
                        } else if ( curVal.slice(0,1) == 'S' ){ // External study variable, starts with 'Sample'
                            toAdd = curVal.slice(7);
                            curVal = LABKEY.QueryKey.encodePart( curVal ); // need to encode for Labkey to consume
                            listStudyVars.push([
                                toAdd + ' (External)',
                                curVal,
                                'CAST( FCSFiles.Sample."' + toAdd + '" AS VARCHAR ) AS "' + curVal + '"'
                            ]);
                        }
                        else {
                            LABKEY.ext.Lyoplate.onFailure({
                                exception: 'there was an error while executing this command: data format mismatch.'
                            });
                        }
                    });

                    var tempSQL = strngSqlStartTable;

                    Ext.each( listStudyVars, function(r){
                        tempSQL += ', ' + r[2];
                    });

                    tempSQL += strngSqlEndTable;

                    strFilteredTable.setSql( tempSQL );
                    strFilteredTable.setUserFilters( [ fileNameFilter ] );
                    strFilteredTable.load();
                }
            });
        };

        function xAxisHandler(){
            cbProjection.clearValue();

            manageTlbrGraph();

            strYAxis.filterBy(
                function(record){
                    return record.get('YChannel') != cbXAxis.getValue();
                }
            );

            if ( cbXAxis.getRawValue() == cbYAxis.getRawValue() ){
                cbYAxis.clearValue();
            }
        };

        function yAxisHandler(){
            cbProjection.clearValue();

            manageTlbrGraph();

            strXAxis.filterBy(
                function(record){
                    return record.get('XChannel') != cbYAxis.getValue();
                }
            );

            if ( cbYAxis.getRawValue() == cbXAxis.getRawValue() ){
                cbXAxis.clearValue();
            }
        };

        function manageTlbrGraph(){
            // Overlay combo control logic
            var tlbrGraphLayout = tlbrGraph.getLayout();

            var bool = false;
            if ( cbYAxis.getValue() == '' || cbXAxis.getValue() == '' ){
                bool = true;
            }
            if ( bool ){
                cbOverlay.clearValue();
            }
            pnlOverlay.setDisabledViaClass( bool );
            cbOverlay.setDisabled( bool );

            // Logic to enable or disable the graphing controls
            if (
                ! flagGraphLoading && cbAnalysis.getValue() != '' && cbParentPopulation.getValue() != '' &&
                (
                    ( cbXAxis.getValue() != '' && cbXAxis.getValue() != 'Time' ) ||
                    ( cbXAxis.getValue() == 'Time' && cbYAxis.getValue() != '' )
                ) &&
                smCheckBox.getCount() > 0 &&
                spnrHorizontal.isValid() &&
                spnrVertical.isValid()
            ){
                tlbrGraph.setDisabled(false);

                // Logic to show/hide the extra graphing controls (I)
                var studyVarsArray = pnlTable.getColumnModel().getActiveColumnsDataIndices();

                if ( studyVarsArray.length <= 1 ){ // 'File Name' only should be present

                    tlbrGraph.remove( chAppendFileName, false );
                    tlbrGraph.remove( chEnableGrouping, false );
                    tlbrGraphLayout.unhideItem( chAppendFileName ); // neccesity
                    tlbrGraphLayout.unhideItem( chEnableGrouping ); // neccesity
                    chAppendFileName.hide();
                    chEnableGrouping.hide();
                    tlbrGraph.doLayout();

                } else { // 'File Name' and other study vars present
                    if ( ! tlbrGraph.items.contains( chAppendFileName ) ){
                        tlbrGraph.insert( 1, chAppendFileName );
                        chAppendFileName.setDisabled(false);
                        chAppendFileName.show();
                    } else {
                        tlbrGraphLayout.unhideItem( chAppendFileName ); // needed custom behavior
                        if ( tlbrGraphLayout.more ){
                            tlbrGraphLayout.more.destroy();
                            delete tlbrGraphLayout.more;
                        }
                    }

                    if ( ! chAppendFileName.getValue() ){
                        studyVarsArray.remove( 'name' );
                    }

                    if ( studyVarsArray.length == 1 && ! chAppendFileName.getValue() ){
                        tlbrGraph.remove( chEnableGrouping, false );
                        tlbrGraphLayout.unhideItem( chEnableGrouping ); // neccesity
                        chEnableGrouping.hide();
                    } else {
                        if ( ! tlbrGraph.items.contains( chEnableGrouping ) ){
                            tlbrGraph.insert( 2, chEnableGrouping );
                            chEnableGrouping.setDisabled(false);
                            chEnableGrouping.show();
                        }
                    }

                    tlbrGraph.doLayout();
                }
            } else {
                tlbrGraph.setDisabled(true);

                // Logic to show/hide the extra graphing controls (II)

                tlbrGraph.remove( chAppendFileName, false );
                tlbrGraph.remove( chEnableGrouping, false );
                tlbrGraphLayout.unhideItem( chAppendFileName ); // neccesity
                tlbrGraphLayout.unhideItem( chEnableGrouping ); // neccesity
                chAppendFileName.hide();
                chEnableGrouping.hide();
                tlbrGraph.doLayout();
            }
        };

        function updateTableStatus(){
            var selectedCount = smCheckBox.getCount();

            if ( selectedCount == 1 ){
                cmpTableStatus.update( selectedCount + ' file is currently selected' );
            } else {
                cmpTableStatus.update( selectedCount + ' files are currently selected' );
            }
        };

        function setAxes(){
            cbXAxis.reset();
            cbYAxis.reset();

            var axes = cbProjection.getValue().split(' / ');

            cbXAxis.setValue(
                cbXAxis.findRecord(
                    cbXAxis.displayField
                  , axes[0]
                ).get( cbXAxis.valueField )
            );

            cbYAxis.setValue(
                cbYAxis.findRecord(
                    cbYAxis.displayField
                  , axes[1]
                ).get( cbYAxis.valueField )
            );

            strXAxis.filterBy(
                function(record){
                    return record.get('XChannel') != cbYAxis.getValue();
                }
            );

            strYAxis.filterBy(
                function(record){
                    return record.get('YChannel') != cbXAxis.getValue();
                }
            );

            manageTlbrGraph();
        };

        function setPlotParameters() {
            cnfGraph.inputParams.groupingSeparator = chEnableGrouping.getValue() ? '+' : ':';

            if ( chEnableBinning.getValue() ){
                var loopVar;
                for ( var i = 0; i < pnlBin.items.length; i ++ ){
                    loopVar = pnlBin.items.items[i].items.items[0];
                    if ( loopVar.checked ){
                        cnfGraph.inputParams.xbin = loopVar.inputValue;
                        i = pnlBin.items.length - 1;
                    }
                }
            } else {
                cnfGraph.inputParams.xbin = 0;
            }

            var filesNames = [];
            Ext.each( smCheckBox.getSelections(), function( record ){
                filesNames.push( record.data.name );
            } );

            var studyVarsArray = pnlTable.getColumnModel().getActiveColumnsDataIndices();
            if ( ! chAppendFileName.getValue() ){
                studyVarsArray.remove( 'name' );
            }

            cnfGraph.inputParams.imageWidth = pnlTopContainer.getWidth();
            cnfGraph.inputParams.imageHeight = cnfGraph.inputParams.imageWidth *
                ( chAspectRatio.getValue() ? spnrVertical.getValue() / spnrHorizontal.getValue() : 1 );

            Ext.apply( cnfGraph.inputParams, {
                studyVars:  Ext.encode( studyVarsArray ),
                filesNames: Ext.encode( filesNames ),
                population: cbParentPopulation.getValue(),
                overlay:    cbOverlay.getValue(),
                xAxis:      cbXAxis.getValue(),
                yAxis:      cbYAxis.getValue(),
                xLab:       cbXAxis.getRawValue(),
                yLab:       cbYAxis.getRawValue(),
                gsPath:     cbAnalysis.getSelectedField( 'Path' )
            });

            if ( filesNames.length > 30 ){
                Ext.Msg.show({
                    title:'Proceed?',
                    closable: false,
                    msg:'You chose ' + filesNames.length + ' files to plot.<br />' +
                            'This may take longer than you expect.<br />' +
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
        };

        function renderPlot(){
            maskGraph.msg = 'Generating the graphics...';

            tlbrGraph.setDisabled(true);
            maskGraph.show();
            cnfGraph.reportSessionId = reportSessionId;
            LABKEY.Report.execute( cnfGraph );
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
                        reportId: 'module:LyoplateVisualization/reports/schemas/Plot.R',
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
        this.cls            = 'lyoplate';
        this.frame          = false;
        this.items          = pnlTabs;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        this.pnlTable               = pnlTable;
        this.pnlTopContainer        = pnlTopContainer;
        this.pnlPlotControls        = pnlPlotControls;
        this.pnlParentPopulation    = pnlParentPopulation;

        LABKEY.ext.LyoplateVisualization.superclass.constructor.apply(this, arguments);

    }, // end constructor

    determineTableWidth : function( tableMinimumWidth, tableRegularWidth, plotOptsMinimumWidth, plotOptsRegularWidth, referenceWidth ){
        if ( referenceWidth >= 2 * tableRegularWidth ){
            return referenceWidth / 2;
        } else if ( referenceWidth >= tableRegularWidth + plotOptsRegularWidth ){
            return tableRegularWidth;
        } else if ( referenceWidth >= tableMinimumWidth + plotOptsRegularWidth ) {
            return referenceWidth - plotOptsRegularWidth;
        } else if ( referenceWidth >= tableMinimumWidth + plotOptsMinimumWidth ) {
            return tableMinimumWidth;
        }
    },

    tableRegularWidth : 465,
    plotOptsRegularWidth : 290,

    resize : function(){

        this.pnlTable.setWidth(
            this.determineTableWidth(
                this.pnlTable.minWidth,
                this.tableRegularWidth,
                this.pnlPlotControls.minWidth,
                this.plotOptsRegularWidth,
                this.pnlTopContainer.getWidth() - 5
            )
        );
        this.pnlParentPopulation.doLayout();
        this.pnlTopContainer.doLayout();
        this.pnlTable.getView().refresh();

        if ( typeof this.resizableImage != 'undefined' ){
            var width = this.pnlTopContainer.getWidth();
            this.resizableImage.resizeTo( width, width * this.resizableImage.height / this.resizableImage.width );
        }
    }
}); // end LyoplateVisualization Panel class

// Trigger validation on spinner clicks
Ext.override( Ext.ux.form.SpinnerField, {
    listeners: {
        spin: function(){ this.validate(); }
    }
});
