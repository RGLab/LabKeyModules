var homeTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-home-tour',
        steps: [{
            title: 'Announcements',
            content: 'News from the ImmuneSpace team and the HIPC project. New features and package releases will be announced here.',
            target: $('.labkey-wp')[0],
            placement: 'top',
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
            content: 'Resources to learn how to use ImmuneSpace and the LabKey server (which powers ImmuneSpace).',
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
            title: 'Tutorials and More',
            content: 'Here are some resources to learn how to use ImmuneSpace effectively.',
            target: $('.labkey-wp')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true,
            onPrev: function(){
                LABKEY.help.Tour.continueAtLocation('/project/home/begin.view?');
            }
        },{
            title: 'Getting Started',
            content: 'Click on the Study Finder link in the \'Geting Started\' menu to start exploring data using the study finder. Clicking \'Next\' will take you there directly.',
            target: $('.labkey-main-menu-item')[0],
            yOffset: -20,
            placement: 'right',
            showPrevButton: true,
            showNextButton: true,
            multipage: true,
            onNext: function(){
//                $('.labkey-main-menu-item').removeClass('selected');
//                $("[id='Wiki Menu12$Header_menu']").css('visibility', 'hidden');

                LABKEY.help.Tour.continueAtLocation('/immport/Studies/studyFinder.view?');
            },
            onShow: function(){
//                $('.labkey-main-menu-item').addClass('selected');
//                $("[id='Wiki Menu12$Header_menu']").css('visibility', 'visible');
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

