import * as React from "react";
import ArrowLink from "./components/ArrowLink";

export const ImmuneSpaceR: React.FC = () => {
  return (
    <main className="page-content">
      <section className="content-grid__immunespaceR">
        <div className="immunespaceR-content grid-item">
          <h1>ImmuneSpaceR</h1>
          <img
            id="immunespaceR-logo-mobile"
            className="immunespaceR-logo-img"
            src="/ResourcesPage/images/sticker3.svg"
            alt="immunespaceR logo"
          />
          <div className="immunespaceR-text">
            <p>
              A thin wrapper around Rlabkey to access the ImmuneSpace database
              from R.
            </p>
            <p>
              This package simplifies access to the HIPC ImmuneSpace database
              for R programmers. It takes advantage of the standardization of
              the database to hide all the Rlabkey specific code away from the
              user. The study-specific datasets can be accessed via an
              object-oriented paradigm.
            </p>
          </div>
          <ArrowLink
            href="https://rglab.github.io/ImmuneSpaceR/"
            text="Learn More"
          />
        </div>

        <div className="immunespaceR-logo grid-item">
          <img
            id="immunespaceR-logo-desk"
            className="immunespaceR-logo-img"
            src="/ResourcesPage/images/sticker3.svg"
            alt="immunespaceR logo"
          />
        </div>
      </section>
    </main>
  );
};
