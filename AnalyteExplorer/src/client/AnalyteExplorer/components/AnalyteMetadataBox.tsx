import React from "react";
import "./AnalyteMetadataBox.scss";
import { CgChevronDoubleDownO, CgChevronDoubleUpO } from "react-icons/cg";
import { CSSTransition } from "react-transition-group";

export interface AnalyteMetadataBoxProps {
  title: string;
  body: string;
  subtitle?: string;
}

const AnalyteMetadataBox: React.FC<AnalyteMetadataBoxProps> = ({
  title,
  subtitle,
  body,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const metaDropdownOnClick = React.useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className={`analyte-metadata-box${isOpen ? " open" : ""}`}>
      <div className="analyte-metadata-box__title">
        <h3 onClick={metaDropdownOnClick}>{`${title ?? ""}`}</h3>
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
          <p>{subtitle ?? ""}</p>
          <p>{`${body ?? ""}`}</p>
        </div>
      </CSSTransition>
    </div>
  );
};

export default AnalyteMetadataBox;
