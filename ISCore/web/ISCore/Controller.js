(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] =  i[r] ||
            function() {
                (i[r].q = i[r].q || []).push(arguments)
            },
    i[r].l = 1 * new Date();
    a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-55130440-1', 'auto');
ga('set', '&uid', LABKEY.user.id.toString()); // Set the user ID using signed-in user_id.
ga('send', 'pageview');


(function(){

    // TOURS LOGIC
    var
        isPortalPage    = ( LABKEY.ActionURL.getController() + '-' + LABKEY.ActionURL.getAction() ).toLowerCase() == 'project-begin',
        isMainTabOrCont = ( window.location.hash != '' ) ||                                     // Indicates tour continuation regardless of the tab
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

    // BROWSER DETECTION: SHOULD SUPPORT ECMA5 AND LOCALSTORAGE
    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    if (
        isPortalPage && isHomePage && (    
        ( Ext4.isChrome && Ext4.chromeVersion < 19 && Ext4.chromeVersion > 0 ) ||
        ( Ext4.isGecko && Ext4.firefoxVersion < 4 && Ext4.firefoxVersion > 0 ) ||
        ( Ext4.isSafari && Ext4.safariVersion < 6 && Ext4.safariVersion > 0 ) ||
        ( Ext4.isIE && Ext4.ieVersion < 9 && Ext4.ieVersion > 0 ) ||
        ( Ext4.isOpera && Ext4.operaVersion < 12.10 && Ext4.operaVersion > 0 )
        )
    ){
        if ( storageAvailable( 'localStorage' ) ) {
            if ( ! localStorage.getItem( 'browserAlert' ) ){
                localStorage.setItem( 'browserAlert', 'true' );
                alert( 'For best viewing experience your browser needs to be updated to a newer version' );
            }
        } else {
            // Too bad, no localStorage for us: MUST USE COOKIES ?
            alert( 'For best viewing experience your browser needs to be updated to a newer version' );
        }
    }

})(); // end main

