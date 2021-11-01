import React from "react";
import "./ErrorMessage.scss";

export const ErrorMessageHome: React.FC = () => {
  return (
    <div className="ae-error-message-home">
      <span>OOPS SOMETHING WENT WRONG</span>
    </div>
  );
};

interface ErrorMessageConditionNotFoundProps {
  types: string[];
}

export const ErrorMessageConditionNotFound: React.FC<ErrorMessageConditionNotFoundProps> =
  ({ types }) => {
    return (
      <div className="ae-error-condition-not-found">
        <span>{`Unable to find data for ${types}`}</span>
      </div>
    );
  };
