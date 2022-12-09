import React, { useState } from "react";
import "./scss/main.scss";
import "./App.css";

import Registermodal from "./components/RegisterModal";
import ImmunespaceHeaderLogo from "./assets/logo-immunespace-whiteblue-desk.svg";
import ImmunespaceFooterLogo from "./assets/footer-logo-immunespace-whiteblue.png";
import { ReactComponent as AEIcon } from "./assets/icons/icon-analyte-explorer-white.svg";
import { ReactComponent as DFIcon } from "./assets/icons/icon-data-finder-white.svg";
import { ReactComponent as RAIcon } from "./assets/icons/icon-reproducible-analyses-white.svg";
import { ReactComponent as TwitterIcon } from "./assets/icons/icon-social-twitter-white.svg";
import { ReactComponent as EmailIcon } from "./assets/icons/icon-email-white.svg";
import { ReactComponent as ArrowRight } from "./assets/icons/icon-arrow-right-blue.svg";

const App = () => {
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
                  onClick={regBtnClick}>
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
                  <ArrowRight className="hero__svg-arrow-right" />
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="tri-block">
          <div className="container">
            <div className="tri-block__content">
              <div className="tri-block__block">
                <a
                  href="project/AnalyteExplorer/begin.view?"
                  className="tri-block__cta"
                  title="Analyte Explorer link">
                  <span className="tri-block__icon">
                    <AEIcon />
                  </span>
                  <span className="tri-block__link-text">Analyte Explorer</span>
                </a>
                <p>
                  Visualize analyte expression patterns over time for various
                  disease states, aggregated by cohort.
                </p>
              </div>
              <div className="tri-block__block">
                <a
                  href="/project/Studies/begin.view?pageId=Resources"
                  className="tri-block__cta"
                  title="Reproducible Analyses link">
                  <span className="tri-block__icon">
                    {/* <!-- ?xml version="1.0" encoding="UTF-8"? --> */}
                    <RAIcon />
                  </span>
                  <span className="tri-block__link-text">
                    Reproducible Analyses
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
                  title="Data Finder link">
                  <span className="tri-block__icon">
                    {/* <!-- ?xml version="1.0" encoding="UTF-8"? --> */}
                    <DFIcon className="icon icon-svg" />
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
                  href="/project/home/begin.view?tab=About"
                  className="history-block__cta"
                  title="About Us link">
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
                className="entrance-page-footer-link-non-social">
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
                    rel="noopener noreferrer">
                    <TwitterIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:immunespace@gmail.com"
                    className="footer__email">
                    <EmailIcon />
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
                  className="entrance-page-footer-link-non-social">
                  LabKey Software
                </a>
                , supported by{" "}
                <a
                  href="http://www.immuneprofiling.org/"
                  title="HIPC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entrance-page-footer-link-non-social">
                  HIPC
                </a>{" "}
                and{" "}
                <a
                  href="https://www.niaid.nih.gov/"
                  title="National Institute of Allergy and Infectious Diseases (NIAID) link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entrance-page-footer-link-non-social">
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
                    rel="noopener noreferrer">
                    <span>follow us</span>
                    <TwitterIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:immunespace@gmail.com"
                    className="footer__email">
                    <span>contact us</span>
                    <EmailIcon />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
