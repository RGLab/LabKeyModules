var studyTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-study-tour',
        steps: [{
            title: 'Welcome to Study ' + LABKEY.container.name,
            content: 'Please use this quick tour to learn how to explore study data and results using ImmuneSpace. You can always restart this tour by clicking on “QUICK HELP” available in the upper left corner below “Study Overview”.',
            target: '.lk-body-title',
            placement: 'bottom',
            showNextButton: true,
        },{
            title: 'Study Overview',
            content: 'Overall summary of the study, objectives, protocols, conditions studied etc.',
            target: $('[name=webpart]')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'PubMed Statistics',
            content: 'List of publications associated with this study with relevant links to PubMed.',
            target: $('[name=webpart]')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Participants',
            content: 'Click on this tab to find out more about the participants enrolled in this study. Clicking "Next" will take you there as part of this tour',
            target: $('a#ParticipantsTab').parent()[0],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=study.PARTICIPANTS');
            }
        },{
            title: 'Demographics Table',
            content: 'Table of basic demographics. It can be sorted and filtered to explore demographic data for all participants enrolled in the study.',
            target: $('[name=webpart]')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?');
            }
        },{
            title: 'Clinical and Assay Data',
            content: 'Click on this tab to find out more about the datasets generated in this study. Clicking "Next" will take you there as part of this tour',
            target: $('a#ClinicalandAssayDataTab').parent()[0],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=study.DATA_ANALYSIS');
            }
        },{
            title: 'Data Views',
            content: 'The list of datasets available for this study. Click on a dataset name to explore the data in a grid.',
            target: $('[name=webpart]')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=study.PARTICIPANTS');
            }

        },{
            title: 'Visualization',
            content: 'Selected datasets can be explored using the Data Explorer module.',
            target: $('[name=webpart]')[1],
            placement: 'left',
            yOffset: -15,
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Modules',
            content: 'Click on this tab to explore the datasets using standardized analyses modules. Clicking "Next" will take you there as part of this tour.',
            target: $('a#ModulesTab').parent()[0],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=Modules');
            }
        },{
            title: 'Active Modules',
            content: 'List of active interactive modules available for this study. The list will vary depending on the data available and the type of study.',
            target: $('[name=webpart]')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=study.DATA_ANALYSIS');
            }
        },{
            title: 'Reports',
            content: 'Click on this tab to explore additional analyses/reports. Clicking "Next" will take you there as part of this tour.',
            target: $('a#ReportsTab').parent()[0],
            placement: 'left',
            yOffset: -15,
            multipage: true,
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=Reports');
            }
        },{
            title: 'Available Reports',
            content: 'List of available reports for this study. The list will vary depending on the data available and the type of study. Reports can be generic or tailored to the study.',
            target: $('[name=webpart]')[0],
            placement: 'top',
            showPrevButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('/project' + LABKEY.container.path + '/begin.view?pageId=Modules');
            }

        }]
    });

    if ( window.location.hash == '' ){
        LABKEY.help.Tour.autoShow( 'immport-study-tour' );
    } else{
        LABKEY.help.Tour.continueTour();
    }
}

