var homeTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-home-tour',
        steps: [{
            title: 'Welcome to ImmuneSpace',
            content: 'Please, use this quick tour to familiarize yourself with the home page. You can always restart this tour by clicking the "QUICK HELP" link below.',
            target: $('.labkey-wp')[0],
            placement: 'top',
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
            target: $('.labkey-wp')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Quick Links',
            content: 'Direct access to useful places on ImmuneSpace as well as external resources and documentation.',
            target: $('.labkey-wp')[3],
            yOffset: -15,
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
            showNextButton: true//,
            //multipage: true,
            //onNext: function(){
            //    LABKEY.help.Tour.continueAtLocation('/project/home/begin.view?pageId=Tutorials');
            //}
        },{
        //    title: 'Video Tutorials',
        //    content: 'Here is a list of screencasts made by the ImmuneSpace development team to help you get started.',
        //    target: $('#VideoTutorials')[0],
        //    placement: 'top',
        //    showPrevButton: true,
        //    showNextButton: true,
        //    onPrev: function(){
        //        LABKEY.help.Tour.continueAtLocation('/project/home/begin.view?');
        //    }
        //},{
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
            target: $('.labkey-main-menu-item')[1],
            xOffset: 270,
            yOffset: 0,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                $('#WikiMenu13-Header').removeClass('selected');
                $('#WikiMenu13-Header_menu').css('visibility', 'hidden');
            },
            onPrev: function(){
                $('#WikiMenu13-Header').removeClass('selected');
                $('#WikiMenu13-Header_menu').css('visibility', 'hidden');
            },
            onShow: function(){
                $('#WikiMenu13-Header')[0].dispatchEvent(
                    new MouseEvent( 'click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    })
                );
                $('#WikiMenu13-Header').addClass('selected');
                $('#WikiMenu13-Header_menu').css('visibility', 'visible');
            }
        },{
            title: 'Studies Navigation',
            content: 'Use the search box to quickly find the study accession number you want, then click on it to go to its overview page. </br> Click on the "Data Finder" link to find studies of interest using the Data Finder. </br> Clicking "Next" will take you there directly.',
            target: $('.labkey-main-menu-item')[0],
            xOffset: 70,
            yOffset: 0,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            multipage: true,
            onNext: function(){
                $('#WikiMenu12-Header').removeClass('selected');
                $('#WikiMenu12-Header_menu').css('visibility', 'hidden');

                LABKEY.help.Tour.continueAtLocation('/project/Studies/begin.view?');
            },
            onPrev: function(){
                $('#WikiMenu12-Header').removeClass('selected');
                $('#WikiMenu12-Header_menu').css('visibility', 'hidden');
            },
            onShow: function(){
                $('#WikiMenu12-Header')[0].dispatchEvent(
                    new MouseEvent( 'click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    })
                );
                $('#WikiMenu12-Header').addClass('selected');
                $('#WikiMenu12-Header_menu').css('visibility', 'visible');
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

