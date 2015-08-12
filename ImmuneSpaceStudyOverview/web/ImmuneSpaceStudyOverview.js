// vim: sw=4:ts=4:nu:nospell
/*
 Copyright 2014 Fred Hutchinson Cancer Research Center

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

LABKEY.ext.ImmuneSpaceStudyOverview = Ext.extend( Ext.Panel, {

    constructor : function(config) {

        /////////////////////////////////////
        //            Variables            //
        /////////////////////////////////////

        var
            SDY = LABKEY.container.title,
            dh  = Ext.DomHelper
        ;

        String.prototype.wpdi = function(){ return this + config.webPartDivId; };

        var
            me = this,
            spec =
                {
                    id: 'ImmuneSpaceStudyOverview'.wpdi(),
                    cn: [
                        {
                            cls: 'overview-spacing',
                            cn: [
                                {
                                    cls: 'labkey-text-link bold-text',
                                    html: 'quick help',
                                    onClick: 'LABKEY.help.Tour.show(\'immport-study-tour\')',
                                    tag: 'a'
                                }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                {
                                    cls: 'bold-text',
                                    html: 'Principal Investigator: ',
                                    tag: 'span'
                                },{
                                    id: 'PI'.wpdi(),
                                    tag: 'span'
                                }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Title: ',
                                        tag: 'span'
                                    },{
                                        id: 'title'.wpdi(),
                                        tag: 'span'
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Condition studied: ',
                                        tag: 'span'
                                    },{
                                        cls: 'paddingRight25px',
                                        id: 'condition'.wpdi(),
                                        tag: 'span'
                                    },{
                                        cls: 'bold-text',
                                        html: 'Number of subjects: ',
                                        tag: 'span'
                                    },{
                                        id: 'subjects'.wpdi(),
                                        tag: 'span'
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Brief description: ',
                                        tag: 'span'
                                    },{
                                        id: 'bdesc'.wpdi(),
                                        tag: 'span'
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Description: ',
                                        tag: 'span'
                                    },{
                                        cls: 'show'.wpdi(),
                                        html: 'show',
                                        id: 'showdesc'.wpdi(),
                                        tag: 'a'
                                    },{
                                        cls: 'hidden',
                                        id: 'description'.wpdi()
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Objectives: ',
                                        tag: 'span'
                                    },{
                                        cls: 'show'.wpdi(),
                                        html: 'show',
                                        id: 'showobj'.wpdi(),
                                        tag: 'a'
                                    },{
                                        cls: 'hidden',
                                        id: 'objective'.wpdi()
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Endpoints: ',
                                        tag: 'span'
                                    },{
                                        cls: 'show'.wpdi(),
                                        html: 'show',
                                        id: 'showend'.wpdi(),
                                        tag: 'a'
                                    },{
                                        cls: 'hidden',
                                        id: 'endpoints'.wpdi()
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Available datasets: ',
                                        tag: 'span'
                                    },{
                                        id: 'datasets'.wpdi(),
                                        tag: 'span'
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'Sponsoring organization: ',
                                        tag: 'span'
                                    },{
                                        id: 'organization'.wpdi(),
                                        tag: 'span'
                                    }
                            ]
                        },{
                            cls: 'overview-spacing',
                            cn: [
                                    {
                                        cls: 'bold-text',
                                        html: 'ImmPort accession number: ',
                                        tag: 'span'
                                    },{
                                        cls: 'paddingRight25px',
                                        href: 'http://open.immport.org/immport-open/public/study/study/displayStudyDetail/' + SDY,
                                        html: SDY,
                                        tag: 'a',
                                        target: '_blank',
                                        title: SDY + ' on ImmPort'
                                    },{
                                        id: 'GEO'.wpdi(),
                                        tag: 'span'
                                    }
                            ]
                        },{
                            id: 'assoc_studies'.wpdi()
                        },{
                            cls: 'bold-text',
                            html: 'Protocol documents: ',
                            tag: 'span'
                        },{
                            href: '/_webdav/Studies/' + SDY + '/%40files/protocols/' + SDY + '_protocol.zip',
                            html: 'protocol.zip',
                            tag: 'a'
                        }
                    ]
                }
        ;

        dh.append( ''.wpdi(), spec );

        $( '.show'.wpdi() ).click(
            function(){
                $( '#' + this.id ).next().toggleClass( 'hidden' );
            }
        );
      
        // QUERIES
        LABKEY.Query.selectRows({
            requiredVersion: 12.3,
            schemaName: 'immport',
            queryName: 'study_personnel',
            columns: 'first_name, last_name',
            filterArray: [
                LABKEY.Filter.create(
                    'role_in_study',
                    'Principal Investigator',
                    LABKEY.Filter.Types.EQUAL
                ),
                LABKEY.Filter.create(
                    'study_accession',
                    SDY,
                    LABKEY.Filter.Types.EQUAL
                )
            ],
            sort: 'study_accession',
            success: onSuccessPI,
            failure: onError
        });

        LABKEY.Query.selectRows({
            requiredVersion: 12.3,
            schemaName: 'study',
            queryName: 'datasets_ISSO',
            columns: 'Label',
            sort: 'Label',
            success: onSuccessDS,
            failure: onError
        });

        LABKEY.Query.selectRows({
            requiredVersion: 12.3,
            schemaName: 'immport',
            queryName: 'study',
            columns:  'brief_title, type, condition_studied, brief_description, actual_start_date, ' +
                      'description, objectives, endpoints, actual_enrollment, sponsoring_organization',
            filterArray: [
                LABKEY.Filter.create(
                    'study_accession',
                    SDY,
                    LABKEY.Filter.Types.EQUAL
                )
            ],
            success: onSuccessStudy,
            failure: onError
        });

        LABKEY.Query.selectRows({
            requiredVersion: 12.3,
            schemaName: 'immport',
            queryName: 'assocStudies',
            columns:  'study_accession',
            parameters: {$STUDY: SDY},
            success: onSuccessPubmedAssoc,
            failure: onError
        });

        LABKEY.Query.selectRows({
            requiredVersion: 12.3,
            schemaName: 'immport',
            queryName: 'study_link',
            columns:  'value',
            filterArray: [
                LABKEY.Filter.create(
                    'study_accession',
                    SDY,
                    LABKEY.Filter.Types.EQUAL
                ),
                LABKEY.Filter.create(
                    'name',
                    'Gene Expression Omnibus (GEO)',
                    LABKEY.Filter.Types.EQUAL
                )
            ],
            success: onSuccessGEO,
            failure: onError
        });

 
        //FUNCTIONS
        function onSuccessStudy(results) {
            if ( results.rows.length > 0 ){
                var row = results.rows[0];

                $('#title'.wpdi())[0].innerHTML          = row['brief_title'].value;
                $('#condition'.wpdi())[0].innerHTML      = row['condition_studied'].value;
                $('#bdesc'.wpdi())[0].innerHTML          = row['brief_description'].value;
                $('#description'.wpdi())[0].innerHTML    = ( ! row['description'].value ? '' : row['description'].value );
                $('#objective'.wpdi())[0].innerHTML      = ( ! row['objectives'].value ? '' : row['objectives'].value );
                $('#endpoints'.wpdi())[0].innerHTML      = row['endpoints'].value;
                $('#subjects'.wpdi())[0].innerHTML       = row['actual_enrollment'].value;
                $('#organization'.wpdi())[0].innerHTML   = row['sponsoring_organization'].value;

                LABKEY.Query.selectRows({
                    requiredVersion: 12.3,
                    schemaName: 'immport',
                    queryName: 'HIPCfundedStudies',
                    columns:  'study_accession',
                    filterArray: [LABKEY.Filter.create('study_accession', SDY, LABKEY.Filter.Types.EQUAL)],
                    success: onSuccessHIPCfund,
                    failure: onError
                });
            }
        };

        function onSuccessPI(results){
            var
                rows = results.rows,
                length = rows.length,
                PI = [];
            for ( var idxRow = 0; idxRow < length; idxRow ++ ){
                var row = rows[idxRow];
                PI.push(row['first_name'].value + ' ' + row['last_name'].value);
            }
            $('#PI'.wpdi())[0].innerHTML = PI.join(', ');
        };

        function onSuccessDS(results){
            var
                rows = results.rows,
                length = rows.length,
                datasets = [];
            for(var idxRow = 0; idxRow < length; idxRow++){
                var row = rows[idxRow];
                datasets.push(row['Label'].value);
            }
            $('#datasets'.wpdi())[0].innerHTML = datasets.join(', ');
        };

        function onSuccessHIPCfund(results){
            if(results.rows.length > 0){
              $('#organization'.wpdi())[0].innerHTML = $('#organization'.wpdi())[0].innerHTML + ' (HIPC funded)';
            }
        };

        function onSuccessPubmedAssoc(results){
            if ( results.rows.length > 0 ){
                var
                    assoc_SDY =  null,
                    toBuild =
                        [
                            {
                                cls: 'bold-text',
                                html: 'Associated ImmuneSpace studies:',
                                tag: 'span'
                            }
                        ]
                ;

                for ( var i = 0; i < results.rows.length; i ++ ){
                    assoc_SDY = results.rows[i]['study_accession'].value;

                    toBuild.push({
                        href: '/project/Studies/' + assoc_SDY + '/begin.view',
                        html: ' ' + assoc_SDY,
                        tag: 'a'
                    });
                }
                dh.append(
                    'assoc_studies'.wpdi(),
                    toBuild
                );
                $('#assoc_studies'.wpdi()).addClass( 'overview-spacing' );
            }
        };

        function onSuccessGEO(results){
            if (results.rows.length > 0){
                var GEO = [],
                    GEOlink,
                    GEOacc
                ;

                GEO.push('GEO accession:'.bold());
                for ( var idxRow = 0; idxRow < results.rows.length; idxRow ++ ){
                    GEOlink = results.rows[idxRow]['value'].value;
                    GEOacc = GEOlink.split("=")[1];
                    GEO.push( GEOacc.link( GEOlink ) );
                }
                $('#GEO'.wpdi())[0].innerHTML = GEO.join(' ');
            }
        };

        function onError(errorInfo) {
            alert(errorInfo.exception);
        };

        me.border         = false;                                                                                                         
        me.cls            = 'ISCore';
        me.contentEl      = 'ImmuneSpaceStudyOverview'.wpdi();
        me.frame          = false;
        me.layout         = 'fit';
        me.renderTo       = config.webPartDivId;
        me.webPartDivId   = config.webPartDivId;
        me.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ImmuneSpaceStudyOverview.superclass.constructor.apply(this, arguments);
    } // end constructor
}); // end ImmuneSpaceStudyOverviewDataSummary Panel class

