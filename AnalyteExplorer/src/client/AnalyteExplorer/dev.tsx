import * as React from "react";
import * as ReactDOM from "react-dom";

import { AppContainer } from "react-hot-loader";

import App from "./AnalyteExplorer";

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById("analyte-explorer")
  );
};

declare const module: any;

window.addEventListener("DOMContentLoaded", () => {
  render();
  if (module.hot) {
    module.hot.accept();
  }
});
