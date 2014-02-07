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

LABKEY.ext.ImmuneSpace_Summary = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        ////////////////////////////////////
        //  Generate necessary HTML divs  //
        ////////////////////////////////////

        $('#' + config.webPartDivId).append(
            '<div id=\'Summary' + config.webPartDivId + '\'></div>'
        );


        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var errorCode = '<p style=\'margin-left: 30px; color: red;\'>Failed to retrieve the aggregate summary</p>';
        var myMask = new Ext.LoadMask(
            $('#Summary' + config.webPartDivId)[0],
            {
                msg: 'Please, wait, while the aggregate<br/> summary table is loading',
                msgCls: 'mask-loading'
            }
        );

        myMask.show();

        // FOR EXTERNAL USE:
        /*    LABKEY.contextPath = '';
         LABKEY.container = {};
         LABKEY.container.path = '/home';*/

        LABKEY.Query.selectRows({
            failure: function(a, b, c){
                myMask.hide();
                $('#Summary' + config.webPartDivId).append( errorCode );
            },
            success: function(d){
                var numStudies = d.rows.length, filterString = [];

                if ( numStudies == 0 ){
                    myMask.hide();
                    $('#Summary' + config.webPartDivId).append( errorCode );
                } else {

                    Ext.each( d.rows, function(row, i){
                        filterString.push( '\'' + row.Name + '\'' );
                    });

                    filterString = '(' + filterString.join(',') + ')';

                    var sqlAggregateCounts =
                        'SELECT' +
                        ' result AS assay_type,' +
                        ' CAST( SUM(subject_count) AS INTEGER ) AS subject_count ' +
                        'FROM' +
                        ' summaryResults ' +
                        'WHERE' +
                        ' study_accession IN ' + filterString + ' ' +
                        'GROUP BY' +
                        ' result';

                    var sqlParticipantsCount =
                        'SELECT' +
                        ' COUNT(*) AS participants_count ' +
                        'FROM' +
                        ' subject ' +
                        'LEFT JOIN arm_2_subject arm2sub ON subject.subject_accession = arm2sub.subject_accession ' +
                        'LEFT JOIN arm_or_cohort arm ON arm2sub.arm_accession = arm.arm_accession ' +
                        'WHERE' +
                        ' study_accession IN ' + filterString + ' ' +
                        '';

                    LABKEY.Query.executeSql({
                        failure: function(){
                            myMask.hide();
                            $('#Summary' + config.webPartDivId).append( errorCode );
                        },
                        success: function(d){

                            var participantsCount = d.rows[0].participants_count;

                            LABKEY.Query.executeSql({
                                failure: function(){
                                    myMask.hide();
                                    $('#Summary' + config.webPartDivId).append( errorCode );
                                },
                                success: function(d){

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
                                            '<td style=\'white-space: nowrap;\' align=\'right\'>' + participantsCount + '</td>' +
                                        '</tr>'
                                    );

                                    myMask.hide();
                                },
                                sql: sqlAggregateCounts,
                                schemaName: 'immport'
                            });

                        },
                        sql: sqlParticipantsCount,
                        schemaName: 'immport'
                    });
                }
            },
            containerFilter: LABKEY.Query.containerFilter.allFolders,
            queryName: 'studies',
            schemaName: 'study'
        });


        this.border         = false;
        this.cls            = 'immunespace_summary';
        this.contentEl      = 'Summary' + config.webPartDivId,
        this.frame          = false;
        this.layout         = 'fit';
        this.renderTo       = config.webPartDivId;
        this.webPartDivId   = config.webPartDivId;
        this.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ImmuneSpace_Summary.superclass.constructor.apply(this, arguments);
    } // end constructor
}); // end ImmuneSpace_Summary Panel class

function loadData(){};
