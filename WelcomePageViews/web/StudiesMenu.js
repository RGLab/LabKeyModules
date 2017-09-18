// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 *  Copyright 2017 Fred Hutchinson Cancer Research Center
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

generateMenu = function(){
    var isPublic = LABKEY.user.isGuest && ! LABKEY.user.isSignedIn;

    LABKEY.Query.selectRows({
        containerPath: '/Home',
        failure: function(){ console.log( 'Could not fetch the contents for the Studies menu.' ); },
        schemaName: 'study',
        queryName: 'WPV_studies_with_status',
        success: function(d){
            if ( d.rows.length > 0 ){
                var toAdd = [];

                Ext.each( d.rows, function(row, i){
                    toAdd.push(
                        isPublic ?
                        '<a href="/project/home/Public/begin.view?SDY=' + row.Name + '"><li>' + row.Name + ( row.hipc_funded ? '*' : '' ) + '</li></a>' :
                        '<a href="/project/Studies/' + row.Name + '/begin.view?"><li>' + row.Name + ( row.hipc_funded ? '*' : '' ) + '</li></a>'
                    );
                });

                jQuery('#studies').empty();

                jQuery('#studies').append(
                    '<ul style="width: 130px; padding-left: 0px; margin-top: 0px; margin-bottom: 0px;">' +
                        '<a href="/project/Studies/begin.view?"><li>Data Finder</li></a>' +
                    '</ul>'
                );

                var input = jQuery('<input>').attr({
                    class: 'filterinput',
                    placeholder: 'Search...',
                    style: 'margin-top: 5px; margin-bottom: 5px; width: 130px;',
                    type: 'search'
                });

                jQuery.expr[':'].Contains = function(a,i,m){
                    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
                };

                jQuery('#studies').append( input );

                jQuery(input).on('keyup click input', function(){
                    var filter = jQuery(this).val(); // get the value of the input, which we filter on
                    jQuery('#list').find('li:not(:Contains(' + filter + '))').parent().hide();
                    jQuery('#list').find('li:contains(' + filter + ')').parent().show();
                });

                jQuery('#studies').append(
                    '<ul id="list" style="max-height: 400px; width: 130px; overflow-y: auto; padding-left: 0px; margin-top: 0px; margin-bottom: 0px;">' +
                    toAdd.join('') +
                    '</ul>' +
                    '<ul style="width: 130px; padding-left: 0px; margin-top: 0px; margin-bottom: 0px;">' +
                        '<div>* HIPC funded</div>' +
                    '</ul>'
                );
            }
        }
    });
}

