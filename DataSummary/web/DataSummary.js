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

LABKEY.ext.DataSummary = Ext.extend( Ext.Panel, {

    onFailure: function(){
        this.myMask.hide();
        $('#Summary' + this.config.webPartDivId + ' .placeholder').remove();
        $('#Summary' + this.config.webPartDivId).append( this.errorCode );
    },

    constructor : function(config) {
        var me = this;
        me.config = config;

        ////////////////////////////////////
        //  Generate necessary HTML divs  //
        ////////////////////////////////////

        $('#' + config.webPartDivId).append(
            '<div id=\'Summary' + config.webPartDivId + '\'>' +
                '<div class=\'placeholder\' style=\'height: 40px;\'></div>' +
            '</div>'
        );


        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        me.errorCode = '<p style=\'margin-left: 30px; color: red;\'>Failed to retrieve the aggregate summary</p>';
        me.myMask = new Ext.LoadMask(
            $('#Summary' + config.webPartDivId)[0],
            {
                msg: 'Please, wait, while the aggregate summary table is loading',
                msgCls: 'mask-loading'
            }
        );

        me.myMask.show();

        LABKEY.Query.selectRows({
            failure: me.onFailure.bind( me ),
            queryName: 'studies',
            schemaName: 'study',
            success: function(d){
                var numStudies = d.rows.length;

                if ( numStudies == 0 ){
                    me.onFailure.bind( me )();
                } else {

                    LABKEY.Query.selectRows({
                        failure: me.onFailure.bind( me ),
                        queryName: 'totalSubjectCount',
                        schemaName: 'immport',
                        success: function(d){

                            var subjectCount = d.rows[0].subject_count;

                            LABKEY.Query.selectRows({
                                failure: me.onFailure.bind( me ),
                                queryName: 'aggregateSubjectCount',
                                schemaName: 'immport',
                                success: function(d){
                                    me.myMask.hide();

                                    $('#Summary' + config.webPartDivId + ' .placeholder').remove();

                                    $('#Summary' + config.webPartDivId).append(
                                        '<table class=\'labkey-data-region <!--labkey-show-borders--> full-width\'>' +
                                            '<tbody>' +
                                                '<tr>' +
                                                    '<td>Studies</td>' +
                                                    '<td style=\'white-space: nowrap;\' align=\'right\'>' + numStudies + '</td>' +
                                                '</tr><tr>' +
                                                    '<td rowspan=\'1\' colspan=\'2\'>&nbsp;</td>' +
                                                '</tr><tr>' +
                                                    '<td rowspan=\'1\' colspan=\'2\' align=\'center\'>Participants</td>' +
                                                '</tr>'
                                    );

                                    Ext.each( d.rows, function(row, i){
                                        $('#Summary' + config.webPartDivId + ' tbody').append(
                                            '<tr class=\'' + ( i%2 == 0 ? 'labkey-alternate-row' : 'labkey-row' ) + '\'>' +
                                                '<td>' + row.assay_type + '</td>' +
                                                '<td style=\'white-space: nowrap;\' align=\'right\'>' + row.subject_count + '</td>' +
                                            '</tr>'
                                        );
                                    });

                                    $('#Summary' + config.webPartDivId + ' tbody').append(
                                        '<tr>' +
                                            '<td rowspan=\'1\' colspan=\'2\' style=\'height: 5px;\'></td>' +
                                        '</tr><tr>' +
                                            '<td>Total</td>' +
                                            '<td style=\'white-space: nowrap;\' align=\'right\'>' + subjectCount + '</td>' +
                                        '</tr>'
                                    );
                                }
                            });

                        }
                    });
                }
            }
        });


        me.border         = false;
        me.cls            = 'ISCore';
        me.contentEl      = 'Summary' + config.webPartDivId;
        me.frame          = false;
        me.layout         = 'fit';
        me.renderTo       = config.webPartDivId;
        me.webPartDivId   = config.webPartDivId;
        me.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.DataSummary.superclass.constructor.apply(this, arguments);
    } // end constructor
}); // end DataSummary Panel class
