import React, { useState } from "react";
import { newRegistration, newLogin } from "../js/login";
import { CSSTransition } from "react-transition-group";
import "./RegisterModal.scss";

interface RegisterModalProps {
  isOpen: boolean;
  setRegModalOpen: (arg: boolean) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = (props) => {
  const [errorMsg, setErrorMsg] = useState<string>("");

  const closeModal = (e: React.MouseEvent) => {
    props.setRegModalOpen(false);
  };

  const loginFunc = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newLogin(setErrorMsg);
  };

  const registerFunc = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newRegistration();
  };

  return (
    <CSSTransition
      in={props.isOpen}
      timeout={300}
      classNames="register"
      unmountOnExit
    >
      <section
        id="register-modal"
        className="register register-modal"
        aria-hidden="true"
      >
        <div className="container">
          <div className="register__content">
            <header className="register__header">
              {/* <!-- ?xml version="1.0" encoding="UTF-8"? --> */}
              <svg
                className="register__close"
                viewBox="0 0 18 18"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                onClick={closeModal}
              >
                <title>Close button SVG</title>
                <g
                  id="Landing-Page"
                  stroke="none"
                  strokeWidth="4"
                  fill="none"
                  fillRule="evenodd"
                >
                  <g
                    id="Home-Login"
                    transform="translate(-797.000000, -95.000000)"
                    stroke="#FFFFFF"
                  >
                    <g
                      id="Group-22"
                      transform="translate(448.000000, 72.000000)"
                    >
                      <g
                        id="Group-16"
                        transform="translate(350.000000, 24.000000)"
                      >
                        <line
                          x1="-4.54747351e-13"
                          y1="4.4408921e-16"
                          x2="16"
                          y2="16"
                          id="Path-9"
                        ></line>
                        <line
                          x1="-4.54747351e-13"
                          y1="4.4408921e-16"
                          x2="16"
                          y2="16"
                          id="Path-9"
                          transform="translate(8.000000, 8.000000) scale(-1, 1) translate(-8.000000, -8.000000) "
                        ></line>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </header>
            <div className="register__form">
              <h3 className="register__title">Sign In</h3>
              <form
                action="#"
                onSubmit={loginFunc}
                className="register__sign-in"
              >
                <div style={{ display: "none" }}>
                  {/* <!-- Hidden input fields may be inserted here --> */}
                  <input
                    type="hidden"
                    name="some-hidden-field"
                    value="somevalue"
                  />
                </div>
                <div className="input-wrap input-wrap__column">
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <span className="email">
                    <input
                      type="text"
                      name="email"
                      defaultValue=""
                      size={40}
                      className=""
                      id="email-sign-in"
                      aria-required="true"
                      aria-invalid="false"
                    />
                  </span>
                  <div className="input-wrap__forgot-password">
                    <label className="label label-password" htmlFor="password">
                      Password
                    </label>
                    <a
                      href={`${window.location.href}login/home/resetpassword.view`}
                      target="_self"
                      title="Forgot Password"
                      className="forgot-password"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <span className="password">
                    <input
                      type="password"
                      name="password"
                      defaultValue=""
                      size={40}
                      className=""
                      id="password"
                      aria-required="true"
                      aria-invalid="false"
                    />
                  </span>
                  {errorMsg !== "" && <span id="error">{`${errorMsg}`}</span>}
                </div>
                <button className="submit-btn" type="submit">
                  Sign In
                </button>
              </form>
              <form
                action="#"
                onSubmit={registerFunc}
                className="register__register"
              >
                <div style={{ display: "none" }}>
                  {/* <!-- Hidden input fields may be inserted here --> */}
                  <input
                    type="hidden"
                    name="some-hidden-field"
                    value="somevalue"
                  />
                </div>
                <div className="input-wrap input-wrap__column">
                  <label className="label" htmlFor="email">
                    First Time User?
                  </label>
                  {/* <span className="email">
                    <input
                      type="text"
                      name="email"
                      defaultValue=""
                      size={40}
                      className=""
                      id="email-register"
                      aria-required="true"
                      aria-invalid="false"
                    />
                  </span> */}
                </div>
                <button className="register-btn" type="submit">
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </CSSTransition>
  );
};

export default RegisterModal;
