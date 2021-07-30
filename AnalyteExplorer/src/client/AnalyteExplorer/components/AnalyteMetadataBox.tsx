import React from "react";
import "./AnalyteMetadataBox.scss";
import { CgChevronDoubleDownO, CgChevronDoubleUpO } from "react-icons/cg";
import { CSSTransition } from "react-transition-group";

interface AnalyteMetadataBoxProps {
  title?: string;
  subtitle?: string;
  body?: string;
}

const AnalyteMetadataBox: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const metaDropdownOnClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="analyte-metadata-box">
      <div className="analyte-metadata-box__title">
        <h3 onClick={metaDropdownOnClick}>A2M: Alpha-2-Macroglobulin</h3>
        <CSSTransition
          in={!isOpen}
          timeout={300}
          classNames="rotate"
          unmountOnExit>
          <CgChevronDoubleDownO
            className="analyte-metadata-box__icon"
            onClick={metaDropdownOnClick}
          />
        </CSSTransition>
        <CSSTransition
          in={isOpen}
          timeout={300}
          classNames="rotate"
          unmountOnExit>
          <CgChevronDoubleUpO
            className="analyte-metadata-box__icon"
            onClick={metaDropdownOnClick}
          />
        </CSSTransition>
      </div>
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="extend"
        unmountOnExit>
        <div className="analyte-metadata-box__text">
          <p>protein-coding / Aliases: A2MD, CPAMD5, FWP007, S863-7</p>
          <p>
            The protein encoded by this gene is a member of the superfamily of
            ATP-binding cassette (ABC) transporters. ABC proteins transport
            various molecules across extra- and intra-cellular membranes. ABC
            genes are divided into seven distinct subfamilies (ABC1, MDR/TAP,
            MRP, ALD, OABP, GCN20, White). This protein is a member of the ABC1
            subfamily. Members of the ABC1 subfamily comprise the only major ABC
            subfamily found exclusively in multicellular eukaryotes. This full
            transporter has been detected predominantly in myelo-lymphatic
            tissues with the highest expression in peripheral leukocytes,
            thymus, spleen, and bone marrow. The function of this protein is not
            yet known; however, the expression pattern suggests a role in lipid
            homeostasis in cells of the immune system.
          </p>
        </div>
      </CSSTransition>
    </div>
  );
};

export default AnalyteMetadataBox;
