var homeTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-home-tour',
        steps: [{
            title: 'Welcome to ImmuneSpace',
            content: 'Please, use this quick tour to familiarize yourself with the home page. You can always restart this tour by clicking the "QUICK HELP" link below.',
            target: $('a[name="Welcome to ImmuneSpace"]')[0],
            yOffset: -20,
            placement: 'right',
            showNextButton: true
        },{
            title: 'Highlighted Studies',
            content: 'New and recently updated studies, if available, will always be listed here.',
            target: $('#Welcome')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Announcements',
            content: 'News from the ImmuneSpace team and the HIPC project. New features and package releases will be announced here.',
            target: $('a[name="Announcements"]')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Quick Links',
            content: 'Direct access to useful external resources.',
            target: $('a[name="Quick Links"]')[0],
            yOffset: -20,
            placement: 'left',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Tools',
            content: 'Clicking on this tab will take you to the "Tools" page where you can learn about analyses tools available on ImmuneSpace and external tools developed by the HIPC community.',
            target: $('#ToolsTab').parent()[0],
            yOffset: -15,
            placement: 'left',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Tutorials',
            content: 'Clicking on this tab will take you to the "Tutorials" page where you can find some information to get you started with ImmuneSpace, e.g. video tutorials.',
            target: $('#TutorialsTab').parent()[0],
            yOffset: -15,
            placement: 'left',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'About',
            content: 'Clicking on this tab will take you to the "About" page which provides information about the goal of ImmuneSpace and its place within the HIPC program.',
            target: $('#AboutTab').parent()[0],
            yOffset: -15,
            placement: 'left',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Video Tutorials Menu',
            content: 'Video tutorials quick access list, available on every page.',
            target: $('[data-webpart=WikiMenu13]')[0],
            xOffset: 250,
            yOffset: 10,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            onShow: function(){
                $('[data-webpart=WikiMenu13].dropdown').one('hide.bs.dropdown', function( event ){
                    return false;
                });
                $('[data-webpart=WikiMenu13] > .dropdown-toggle').click();
            }

        },{
            title: 'Studies Navigation',
            content: 'Use the search box to quickly find the study accession number you want, then click on it to go to its overview page. </br> Click on the "Data Finder" link to find studies of interest using the Data Finder. </br> Clicking "Next" will take you there directly.',
            target: $('[data-webpart=StudiesMenu12]')[0],
            xOffset: 70,
            yOffset: 10,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            multipage: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('/project/Studies/begin.view?');
            },
            onShow: function(){
                $('[data-webpart=StudiesMenu12].dropdown').one('hide.bs.dropdown', function( event ){
                    return false;
                });
                $('[data-webpart=StudiesMenu12] > .dropdown-toggle').click();
            }
        },{
            title: 'Dummy last step to make the previous step show the NEXT button'
        }]
    });

    if ( window.location.hash == '' ){
        LABKEY.help.Tour.autoShow( 'immport-home-tour' );
    } else{
        LABKEY.help.Tour.continueTour();
    }
}

