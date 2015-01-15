var studyTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-study-tour',
        steps: [{
            title: 'Welcome to Study ' + LABKEY.container.name,
            content: 'Please use this quick tour to learn how to explore study data and results using ImmuneSpace. You can always restart this tour by clicking on “QUICK HELP” available in the upper left corner below “Study Overview”.',
            target: '.labkey-folder-title',
            placement: 'bottom',
            showNextButton: true,
        },{
            title: 'Study Overview',
            content: 'Overall summary about the study, objectives, protocols, conditions studied etc.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'PubMed Statistics',
            content: 'List of publications associated with this study as well as related papers suggested by PubMed.',
            target: $('.labkey-wp')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Subjects',
            content: 'Click on this tab to find out more about the subjects enrolled in this study. Clicking "Next" will take you there as part of this tour',
            target: $('.tab-nav-inactive')[0],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=study.PARTICIPANTS');
            }
        },{
            title: 'Subject List',
            content: 'Lists all study participants. Clicking one of the subjects ID brings up information about the selected subject.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('?');
            }
        },{
            title: 'Demographics Table',
            content: 'Table of basic demographics. It can be sorted and filtered to explore demographic data for all subjects enrolled in the study.',
            target: $('.labkey-wp')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Clinical and Assay Data',
            content: 'Click on this tab to find out more about the datasets generated in this study. Clicking "Next" will take you there as part of this tour',
            target: $('.tab-nav-inactive')[1],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=study.DATA_ANALYSIS');
            }
        },{
            title: 'Data Views',
            content: 'The list of datasets available for this study. Click on a dataset name to explore the data in a grid.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=study.PARTICIPANTS');
            }

        },{
            title: 'Visualization',
            content: 'Selected datasets can be explored using the Data Explorer module.',
            target: $('.labkey-wp')[1],
            placement: 'left',
            yOffset: -15,
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Modules',
            content: 'Click on this tab to explore the datasets using standardized analyses modules. Clicking "Next" will take you there as part of this tour.',
            target: $('.tab-nav-inactive')[2],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=Modules');
            }
        },{
            title: 'Active Modules',
            content: 'List of active interactive modules available for this study. The list will vary depending on the data available and the type of study.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=study.DATA_ANALYSIS');
            }
        },{
            title: 'Reports',
            content: 'Click on this tab to explore additional analyses/reports. Clicking "Next" will take you there as part of this tour.',
            target: $('.tab-nav-inactive')[3],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=Reports');
            }
        },{
            title: 'Available Reports',
            content: 'List of available reports for this study. The list vary depending on the data available and the type of study. Reports can be generic or tailored to the study.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=Modules');
            }

        }]
    });

    if ( window.location.hash == '' ){
        LABKEY.help.Tour.autoShow( 'immport-study-tour' );
    } else{
        LABKEY.help.Tour.continueTour();
    }
}

