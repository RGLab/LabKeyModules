import React from "react";
import { Spinner } from "react-bootstrap";
import "./AESpinner.scss";

const AESpinner: React.FC = () => {
  return (
    <div className="ae-spinner-container">
      <Spinner className="ae-spinner" animation="border" variant="primary" />
    </div>
  );
};

export default AESpinner;
