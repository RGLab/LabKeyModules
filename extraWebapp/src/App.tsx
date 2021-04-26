import React, { useState } from "react";
import "./scss/main.scss";
import "./App.css";

import Registermodal from "./components/RegisterModal";
import ImmunespaceHeaderLogo from "./assets/logo-immunespace-whiteblue-desk.svg";
import ImmunespaceFooterLogo from "./assets/footer-logo-immunespace-whiteblue.png";
import ComingSoonWatermark from "./assets/coming-soon.jpg";

function App() {
  const [regModalOpen, setRegModalOpen] = useState(false);

  const regBtnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setRegModalOpen(true);
  };

  return (
    <div id="body">
      <header id="site-header" className="header">
        <div className="container">
          <nav className="header__nav" role="navigation">
            <ul>
              <li className="header__logo">
                <a href="/" title="immuneSpace Home" id="header__logo-link">
                  <img
                    src={ImmunespaceHeaderLogo}
                    alt="immuneSpace Logo"
                    className="header__logo-img"
                  />
                </a>
              </li>
              <li className="header__cta-item">
                {/* Probably should switch the a tag out for a button in the future */}
                <a
                  href="/"
                  className="header__cta-link"
                  title="Register or Sign In"
                  onClick={regBtnClick}
                >
                  <span className="h-o-m">Register or&nbsp;</span>
                  <span>Sign In</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="main" role="main">
        <section id="hero" className="hero">
          <div className="container">
            <div className="hero__content">
              <div className="hero__copy">
                <h1 className="hero__title">
                  Enabling integrative modeling of human immunological data
                </h1>
                <p>
                  ImmuneSpace is a powerful data management and analysis engine
                  where datasets can be easily explored and analyzed using
                  state-of-the-art computational tools.
                </p>
                <a href="/" className="hero__cta is-hidden">
                  <span className="hero__link-text">How to get started</span>
                  <svg
                    className="hero__svg-arrow-right"
                    viewBox="0 0 34 18"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <title>Arrow Right SVG</title>
                    <g
                      id="Page-1"
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <g
                        id="Home"
                        transform="translate(-360.000000, -467.000000)"
                        stroke="#0F91F2"
                        strokeWidth="3"
                      >
                        <g
                          id="Group-9-Copy-3"
                          transform="translate(360.000000, 468.000000)"
                        >
                          <line
                            x1="0"
                            y1="7.6"
                            x2="31.4685075"
                            y2="7.6"
                            id="Path-4"
                          ></line>
                          <polyline
                            id="Rectangle"
                            transform="translate(24.400000, 7.600000) rotate(-315.000000) translate(-24.400000, -7.600000) "
                            points="19.2 2.4 29.6 2.4 29.6 12.8"
                          ></polyline>
                        </g>
                      </g>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="tri-block">
          <div className="container">
            <div className="tri-block__content">
              <div className="tri-block__block">
                {/* Uncomment the a tag below when AE is working */}
                {/* <a
                  href=""
                  className="tri-block__cta"
                  title="Analyte Explorer link"
                > */}
                <span className="tri-block__icon">
                  {/* ?xml version="1.0" encoding="UTF-8"?  */}
                  <img
                    src={ComingSoonWatermark}
                    alt="coming soon"
                    className="coming-soon-img"
                  />
                  <svg
                    className="icon icon-svg ae-icon"
                    width="155px"
                    height="113px"
                    viewBox="0 0 155 113"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <title>Analyte Explorer Icon</title>
                    <defs>
                      <rect
                        id="path-1"
                        x="0"
                        y="0"
                        width="155"
                        height="113"
                      ></rect>
                    </defs>
                    <g
                      id="Page-1"
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <g id="Group">
                        <mask id="mask-2" fill="white">
                          <use xlinkHref="#path-1"></use>
                        </mask>
                        <g id="Rectangle"></g>
                        <g id="analyte_exp" mask="url(#mask-2)">
                          <g transform="translate(-25.000000, 0.000000)">
                            <rect
                              id="Rectangle-Copy-4"
                              x="0"
                              y="0"
                              width="202"
                              height="119"
                            ></rect>
                            <g
                              id="Group-7"
                              strokeWidth="1"
                              fillRule="evenodd"
                              transform="translate(27.000000, 15.000000)"
                            >
                              <g id="Group-35-Copy">
                                <path
                                  d="M18,13.5014153 C18,15.4346947 16.4318641,17 14.4985847,17 C12.5681359,17 11,15.4346947 11,13.5014153 C11,11.5681359 12.5681359,10 14.4985847,10 C16.4318641,10 18,11.5681359 18,13.5014153"
                                  id="Fill-1"
                                  fill="#0F91F2"
                                  fillRule="nonzero"
                                ></path>
                                <path
                                  d="M31,13.5014153 C31,15.4346947 29.4318641,17 27.4985847,17 C25.5681359,17 24,15.4346947 24,13.5014153 C24,11.5681359 25.5681359,10 27.4985847,10 C29.4318641,10 31,11.5681359 31,13.5014153"
                                  id="Fill-3"
                                  fill="#0F91F2"
                                  fillRule="nonzero"
                                ></path>
                                <path
                                  d="M44,13.5014153 C44,15.4346947 42.4318641,17 40.5014153,17 C38.5681359,17 37,15.4346947 37,13.5014153 C37,11.5681359 38.5681359,10 40.5014153,10 C42.4318641,10 44,11.5681359 44,13.5014153"
                                  id="Fill-5"
                                  fill="#FF5B00"
                                  fillRule="nonzero"
                                ></path>
                                <polygon
                                  id="Stroke-9"
                                  stroke="#0F91F2"
                                  strokeWidth="4.3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points="140 96 0 96 0 0 140 0 140 36.4142895"
                                ></polygon>
                                <line
                                  x1="0"
                                  y1="26"
                                  x2="140"
                                  y2="26"
                                  id="Stroke-11"
                                  stroke="#0F91F2"
                                  strokeWidth="4.3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></line>
                              </g>
                              <line
                                x1="37"
                                y1="26"
                                x2="37"
                                y2="96"
                                id="Path-5"
                                stroke="#0F91F2"
                                strokeWidth="4"
                              ></line>
                              <line
                                x1="29"
                                y1="39"
                                x2="7.72393057"
                                y2="39"
                                id="Path-6"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="29"
                                y1="48"
                                x2="7.72393057"
                                y2="48"
                                id="Path-6-Copy"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="29"
                                y1="68"
                                x2="7.72393057"
                                y2="68"
                                id="Path-6-Copy-2"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="29"
                                y1="76"
                                x2="7.72393057"
                                y2="76"
                                id="Path-6-Copy-3"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="29"
                                y1="85"
                                x2="7.72393057"
                                y2="85"
                                id="Path-6-Copy-4"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="37"
                                y1="26"
                                x2="37"
                                y2="96"
                                id="Path-5"
                                stroke="#0F91F2"
                                strokeWidth="4"
                              ></line>
                              <polyline
                                id="Path-7"
                                stroke="#FF5B00"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="40.5 58.9865344 56.0952527 43 70.0659248 64.7044823 87.8721433 54.0454545 133.091013 54.0454545"
                              ></polyline>
                              <polyline
                                id="Path-8"
                                stroke="#FF5B00"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="41.0528894 60.1396877 52.4349236 72.8547906 70.5558194 43 84.824146 66.8 131.545806 54.2700767"
                              ></polyline>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </span>
                {/* Remove tri-block__cta & ae__link-text classes when Analyte Explorer is working */}
                <span className="tri-block__cta tri-block__link-text ae__link-text">
                  Analyte Explorer (Coming Soon)
                </span>
                {/* </a> */}
                <p>
                  Visualize analyte expression patterns over time for various
                  disease states, aggregated by cohort.
                </p>
              </div>
              <div className="tri-block__block">
                <a
                  href="/project/Studies/begin.view?pageId=Resources"
                  className="tri-block__cta"
                  title="Reproducable Analyses link"
                >
                  <span className="tri-block__icon">
                    {/* <!-- ?xml version="1.0" encoding="UTF-8"? --> */}
                    <svg
                      className="icon icon-svg"
                      width="185px"
                      height="113px"
                      viewBox="0 0 185 113"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>Reproducible Analyses</title>
                      <g
                        id="Landing-Page"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="Home"
                          transform="translate(-494.000000, -496.000000)"
                        >
                          <g
                            id="Group-11"
                            transform="translate(494.000000, 496.000000)"
                          >
                            <rect
                              id="Rectangle"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              x="2.15"
                              y="28.15"
                              width="146.7"
                              height="82.7"
                              rx="3"
                            ></rect>
                            <g
                              id="Group-13"
                              transform="translate(13.000000, 14.000000)"
                            >
                              <rect
                                id="Rectangle-Copy"
                                stroke="#0F91F2"
                                strokeWidth="4.3"
                                fill="#FFFFFF"
                                x="2.15"
                                y="2.15"
                                width="146.7"
                                height="82.7"
                                rx="3"
                              ></rect>
                              <line
                                x1="19"
                                y1="16.5"
                                x2="47"
                                y2="16.5"
                                id="Line-2"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="110"
                                y1="41.5"
                                x2="133"
                                y2="41.5"
                                id="Line-2-Copy-3"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="19.491453"
                                y1="25.5"
                                x2="134"
                                y2="26"
                                id="Line-2-Copy-2"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="110"
                                y1="49.5"
                                x2="133"
                                y2="49.5"
                                id="Line-2-Copy-4"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="110"
                                y1="66.5"
                                x2="133"
                                y2="66.5"
                                id="Line-2-Copy-5"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <rect
                                id="Rectangle-Copy-3"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                x="19"
                                y="39"
                                width="78"
                                height="31"
                                rx="3"
                              ></rect>
                              <line
                                x1="22.189747"
                                y1="67"
                                x2="94.161578"
                                y2="42"
                                id="Path-10"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <path
                                d="M43,54.5014153 C43,56.4346947 41.4318641,58 39.4985847,58 C37.5681359,58 36,56.4346947 36,54.5014153 C36,52.5681359 37.5681359,51 39.4985847,51 C41.4318641,51 43,52.5681359 43,54.5014153"
                                id="Fill-1"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M34,61.5014153 C34,63.4346947 32.4318641,65 30.4985847,65 C28.5681359,65 27,63.4346947 27,61.5014153 C27,59.5681359 28.5681359,58 30.4985847,58 C32.4318641,58 34,59.5681359 34,61.5014153"
                                id="Fill-1-Copy-5"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M75,58.5014153 C75,60.4346947 73.4318641,62 71.4985847,62 C69.5681359,62 68,60.4346947 68,58.5014153 C68,56.5681359 69.5681359,55 71.4985847,55 C73.4318641,55 75,56.5681359 75,58.5014153"
                                id="Fill-1-Copy-3"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M82,46.5014153 C82,48.4346947 80.4318641,50 78.4985847,50 C76.5681359,50 75,48.4346947 75,46.5014153 C75,44.5681359 76.5681359,43 78.4985847,43 C80.4318641,43 82,44.5681359 82,46.5014153"
                                id="Fill-1-Copy-4"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M61,52.5014153 C61,54.4346947 59.4318641,56 57.4985847,56 C55.5681359,56 54,54.4346947 54,52.5014153 C54,50.5681359 55.5681359,49 57.4985847,49 C59.4318641,49 61,50.5681359 61,52.5014153"
                                id="Fill-1-Copy-2"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M70,51.5014153 C70,53.4346947 68.4318641,55 66.4985847,55 C64.5681359,55 63,53.4346947 63,51.5014153 C63,49.5681359 64.5681359,48 66.4985847,48 C68.4318641,48 70,49.5681359 70,51.5014153"
                                id="Fill-1-Copy-6"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M53,61.5014153 C53,63.4346947 51.4318641,65 49.4985847,65 C47.5681359,65 46,63.4346947 46,61.5014153 C46,59.5681359 47.5681359,58 49.4985847,58 C51.4318641,58 53,59.5681359 53,61.5014153"
                                id="Fill-1-Copy"
                                fill="#FF5B00"
                              ></path>
                            </g>
                            <rect
                              id="Rectangle"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              x="2.15"
                              y="28.15"
                              width="146.7"
                              height="82.7"
                              rx="3"
                            ></rect>
                            <g
                              id="Group-13"
                              transform="translate(13.000000, 14.000000)"
                            >
                              <rect
                                id="Rectangle-Copy"
                                stroke="#0F91F2"
                                strokeWidth="4.3"
                                fill="#FFFFFF"
                                x="2.15"
                                y="2.15"
                                width="146.7"
                                height="82.7"
                                rx="3"
                              ></rect>
                              <line
                                x1="19"
                                y1="16.5"
                                x2="47"
                                y2="16.5"
                                id="Line-2"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="110"
                                y1="41.5"
                                x2="133"
                                y2="41.5"
                                id="Line-2-Copy-3"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="19.491453"
                                y1="25.5"
                                x2="134"
                                y2="26"
                                id="Line-2-Copy-2"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="110"
                                y1="49.5"
                                x2="133"
                                y2="49.5"
                                id="Line-2-Copy-4"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="110"
                                y1="66.5"
                                x2="133"
                                y2="66.5"
                                id="Line-2-Copy-5"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <rect
                                id="Rectangle-Copy-3"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                x="19"
                                y="39"
                                width="78"
                                height="31"
                                rx="3"
                              ></rect>
                              <line
                                x1="22.189747"
                                y1="67"
                                x2="94.161578"
                                y2="42"
                                id="Path-10"
                                stroke="#0F91F2"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></line>
                              <path
                                d="M43,54.5014153 C43,56.4346947 41.4318641,58 39.4985847,58 C37.5681359,58 36,56.4346947 36,54.5014153 C36,52.5681359 37.5681359,51 39.4985847,51 C41.4318641,51 43,52.5681359 43,54.5014153"
                                id="Fill-1"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M34,61.5014153 C34,63.4346947 32.4318641,65 30.4985847,65 C28.5681359,65 27,63.4346947 27,61.5014153 C27,59.5681359 28.5681359,58 30.4985847,58 C32.4318641,58 34,59.5681359 34,61.5014153"
                                id="Fill-1-Copy-5"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M75,58.5014153 C75,60.4346947 73.4318641,62 71.4985847,62 C69.5681359,62 68,60.4346947 68,58.5014153 C68,56.5681359 69.5681359,55 71.4985847,55 C73.4318641,55 75,56.5681359 75,58.5014153"
                                id="Fill-1-Copy-3"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M82,46.5014153 C82,48.4346947 80.4318641,50 78.4985847,50 C76.5681359,50 75,48.4346947 75,46.5014153 C75,44.5681359 76.5681359,43 78.4985847,43 C80.4318641,43 82,44.5681359 82,46.5014153"
                                id="Fill-1-Copy-4"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M61,52.5014153 C61,54.4346947 59.4318641,56 57.4985847,56 C55.5681359,56 54,54.4346947 54,52.5014153 C54,50.5681359 55.5681359,49 57.4985847,49 C59.4318641,49 61,50.5681359 61,52.5014153"
                                id="Fill-1-Copy-2"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M70,51.5014153 C70,53.4346947 68.4318641,55 66.4985847,55 C64.5681359,55 63,53.4346947 63,51.5014153 C63,49.5681359 64.5681359,48 66.4985847,48 C68.4318641,48 70,49.5681359 70,51.5014153"
                                id="Fill-1-Copy-6"
                                fill="#FF5B00"
                              ></path>
                              <path
                                d="M53,61.5014153 C53,63.4346947 51.4318641,65 49.4985847,65 C47.5681359,65 46,63.4346947 46,61.5014153 C46,59.5681359 47.5681359,58 49.4985847,58 C51.4318641,58 53,59.5681359 53,61.5014153"
                                id="Fill-1-Copy"
                                fill="#FF5B00"
                              ></path>
                            </g>
                            <g
                              id="Group-12-Copy"
                              transform="translate(137.000000, 0.000000)"
                            >
                              <circle
                                id="Oval"
                                fill="#1A1A1A"
                                cx="23.9555556"
                                cy="23.9555556"
                                r="23.9555556"
                              ></circle>
                              <g
                                id="Group-3"
                                transform="translate(13.688889, 6.844444)"
                              >
                                <rect
                                  id="Rectangle"
                                  stroke="#FFFFFF"
                                  strokeWidth="2.93333333"
                                  strokeLinejoin="round"
                                  x="0"
                                  y="11.7333333"
                                  width="21.5111111"
                                  height="17.6"
                                  rx="2.93333333"
                                ></rect>
                                <path
                                  d="M10.7555556,1.46666667 C12.1055849,1.46666667 13.3278072,2.01387419 14.212522,2.89858907 C15.0972369,3.78330394 15.6444444,5.00552617 15.6444444,6.35555556 L15.6444444,6.35555556 L15.6444444,10.7555556 L6.35555556,11.2444444 L5.86666667,6.35555556 C5.86666667,5.00552617 6.41387419,3.78330394 7.29858907,2.89858907 C8.18330394,2.01387419 9.40552617,1.46666667 10.7555556,1.46666667 Z"
                                  id="Rectangle"
                                  stroke="#FFFFFF"
                                  strokeWidth="2.93333333"
                                ></path>
                                <g
                                  id="Group-2"
                                  transform="translate(8.311111, 16.622222)"
                                >
                                  <circle
                                    id="Oval"
                                    fill="#FFFFFF"
                                    cx="2.44444444"
                                    cy="2.44444444"
                                    r="2.44444444"
                                  ></circle>
                                  <line
                                    x1="2.44444444"
                                    y1="3.42222222"
                                    x2="2.44444444"
                                    y2="7.33333333"
                                    id="Line"
                                    stroke="#FFFFFF"
                                    strokeWidth="2.93333333"
                                    strokeLinecap="round"
                                  ></line>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </span>
                  <span className="tri-block__link-text">
                    Reproducable Analyses
                  </span>
                </a>
                <p>
                  Browse R generated reports for reanalyzed studies and virtual
                  meta-analysis studies.
                </p>
              </div>
              <div className="tri-block__block">
                <a
                  href="/project/Studies/begin.view?"
                  className="tri-block__cta"
                  title="Data Finder link"
                >
                  <span className="tri-block__icon">
                    {/* <!-- ?xml version="1.0" encoding="UTF-8"? --> */}
                    <svg
                      className="icon icon-svg"
                      width="170px"
                      height="114px"
                      viewBox="0 0 170 114"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>Data Finder Icon</title>
                      <g
                        id="Landing-Page"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="Home"
                          transform="translate(-813.000000, -496.000000)"
                        >
                          <g
                            id="Group-14"
                            transform="translate(816.000000, 496.000000)"
                          >
                            <g
                              id="Group-35"
                              transform="translate(0.000000, 15.000000)"
                            >
                              <path
                                d="M19,13.5014153 C19,15.4346947 17.4318641,17 15.4985847,17 C13.5681359,17 12,15.4346947 12,13.5014153 C12,11.5681359 13.5681359,10 15.4985847,10 C17.4318641,10 19,11.5681359 19,13.5014153"
                                id="Fill-1"
                                fill="#B4BBBF"
                              ></path>
                              <path
                                d="M32,13.5014153 C32,15.4346947 30.4318641,17 28.4985847,17 C26.5681359,17 25,15.4346947 25,13.5014153 C25,11.5681359 26.5681359,10 28.4985847,10 C30.4318641,10 32,11.5681359 32,13.5014153"
                                id="Fill-3"
                                fill="#B4BBBF"
                              ></path>
                              <path
                                d="M45,13.5014153 C45,15.4346947 43.4318641,17 41.5014153,17 C39.5681359,17 38,15.4346947 38,13.5014153 C38,11.5681359 39.5681359,10 41.5014153,10 C43.4318641,10 45,11.5681359 45,13.5014153"
                                id="Fill-5"
                                fill="#B4BBBF"
                              ></path>
                              <polygon
                                id="Stroke-9"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="140 96 0 96 0 0 140 0 140 36.4142895"
                              ></polygon>
                              <line
                                x1="0"
                                y1="26"
                                x2="140"
                                y2="26"
                                id="Stroke-11"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></line>
                              <polyline
                                id="Stroke-19"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                                points="46 43 18 43 18 83"
                              ></polyline>
                              <line
                                x1="20"
                                y1="55"
                                x2="57"
                                y2="55"
                                id="Stroke-21"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="20"
                                y1="67"
                                x2="45"
                                y2="67"
                                id="Stroke-23"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="19"
                                y1="83"
                                x2="49"
                                y2="83"
                                id="Stroke-25"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                              ></line>
                              <polyline
                                id="Stroke-27"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                                points="102 43 77 43 77 83"
                              ></polyline>
                              <line
                                x1="79"
                                y1="55"
                                x2="110"
                                y2="55"
                                id="Stroke-29"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="79"
                                y1="67"
                                x2="117"
                                y2="67"
                                id="Stroke-31"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                              ></line>
                              <line
                                x1="78"
                                y1="83"
                                x2="90"
                                y2="83"
                                id="Stroke-33"
                                stroke="#B4BBBF"
                                strokeWidth="4.3"
                                strokeLinecap="round"
                              ></line>
                            </g>
                            <g
                              id="Group-12"
                              transform="translate(134.000000, 10.000000)"
                            >
                              <g
                                id="Group-3"
                                transform="translate(0.400000, 0.700000)"
                              >
                                <rect
                                  id="Rectangle"
                                  stroke="#FFFFFF"
                                  strokeWidth="3.3"
                                  strokeLinejoin="round"
                                  x="0"
                                  y="13.2"
                                  width="24.2"
                                  height="19.8"
                                  rx="3.3"
                                ></rect>
                                <path
                                  d="M12.1,1.65 C13.6187831,1.65 14.9937831,2.26560847 15.9890873,3.2609127 C16.9843915,4.25621694 17.6,5.63121694 17.6,7.15 L17.6,7.15 L17.6,12.1 L7.15,12.65 L6.6,7.15 C6.6,5.63121694 7.21560847,4.25621694 8.2109127,3.2609127 C9.20621694,2.26560847 10.5812169,1.65 12.1,1.65 L12.1,1.65 Z"
                                  id="Rectangle"
                                  stroke="#FFFFFF"
                                  strokeWidth="3.3"
                                ></path>
                                <g
                                  id="Group-2"
                                  transform="translate(9.350000, 18.700000)"
                                >
                                  <circle
                                    id="Oval"
                                    fill="#FFFFFF"
                                    cx="2.75"
                                    cy="2.75"
                                    r="2.75"
                                  ></circle>
                                  <line
                                    x1="2.75"
                                    y1="3.85"
                                    x2="2.75"
                                    y2="8.25"
                                    id="Line"
                                    stroke="#FFFFFF"
                                    strokeWidth="3.3"
                                    strokeLinecap="round"
                                  ></line>
                                </g>
                              </g>
                            </g>
                            <path
                              d="M19,28.5014153 C19,30.4346947 17.4318641,32 15.4985847,32 C13.5681359,32 12,30.4346947 12,28.5014153 C12,26.5681359 13.5681359,25 15.4985847,25 C17.4318641,25 19,26.5681359 19,28.5014153"
                              id="Fill-1"
                              fill="#FF5B00"
                            ></path>
                            <path
                              d="M32,28.5014153 C32,30.4346947 30.4318641,32 28.4985847,32 C26.5681359,32 25,30.4346947 25,28.5014153 C25,26.5681359 26.5681359,25 28.4985847,25 C30.4318641,25 32,26.5681359 32,28.5014153"
                              id="Fill-3"
                              fill="#0F91F2"
                            ></path>
                            <path
                              d="M45,28.5014153 C45,30.4346947 43.4318641,32 41.5014153,32 C39.5681359,32 38,30.4346947 38,28.5014153 C38,26.5681359 39.5681359,25 41.5014153,25 C43.4318641,25 45,26.5681359 45,28.5014153"
                              id="Fill-5"
                              fill="#0F91F2"
                            ></path>
                            <polygon
                              id="Stroke-9"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points="140 111 0 111 0 15 140 15 140 51.4142895"
                            ></polygon>
                            <line
                              x1="0"
                              y1="41"
                              x2="140"
                              y2="41"
                              id="Stroke-11"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></line>
                            <line
                              x1="20"
                              y1="70"
                              x2="57"
                              y2="70"
                              id="Stroke-21"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                            ></line>
                            <line
                              x1="20"
                              y1="82"
                              x2="45"
                              y2="82"
                              id="Stroke-23"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                            ></line>
                            <line
                              x1="19"
                              y1="98"
                              x2="49"
                              y2="98"
                              id="Stroke-25"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                            ></line>
                            <line
                              x1="79"
                              y1="70"
                              x2="110"
                              y2="70"
                              id="Stroke-29"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                            ></line>
                            <line
                              x1="79"
                              y1="82"
                              x2="117"
                              y2="82"
                              id="Stroke-31"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                            ></line>
                            <line
                              x1="78"
                              y1="98"
                              x2="90"
                              y2="98"
                              id="Stroke-33"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                            ></line>
                            <g
                              id="Group-12"
                              transform="translate(119.000000, 0.000000)"
                            >
                              <circle
                                id="Oval"
                                fill="#1A1A1A"
                                cx="23.9555556"
                                cy="23.9555556"
                                r="23.9555556"
                              ></circle>
                              <g
                                id="Group-3"
                                transform="translate(13.688889, 6.844444)"
                              >
                                <rect
                                  id="Rectangle"
                                  stroke="#FFFFFF"
                                  strokeWidth="2.93333333"
                                  strokeLinejoin="round"
                                  x="0"
                                  y="11.7333333"
                                  width="21.5111111"
                                  height="17.6"
                                  rx="2.93333333"
                                ></rect>
                                <path
                                  d="M10.7555556,1.46666667 C12.1055849,1.46666667 13.3278072,2.01387419 14.212522,2.89858907 C15.0972369,3.78330394 15.6444444,5.00552617 15.6444444,6.35555556 L15.6444444,6.35555556 L15.6444444,10.7555556 L6.35555556,11.2444444 L5.86666667,6.35555556 C5.86666667,5.00552617 6.41387419,3.78330394 7.29858907,2.89858907 C8.18330394,2.01387419 9.40552617,1.46666667 10.7555556,1.46666667 Z"
                                  id="Rectangle"
                                  stroke="#FFFFFF"
                                  strokeWidth="2.93333333"
                                ></path>
                                <g
                                  id="Group-2"
                                  transform="translate(8.311111, 16.622222)"
                                >
                                  <circle
                                    id="Oval"
                                    fill="#FFFFFF"
                                    cx="2.44444444"
                                    cy="2.44444444"
                                    r="2.44444444"
                                  ></circle>
                                  <line
                                    x1="2.44444444"
                                    y1="3.42222222"
                                    x2="2.44444444"
                                    y2="7.33333333"
                                    id="Line"
                                    stroke="#FFFFFF"
                                    strokeWidth="2.93333333"
                                    strokeLinecap="round"
                                  ></line>
                                </g>
                              </g>
                            </g>
                            <polyline
                              id="Stroke-19"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                              points="46 58 18 58 18 98"
                            ></polyline>
                            <polyline
                              id="Stroke-27"
                              stroke="#0F91F2"
                              strokeWidth="4.3"
                              strokeLinecap="round"
                              points="102 58 77 58 77 98"
                            ></polyline>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </span>
                  <span className="tri-block__link-text">Data Finder</span>
                </a>
                <p>
                  Find participant-level data from all studies. Download or
                  explore this data using our broad range of visualization and
                  computational tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Insert tutorial block here after tutorial has been made*/}

        <section className="history-block">
          <div className="container">
            <div className="history-block__content">
              <h2 className="history-block__title">Our Brief History: HIPC</h2>
              <div className="history-block__copy">
                <p>
                  The Human Immunology Project Consortium (HIPC) program,
                  established in 2010 by the NIAID Division of Allergy,
                  Immunology, and Transplantation, is a major collaborative
                  effort that is generating large amounts of cross-center and
                  cross-assay data — including high-dimensional data — to
                  characterize the status of the immune system in diverse
                  populations under both normal conditions and in response to
                  stimuli — This large data problem has given birth to
                  ImmuneSpace
                </p>
                <a
                  href="/project/home/begin.view?"
                  className="history-block__cta"
                  title="About Us link"
                >
                  <span className="history-block__link-text">About Us</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        {
          <Registermodal
            isOpen={regModalOpen}
            setRegModalOpen={setRegModalOpen}
          />
        }
      </main>
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer__content">
            <div className="footer__logo">
              <a
                href="/"
                title="immuneSpace Home"
                className="entrance-page-footer-link-non-social"
              >
                <img
                  className="footer__img"
                  src={ImmunespaceFooterLogo}
                  srcSet={ImmunespaceFooterLogo}
                  alt="immuneSpace logo"
                />
              </a>
              <ul className="footer__mobile-social-nav h-o-d">
                <li>
                  <a
                    href="https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fwww.immunespace.org%2F&ref_src=twsrc%5Etfw&region=follow_link&screen_name=immunespace&tw_p=followbutton"
                    className="footer__twitter"
                    title="Follow us on Twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      viewBox="0 0 15 13"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>Follow Us SVG Icon</title>
                      <g
                        id="Symbols"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="footer"
                          transform="translate(-954.000000, -38.000000)"
                          fill="#FFFFFF"
                          fillRule="nonzero"
                        >
                          <g
                            id="twittericon"
                            transform="translate(954.000000, 38.000000)"
                          >
                            <path
                              d="M0,11.0358612 C1.69307363,11.0806769 3.11997129,10.7731915 4.45328197,9.75114504 C3.11632505,9.52084224 2.17437812,8.8946676 1.65782658,7.562646 L2.67391385,7.562646 C1.45849846,6.86924784 0.638093077,5.95924056 0.582183969,4.44173184 L1.89361717,4.80150216 C0.589476462,3.51803088 0.243083077,2.19845808 0.997856031,0.58633848 C2.69943757,2.55698352 4.76564372,3.65496768 7.33381643,3.84916896 C7.33381643,3.454542 7.29249231,3.10224096 7.33381643,2.76612336 C7.66927108,0.4170348 10.2495979,-0.7967232 12.1432151,0.5788692 C12.7229682,0.99963864 13.1556561,0.90751752 13.6855772,0.71207136 C13.9639074,0.60874632 14.2325142,0.4792788 14.5059826,0.3610152 L14.6275242,0.47180952 L13.6333144,1.89968688 L14.8596685,1.618344 L14.9471784,1.70922024 C14.61537,2.0665008 14.2604687,2.4026184 13.9614765,2.78728632 C13.7803796,3.02132376 13.5846978,3.3238296 13.5713282,3.6039276 C13.3561997,7.99959888 10.5838372,11.421774 6.50368772,12.240905 C4.25395385,12.697776 2.14034649,12.3081286 0,11.0358612 Z"
                              id="Path"
                            ></path>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:ops@immunespace.org"
                    className="footer__email"
                  >
                    <svg
                      viewBox="0 0 21 12"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>Follow Us Twitter SVG Icon</title>
                      <g
                        id="Symbols"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="footer"
                          transform="translate(-1091.000000, -38.000000)"
                        >
                          <g
                            id="Group-7"
                            transform="translate(-29.000000, -21.000000)"
                          >
                            <g
                              id="Group-5"
                              transform="translate(1121.000000, 60.000000)"
                            >
                              <rect
                                id="Rectangle"
                                fill="#FFFFFF"
                                x="2.41104861"
                                y="0.0328241227"
                                width="14.4"
                                height="10.8"
                                rx="0.9"
                              ></rect>
                              <polyline
                                id="Path-3"
                                stroke="#1A1A1A"
                                strokeWidth="0.9"
                                points="-3.51718654e-14 0.0438158665 9.6148033 7.2 19.2220972 0"
                              ></polyline>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer__credits">
              <p>
                ImmuneSpace is powered by{" "}
                <a
                  href="https://www.labkey.com/"
                  title="LabKey Software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entrance-page-footer-link-non-social"
                >
                  LabKey Software
                </a>
                , supported by{" "}
                <a
                  href="http://www.immuneprofiling.org/"
                  title="HIPC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entrance-page-footer-link-non-social"
                >
                  HIPC
                </a>{" "}
                and{" "}
                <a
                  href="https://www.niaid.nih.gov/"
                  title="National Institute of Allergy and Infectious Diseases (NIAID) link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entrance-page-footer-link-non-social"
                >
                  NIAID
                </a>
              </p>
            </div>
            <div className="footer__social h-o-m">
              <ul>
                <li>
                  <a
                    href="https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fwww.immunespace.org%2F&ref_src=twsrc%5Etfw&region=follow_link&screen_name=immunespace&tw_p=followbutton"
                    className="footer__twitter"
                    title="Follow Us on Twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>follow us</span>
                    <svg
                      viewBox="0 0 15 13"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>Twitter Icon</title>
                      <g
                        id="Symbols"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="footer"
                          transform="translate(-954.000000, -38.000000)"
                          fill="#FFFFFF"
                          fillRule="nonzero"
                        >
                          <g
                            id="twittericon"
                            transform="translate(954.000000, 38.000000)"
                          >
                            <path
                              d="M0,11.0358612 C1.69307363,11.0806769 3.11997129,10.7731915 4.45328197,9.75114504 C3.11632505,9.52084224 2.17437812,8.8946676 1.65782658,7.562646 L2.67391385,7.562646 C1.45849846,6.86924784 0.638093077,5.95924056 0.582183969,4.44173184 L1.89361717,4.80150216 C0.589476462,3.51803088 0.243083077,2.19845808 0.997856031,0.58633848 C2.69943757,2.55698352 4.76564372,3.65496768 7.33381643,3.84916896 C7.33381643,3.454542 7.29249231,3.10224096 7.33381643,2.76612336 C7.66927108,0.4170348 10.2495979,-0.7967232 12.1432151,0.5788692 C12.7229682,0.99963864 13.1556561,0.90751752 13.6855772,0.71207136 C13.9639074,0.60874632 14.2325142,0.4792788 14.5059826,0.3610152 L14.6275242,0.47180952 L13.6333144,1.89968688 L14.8596685,1.618344 L14.9471784,1.70922024 C14.61537,2.0665008 14.2604687,2.4026184 13.9614765,2.78728632 C13.7803796,3.02132376 13.5846978,3.3238296 13.5713282,3.6039276 C13.3561997,7.99959888 10.5838372,11.421774 6.50368772,12.240905 C4.25395385,12.697776 2.14034649,12.3081286 0,11.0358612 Z"
                              id="Path"
                            ></path>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:ops@immunespace.org"
                    className="footer__email"
                  >
                    <span>contact us</span>
                    <svg
                      viewBox="0 0 21 12"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <title>Email Icon</title>
                      <g
                        id="Symbols"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="footer"
                          transform="translate(-1091.000000, -38.000000)"
                        >
                          <g
                            id="Group-7"
                            transform="translate(-29.000000, -21.000000)"
                          >
                            <g
                              id="Group-5"
                              transform="translate(1121.000000, 60.000000)"
                            >
                              <rect
                                id="Rectangle"
                                fill="#FFFFFF"
                                x="2.41104861"
                                y="0.0328241227"
                                width="14.4"
                                height="10.8"
                                rx="0.9"
                              ></rect>
                              <polyline
                                id="Path-3"
                                stroke="#1A1A1A"
                                strokeWidth="0.9"
                                points="-3.51718654e-14 0.0438158665 9.6148033 7.2 19.2220972 0"
                              ></polyline>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
