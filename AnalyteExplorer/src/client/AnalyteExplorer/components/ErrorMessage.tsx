import React from "react";
import "./ErrorMessage.scss";

export const ErrorMessageHome: React.FC = () => {
  return (
    <div className="ae-error-message-home">
      <span>OOPS SOMETHING WENT WRONG</span>
    </div>
  );
};

export const ErrorMessageDownload: React.FC = () => {
  return <ErrorMessageHome />;
};

export const ErrorMessageConditionNotFound: React.FC = () => {
  return (
    <div>
      <span>Unable to find data for TYPES</span>
    </div>
  );
};
