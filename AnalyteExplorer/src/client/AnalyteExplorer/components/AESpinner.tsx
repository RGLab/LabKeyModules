import React from "react";
import "./AESpinner.scss";

const AESpinner: React.FC = () => {
  return (
    <div className="ae-spinner-container">
      <div className="circleloader" role="status"></div>
    </div>
  );
};

export default AESpinner;
