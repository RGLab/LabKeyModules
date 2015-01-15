var homeTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-home-tour',
        steps: [{
            title: 'Welcome to ImmuneSpace',
            content: 'Please, use this quick tour to familiarize yourself with the project home page. You can always restart this tour by clicking the "QUICK HELP" link below.',
            target: $('.labkey-wp')[1],
            placement: 'top',
            showNextButton: true
        },{
            title: 'Announcements',
            content: 'News from the ImmuneSpace team and the HIPC project. New features and package releases will be announced here.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Quick Links',
            content: 'Direct access to useful places on ImmuneSpace as well as external resources and documentation.',
            target: $('.labkey-wp')[2],
            yOffset: -15,
            placement: 'left',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Tutorials',
            content: 'Clicking on this tab will take you to the "Tutorials" page. Clicking "Next" will take you there as part of this tour.',
            target: $('#TutorialsTab').parent()[0],
            yOffset: -15,
            placement: 'left',
            showPrevButton: true,
            showNextButton: true,
            multipage: true,
            onNext: function(){
                LABKEY.help.Tour.continueAtLocation('?pageId=Tutorials');
            }
        },{
            title: 'Video Tutorials',
            content: 'Here is a list of screencasts made by the ImmuneSpace development team to help you get started.',
            target: $('#VideoTutorials')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('/project/home/begin.view?');
            }
        },{
            title: 'Projects Navigation',
            content: 'The folder drop-down contains the list of available projects. Hovering over each reveals the corresponding sublist of studies. Click on any study link to start exploring that study. You can also use the Study Finder to identify studies of interest, click "Next" for details.',
            target: $('#betaBar')[0],
            xOffset: 530,
            yOffset: 30,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            onNext: function(){
                $('.menu-projects').removeClass('selected');
                $('#betaBar_menu').css('visibility', 'hidden');
            },
            onPrev: function(){
                $('.menu-projects').removeClass('selected');
                $('#betaBar_menu').css('visibility', 'hidden');
            },
            onShow: function(){
                document.getElementById('betaBar').dispatchEvent(
                    new MouseEvent( 'click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    })
                );
                $('.menu-projects').addClass('selected');
                $('#betaBar_menu').css('visibility', 'visible');
            }
        },{
            title: 'Getting Started',
            content: 'Click on the "Study Finder" link in the "Geting Started" menu to find studies of interest using the Study Finder. Clicking "Next" will take you there directly.',
            target: $('.labkey-main-menu-item')[0],
            yOffset: -20,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            multipage: true,
            onNext: function(){
                $('.labkey-main-menu-item').removeClass('selected');
                $("[id='Wiki Menu12$Header_menu']").css('visibility', 'hidden');

                LABKEY.help.Tour.continueAtLocation('/immport/Studies/studyFinder.view?');
            },
            onPrev: function(){
                $('.labkey-main-menu-item').removeClass('selected');
                $("[id='Wiki Menu12$Header_menu']").css('visibility', 'hidden');
            },
            onShow: function(){
                document.getElementById('Wiki Menu12$Header').dispatchEvent(
                    new MouseEvent( 'click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    })
                );
                $('.labkey-main-menu-item').addClass('selected');
                $("[id='Wiki Menu12$Header_menu']").css('visibility', 'visible');
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

