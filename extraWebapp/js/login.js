/* From Matt Bellew @ LabKey, recommended way to login via api June 2017 */

function chkRemember(){
    // examine cookies to determine if user wants the email pre-populated on form
    var h = document.getElementById('email');
    if (h && LABKEY.Utils.getCookie("email")) {
        h.value = decodeURIComponent(LABKEY.Utils.getCookie("email"));
    };

    h = document.getElementById('remember');
    if (h && LABKEY.Utils.getCookie("email")) {
        h.checked = true;
    } else {
        h.checked = false;
    };
}

function newLogin(){
    if(document.getElementById('remember').checked == true){
        LABKEY.Utils.setCookie('email', encodeURIComponent(document.getElementById('email').value), true, 360);
    } else {
        LABKEY.Utils.deleteCookie('email', true);
    }

    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL('login', 'loginApi.api', this.containerPath),
        method: 'POST',
        params: {
            remember: document.getElementById('remember').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            returnUrl: LABKEY.ActionURL.getParameter("returnUrl"),
        },
        success: LABKEY.Utils.getCallbackWrapper(function (response) {
            if(response && response.returnUrl){
                window.location = response.returnUrl;
            }
        }, this),
        failure: LABKEY.Utils.getCallbackWrapper(function (response) {
            if(document.getElementById('errors') && response && response.exception) {
               document.getElementById('errors').innerHTML = 'Invalid Username or Password.<br> You can reset your password via the question mark link above.';
            }
            if(response && response.returnUrl){
                window.location = response.returnUrl;
            }
        }, this)
    });
}
