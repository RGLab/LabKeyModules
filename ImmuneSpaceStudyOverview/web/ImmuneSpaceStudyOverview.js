Ext.namespace('LABKEY.ext');

//start copypasta
            LABKEY.help.Tour.register({
                id: "immport-study-tour",
                steps: [
                    {
                        title: "Overview page",
                        content: "Overall information about the study.",
                        target: ".tab-nav-active",
                        placement: "left",
                        yOffset: -10,
                        xOffset: 20,
                        showNextButton: true,
                    },{
                        title: "Study overview",
                        content: "Overall summary about the study, objectives, protocols, conditions studied, etc.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Pubmed statistics",
                        content: "List of publications associated with this study as well as related papers suggested by PubMed.",
                        target: document.getElementsByClassName("labkey-wp")[1],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Subjects",
                        content: "Click on this tab to find out more about the subjects enrolled in this study.",
                        target: document.getElementsByClassName("tab-nav-inactive")[0],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 20,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=study.PARTICIPANTS");
                        }
                    },{
                        title: "Subject List",
                        content: "Lists all study participants. Clicking one of the subjects ID brings up information about the selected subject.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Demographics table",
                        content: "Table of basic demographics. It can be sorted and filtered to explore demographic data for all subjects enrolled in the study.",
                        target: document.getElementsByClassName("labkey-wp")[1],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Clinical and Assay Data",
                        content: "Click on this tab to find out more about the datasets generated in this study.",
                        target: document.getElementsByClassName("tab-nav-inactive")[1],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 10,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=study.DATA_ANALYSIS");
                        }
                    },{
                        title: "Data Views",
                        content: "The list of datasets available for this study. Click on a dataset name to explore the data in a grid.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Visualization",
                        content: "Selected datasets can be explored using the Data Explorer module.",
                        target: document.getElementsByClassName("labkey-wp")[1],
                        placement: "left",
                        showNextButton: true
                    },{
                        title: "Modules",
                        content: "Click on this tab to explore the datasets using standardized analyses modules.",
                        target: document.getElementsByClassName("tab-nav-inactive")[3],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 10,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=Modules");
                        }
                    },{
                        title: "Active Modules",
                        content: "List of active interactive modules available for this study. The list will vary depending on the data available and the type of study.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Reports",
                        content: "Click on this tab to explore additional analyses/reports.",
                        target: document.getElementsByClassName("tab-nav-inactive")[4],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 10,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=Reports");
                        }
                    },{
                        title: "Available reports",
                        content: "List of available reports for this study. The list vary depending on the data available and the type of study. Reports can be generic or tailored to the study.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top"
                    }
                ]

            });

//end copypasta


