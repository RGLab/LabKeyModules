import React from "react";
import { Spinner } from "react-bootstrap";
import Halogen from "halogen";
import "./AESpinner.scss";

const AESpinner: React.FC = () => {
  var color = "#4DAF7C";

  return (
    <div className="ae-spinner-container">
      <div className="circleloader"></div>
    </div>
  );
};

export default AESpinner;
