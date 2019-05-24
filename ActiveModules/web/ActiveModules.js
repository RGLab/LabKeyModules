// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 *  Copyright 2014 Fred Hutchinson Cancer Research Center
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

Ext.namespace('LABKEY.ext');

LABKEY.ext.ActiveModules = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        var cntMain = new Ext.Container({
            autoHeight: true,
            html: '<div class=\'placeholder\' style=\'height: 40px;\'></div>',
            layout: 'form',
            listeners: {
                afterrender: {
                    fn: function(){
                        var myMask = new Ext.LoadMask(
                            cntMain.getEl(),
                            {
                                msg: 'Please, wait, while the list of active modules is loading',
                                msgCls: 'mask-loading'
                            }
                        );

                        var onFailure = function( a, b, c ){
                            myMask.hide();
                            LABKEY.ext.ISCore.onFailure( a, b, c);
                        };

                        var generateActiveModules = function(){
                            var filters = [
                                LABKEY.Filter.create(
                                    'Name',
                                    LABKEY.container.activeModules.join(';'),
                                    LABKEY.Filter.Types.IN
                                ),
                                LABKEY.Filter.create(
                                    'Name',
                                    [
                                        'DataExplorer',
                                        'GeneExpressionExplorer',
                                        'GeneSetEnrichmentAnalysis',
                                        'ImmuneResponsePredictor',
                                        'DimensionReduction'
                                    ].join(';'),
                                    LABKEY.Filter.Types.IN
                                )
                            ];

                            LABKEY.Query.selectRows({
                                columns: [ 'Name', 'Label', 'Description' ],
                                failure: onFailure,
                                filterArray: filters,
                                queryName: 'modules',
                                schemaName: 'core',
                                success: function( d ){
                                    myMask.hide();

                                    if ( d.rows.length == 0 ){
                                        cntMain.getEl().mask(
                                            'There are no active modules enabled in this study.', 'infoMask'
                                        );
                                    } else {
                                        cntMain.update('');

                                        Ext.each(
                                            d.rows,
                                            function( e ){
                                                if ( ! LABKEY.ext.ISCore.isStudyFolder ){
                                                    LABKEY.Ajax.request({
                                                        method: 'GET',
                                                        url: LABKEY.ActionURL.buildURL(
                                                            'immport',
                                                            'containersformodule.api',
                                                            null,
                                                            {
                                                                name: e.Name
                                                            }
                                                        ),
                                                        failure: onFailure,
                                                        success: function(request){
                                                            var
                                                                data = JSON.parse( request.response ),
                                                                studies = Ext.pluck( data.result, 'name' ),
                                                                linkedStudies = []
                                                            ;
                                                            studies = studies.filter( function( study ){
                                                                if ( study === 'Studies' || study === 'SDY_template' ){
                                                                    return false;
                                                                } else{
                                                                    return true;
                                                                }
                                                            });
                                                            studies.sort( function( a, b ){
                                                                a = a.replace('SDY', '');
                                                                b = b.replace('SDY', '');
                                                                return Number(a)-Number(b)
                                                            });

                                                            var linkedStudies = [];
                                                            studies.forEach( function( study ){
                                                                linkedStudies.push(
                                                                    '<a href=\'' +
                                                                    LABKEY.ActionURL.buildURL(
                                                                        e.Name,
                                                                        'begin',
                                                                        LABKEY.ActionURL.getContainer() + '/' + study
                                                                    ) +
                                                                    '\'>' + study + '</a>');
                                                            });
                                                            $('.studies-' + e.Name).html( linkedStudies.length + ' available studies:</br>' +  linkedStudies.join(', '));
                                                        }
                                                    });
                                                }
                                                cntMain.add(
                                                    new Ext.Container({
                                                        html:
                                                            '<div>' +
                                                                '<div class=\'bold-text\'><a href=\"' +
                                                                    LABKEY.ActionURL.buildURL( e.Name, 'begin' ) +
                                                                '\">' + e.Label + '</a></div>' +
                                                                (
                                                                    e.Description == null ?
                                                                    '' :
                                                                    LABKEY.ext.ISCore.isStudyFolder ?
                                                                    '<div class=\'padding5px\'>' + e.Description + '</div>' :
                                                                    '<div style=\'padding: 5px 5px 0px 5px;\'>' + e.Description + '</div>' + '<div class=\'padding5px studies-' + e.Name  + '\'></div>' 
                                                                ) +
                                                            '</div>',
                                                        style: 'padding-bottom: 5px; padding-top: 5px;'
                                                    })
                                                );
                                            }
                                        );

                                        cntMain.doLayout();
                                    }
                                }
                            });
                        };

                        myMask.show();
                        if ( ! LABKEY.ext.ISCore.isStudyFolder ){
                            LABKEY.Ajax.request({
                                failure: onFailure,
                                method: 'GET',
                                success: function( request ){
                                    var response = JSON.parse( request.response );
                                    if ( response.data && response.data.containers.length ){
                                        generateActiveModules();
                                    } else {
                                        cntMain.update( '<div class=\'placeholder\' style=\'height: 40px;\'>No data available</div>' );
                                    }
                                },
                                url: LABKEY.ActionURL.buildURL( 'study-shared', 'getSharedStudyContainerFilter.api')
                            });
                        } else{
                            generateActiveModules();
                        }
                    },
                    single: true
                }
            }
        });

        this.border         = false;
        this.boxMinWidth    = 370;
        this.cls            = 'ISCore';
        this.frame          = false;
        this.items          = cntMain,
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ActiveModules.superclass.constructor.apply(this, arguments);
    } // end constructor
}); // end ActiveModules Panel class