LABKEY.ext.ImmuneSpaceStudyOverview = Ext.extend( Ext.Panel, {
    constructor : function(config) {
        var SDY = LABKEY.container.title;
        var
            me = this,
            bs = '<span class=\'bold-text\'>',
            initialHTML =
                bs + "<a class='labkey-text-link' onClick='LABKEY.help.Tour.show(\"immport-study-tour\")'\">quick help</a><br></span><br>" + 
                bs + 'Principal Investigator: </span>' +
                '<span id=\'PI' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Title:</span> ' +
                '<span id=\'title' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Type:</span> ' + 
                '<span id=\'type' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Condition studied:</span> ' +
                '<span id=\'condition' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Brief description:</span> ' +
                '<span id=\'bdesc' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Start date:</span> ' +
                '<span id=\'start' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Description: </span>' +
                '<a id=\'showdesc' + config.webPartDivId + '\' class=\'show' + config.webPartDivId + '\'>show</a>' +
                '<span id=\'description' + config.webPartDivId + '\' style=\'display: none\'></span><div style=\'height: 1em;\'></div>' +
                bs + 'Objectives: </span>' +
                '<a id=\'showobj' + config.webPartDivId + '\' class=\'show' + config.webPartDivId + '\'>show</a>' +
                '<span id=\'objective' + config.webPartDivId + '\' style=\'display: none\'></span><div style=\'height: 1em;\'></div>' +
                bs + 'Endpoints: </span>' +
                '<a id=\'showend' + config.webPartDivId + '\' class=\'show' + config.webPartDivId + '\'>show</a>' +
                '<span id=\'endpoints' + config.webPartDivId + '\' style=\'display: none\'></span><div style=\'height: 1em;\'></div>' +
                bs + 'Number of subjects: </span>' +
                '<span id=\'subjects' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Sponsoring organization: </span>' +
                '<span id=\'organization' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'ImmPort accession number: </span>' +
                '<span id=\'immport' + config.webPartDivId + '\'></span></br></br>' +
                bs + 'Protocol documents: </span>' +
                '<a href="/_webdav/Studies/' + SDY + '/%40files/protocols/' + SDY + '_protocol.zip">  protocol.zip  </a>'
        ;

        $('#' + config.webPartDivId).append(
            '<div id=\'ImmuneSpaceStudyOverview' + config.webPartDivId + '\'>' + initialHTML + '</div>'
        );

        var toggle = function( link ){
            var el = $( '#' + link.id ).next()[0].style;

            if ( el.display == 'block' ){
                el.display = 'none';
                link.innerHTML = 'show';
            } else{
                el.display = 'block';
                link.innerHTML = 'hide';
            }
        };

        $( '.show' + config.webPartDivId ).click(
            function(){
                toggle( this );
            }
        );


        $('#immport' + config.webPartDivId)[0].innerHTML =
'<a href=\'https://immport.niaid.nih.gov/immportWeb/clinical/study/displayStudyDetails.do?itemList=' + SDY + '\' title=\'' + SDY + ' on ImmPort\' target=\'_blank\'>'+ SDY +'</a>'
      
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
            schemaName: 'immport',
            queryName: 'study',
            columns:  'brief_title, type, condition_studied, brief_description, actual_start_date,' +
                      ' description, objectives, endpoints, actual_enrollment, sponsoring_organization',
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

        //FUNCTIONS
        function onSuccessStudy(results) {
            if ( results.rows.length > 0 ){
                var row = results.rows[0];

                $('#title' + config.webPartDivId)[0].innerHTML          = row['brief_title'].value;
                $('#type' + config.webPartDivId)[0].innerHTML           = row['type'].value;
                $('#condition' + config.webPartDivId)[0].innerHTML      = row['condition_studied'].value;
                $('#bdesc' + config.webPartDivId)[0].innerHTML          = row['brief_description'].value;
                $('#start' + config.webPartDivId)[0].innerHTML          = row['actual_start_date'].value;
                $('#description' + config.webPartDivId)[0].innerHTML    = '<br>' + ( ! row['description'].value ? '' : row['description'].value );
                $('#objective' + config.webPartDivId)[0].innerHTML      = '<br>' + ( ! row['objectives'].value ? '' : row['description'].value );
                $('#endpoints' + config.webPartDivId)[0].innerHTML      = row['endpoints'].value;
                $('#subjects' + config.webPartDivId)[0].innerHTML       = row['actual_enrollment'].value;
                $('#organization' + config.webPartDivId)[0].innerHTML   = row['sponsoring_organization'].value;
            }
        };

        function onSuccessPI(results){
            var
                rows = results.rows,
                length = rows.length,
                PI = [];
            ;
            for ( var idxRow = 0; idxRow < length; idxRow ++ ){
                var row = rows[idxRow];
                PI.push(row['first_name'].value + ' ' + row['last_name'].value);
            }
            document.getElementById('PI' + config.webPartDivId).innerHTML = PI.join(', ');
        };

        function onError(errorInfo) {
            alert(errorInfo.exception);
        };

        me.border         = false;                                                                                                         
        me.cls            = 'ISCore';
        me.contentEl      = 'ImmuneSpaceStudyOverview' + config.webPartDivId;
        me.frame          = false;
        me.layout         = 'fit';
        me.renderTo       = config.webPartDivId;
        me.webPartDivId   = config.webPartDivId;
        me.width          = document.getElementById(config.webPartDivId).offsetWidth;

        LABKEY.ext.ImmuneSpaceStudyOverview.superclass.constructor.apply(this, arguments);
    } // end constructor
}); // end DataSummary Panel class

