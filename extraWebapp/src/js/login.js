/* From Matt Bellew @ LabKey, recommended way to login via api June 2017 */

import { Utils, Ajax } from "@labkey/api";

// depreciated because we no longer have a remember email feature

// export function chkRemember() {
//   // examine cookies to determine if user wants the email pre-populated on form
//   var h = document.getElementById("email");
//   if (h && Utils.getCookie("email")) {
//     h.value = decodeURIComponent(Utils.getCookie("email"));
//   }

//   h = document.getElementById("remember");
//   if (h && Utils.getCookie("email")) {
//     h.checked = true;
//   } else {
//     h.checked = false;
//   }
// }

export function newLogin(setErrorMsg) {
  const homePageUrl = window.location.href;

  Ajax.request({
    url: `${homePageUrl}login/home/loginApi.api`,
    method: "POST",
    params: {
      remember: false,
      email: document.getElementById("email-sign-in").value,
      password: document.getElementById("password").value,
      returnUrl: `${homePageUrl}project/Studies/begin.view`,
    },
    success: Utils.getCallbackWrapper(function (response) {
      if (response && response.returnUrl) {
        window.location = response.returnUrl;
      }
      window.location.href = `${homePageUrl}project/Studies/begin.view`;
    }, this),
    failure: Utils.getCallbackWrapper(function (response) {
      console.log(response);
      if (response && response.exception) {
        // Want special point to password reset not given by LK response
        console.log(response.exception);
        if (response.exception.includes("did not match")) {
          setErrorMsg(
            "Invalid Username or Password. You can reset your password via the Forgot Password link above."
          );
        } else {
          setErrorMsg(response.exception);
        }
      }
    }, this),
  });
}

export const newRegistration = () => {
  window.location.href = `${window.location.href}login/home/register.view?`;
};
