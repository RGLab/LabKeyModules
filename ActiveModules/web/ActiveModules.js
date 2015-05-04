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

                        myMask.show();

                        var activeModulesFilterArray = [
                            LABKEY.Filter.create(
                                'Name',
                                LABKEY.container.activeModules.join(';'),
                                LABKEY.Filter.Types.IN
                            )
                        ];

                        var onFailure = function( a, b, c ){
                            myMask.hide();
                            LABKEY.ext.ISCore.onFailure( a, b, c);
                        };

                        LABKEY.Query.selectDistinctRows({
                            column: 'Category',
                            failure: onFailure,
                            filterArray: activeModulesFilterArray,
                            queryName: 'modules',
                            schemaName: 'lists',
                            success: function( d ){
                                var categories = d.values;

                                LABKEY.Query.selectRows({
                                    columns: ['Category', 'Name', 'Title', 'Description'],
                                    failure: onFailure,
                                    filterArray: activeModulesFilterArray,
                                    queryName: 'modules',
                                    schemaName: 'lists',
                                    success: function( d ){
                                        myMask.hide();

                                        if ( categories.length == 0 ){
                                            cntMain.getEl().mask(
                                                'There are no active modules enabled in this study.', 'infoMask'
                                            );
                                        } else {
                                            cntMain.update('');

                                            var objects = [];
                                            Ext.each(
                                                categories,
                                                function( e ){
                                                    objects.push(
                                                        new Ext.form.FieldSet({
                                                            autoScroll: true,
                                                            id: 'category' + e + config.webPartDivId,
                                                            style: 'margin-bottom: 0px; margin-top: 5px; margin-left: 0px; margin-right: 0px;',
                                                            title: e
                                                        })
                                                    );
                                                } 
                                            );
                                            cntMain.add( objects );

                                            Ext.each(
                                                d.rows,
                                                function( e ){
                                                    var category = Ext.getCmp( 'category' + e.Category + config.webPartDivId );
                                                    category.add(
                                                        new Ext.Container({
                                                            html:
                                                                '<div>' +
                                                                    '<div class=\'bold-text\'><a href=\"' +
                                                                        LABKEY.ActionURL.buildURL( e.Name, 'begin' ) +
                                                                    '\">' + e.Title + '</a></div>' +
                                                                    (
                                                                        e.Description == null ?
                                                                        '' :
                                                                        '<div class=\'padding5px\'>' + e.Description + '</div>'
                                                                    ) +
                                                                '</div>',
                                                            style: 'padding-bottom: 4px; padding-top: 4px;'
                                                        })
                                                    );
                                                }
                                            );

                                            cntMain.doLayout();
                                        }
                                    }
                                });               
                            } 
                        });                       
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
