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

    onFailure: function( a, b, c ){
        this.myMask.hide();
        $('#ActiveModules' + this.config.webPartDivId + ' .placeholder').remove();
        LABKEY.ext.ISCore.onFailure( a, b, c);
    },

    constructor : function(config) {
        var me = this;
        me.config = config;

        ////////////////////////////////////
        //  Generate necessary HTML divs  //
        ////////////////////////////////////

        $('#' + config.webPartDivId).append(
            '<div id=\'ActiveModules' + config.webPartDivId + '\'>' +
                '<div class=\'placeholder\' style=\'height: 40px;\'></div>' +
            '</div>'
        );


        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        me.myMask = new Ext.LoadMask(
            $('#ActiveModules' + config.webPartDivId)[0],
            {
                msg: 'Please, wait, while the list of active modules is loading',
                msgCls: 'mask-loading'
            }
        );

        me.myMask.show();

        var activeModulesFilterArray = [
            LABKEY.Filter.create(
                'Name',
                LABKEY.container.activeModules.join(';'),
                LABKEY.Filter.Types.IN
            )
        ];

        LABKEY.Query.selectDistinctRows({
            column: 'Category',
            failure: me.onFailure.bind( me ),
            filterArray: activeModulesFilterArray,
            queryName: 'modules',
            schemaName: 'lists',
            success: function( d ){
                $('#ActiveModules' + config.webPartDivId + ' .placeholder').remove();

                Ext.each(
                    d.values,
                    function( e ){
                        $('#ActiveModules' + config.webPartDivId).append(
                            '<h3 id=\'category' + e + config.webPartDivId  + '\' class=\'bold-text\'>' + e + '</h3>'
                        );
                    } 
                );

                LABKEY.Query.selectRows({
                    columns: ['Category', 'Name', 'Title', 'Description'],
                    failure: me.onFailure.bind( me ),
                    filterArray: activeModulesFilterArray,
                    queryName: 'modules',
                    schemaName: 'lists',
                    success: function( d ){
                        me.myMask.hide();
                        Ext.each(
                            d.rows,
                            function( e ){
                                $('#category' + e.Category + config.webPartDivId).append(
                                    '<ul>' +
                                        '<div><a href=\'' +
                                            LABKEY.ActionURL.buildURL( e.Name, 'begin' ) +
                                        '\'>' + e.Title + '</a></div>' +
                                        (
                                            e.Description == null ?
                                            '' :
                                            '<div class=\'normal-text extra5pxPadding\'>' + e.Description + '</div>'
                                        ) +
                                    '</ul>'
                                );
                            }
                        )
                    }
                });               
            } 
        });


        me.border         = false;
        me.cls            = 'ISCore';
        me.contentEl      = 'ActiveModules' + config.webPartDivId;
        me.frame          = false;
        me.layout         = 'fit';
        me.renderTo       = config.webPartDivId;
        me.webPartDivId   = config.webPartDivId;
        me.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ActiveModules.superclass.constructor.apply(this, arguments);
    } // end constructor
}); // end ActiveModules Panel class
