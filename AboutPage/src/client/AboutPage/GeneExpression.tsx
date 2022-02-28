import * as React from "react";

export const GeneExpression: React.FC = () => {
  return (
    <div id="GeneExpression-content">
      <img src="/AboutPage/images/ge_standardization.png" />
      <h2>Details</h2>
      <p>
        Bulk gene expression processing and standardization in ImmuneSpace is
        facilitated by the{" "}
        <a href="https://github.com/RGLab/HIPCMatrix">HIPCMatrix</a> R package.
      </p>
    </div>
  );
};
