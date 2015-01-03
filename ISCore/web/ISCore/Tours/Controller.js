(function(){
    var
        page            = ( LABKEY.ActionURL.getController() + '-' + LABKEY.ActionURL.getAction() ).toLowerCase(),
        isPortalPage    = page == 'project-begin',
        isMainTabOrCont = ( window.location.hash != '' ) || // Indicates tour continuation regardless of the tab
                          ( ( Object.keys( LABKEY.ActionURL.getParameters() ).length == 0 ) &&  // No params, so it's the first tab
                            ( window.location.hash == '' ) ),                                   // Direct hit, no tour implied
        isStudyFolder   = LABKEY.moduleContext.study && LABKEY.moduleContext.study.timepointType && isMainTabOrCont,
        isHomePage      = ( LABKEY.ActionURL.getContainer() == '/home' ) && isMainTabOrCont
    ;

    LABKEY.Utils.onReady( function(){
        if ( isPortalPage && isStudyFolder ){ // 'Home page' of a study subfolder
            LABKEY.requiresScript(
                [
                    'ISCore/Common/jquery-1.11.1.min.js',
                    'ISCore/Tours/Study.js'
                ],
                true, function(){ studyTour(); }, this, true
            );
        }

        if ( isPortalPage && isHomePage ){
            LABKEY.requiresScript(
                [
                    'ISCore/Common/jquery-1.11.1.min.js',
                    'ISCore/Tours/Home.js'
                ],
                true, function(){ homeTour(); }, this, true
            );
        }
    }); // end onReady
})(); // end main

