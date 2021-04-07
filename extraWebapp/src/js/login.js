/* From Matt Bellew @ LabKey, recommended way to login via api June 2017 */

import {Utils, ActionURL, Ajax} from '@labkey/api';

const LABKEY = {};

export function chkRemember(){
    // examine cookies to determine if user wants the email pre-populated on form
    var h = document.getElementById('email');
    if (h && Utils.getCookie("email")) {
        h.value = decodeURIComponent(Utils.getCookie("email"));
    };

    h = document.getElementById('remember');
    if (h && Utils.getCookie("email")) {
        h.checked = true;
    } else {
        h.checked = false;
    };
}

export function newLogin(){
    // if(document.getElementById('remember').checked == true){
    //     Utils.setCookie('email', encodeURIComponent(document.getElementById('email').value), true, 360);
    // } else {
    //     Utils.deleteCookie('email', true);
    // }
    let baseurl = (ActionURL.buildURL('login', 'loginApi.api', "home"));
    console.log(baseurl);
    console.log(ActionURL.getContainer());

    Ajax.request({
        url: LABKEY.ActionURL.buildURL('login', 'loginApi.api', this.containerPath),
        method: 'POST',
        params: {
            //remember: document.getElementById('remember').value,
            remember: false,
            email: document.getElementById('email-sign-in').value,
            password: document.getElementById('password').value,
            returnUrl: ActionURL.getParameter("returnUrl"),
        },
        success: Utils.getCallbackWrapper(function (response) {
            if(response && response.returnUrl){
                window.location = response.returnUrl;
            }
            window.location = ActionURL.buildURL('project', 'begin', '/Studies')
        }, this),
        failure: Utils.getCallbackWrapper(function (response) {
            if(document.getElementById('errors') && response && response.exception) {
                // Want special point to password reset not given by LK response
                if(response.exception.includes('did not match')){
                    document.getElementById('errors').innerHTML = 'Invalid Username or Password.<br> You can reset your password via the question mark link above.';
                } else {
                    document.getElementById('errors').innerHTML = response.exception;
                }
            }
            // if(response && response.returnUrl){
            //     window.location = response.returnUrl;
            // }
            // window.location = ActionURL.buildURL('project', 'begin', '/Studies')
        }, this)
    });
}