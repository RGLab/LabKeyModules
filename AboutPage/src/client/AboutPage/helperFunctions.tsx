import { ScriptLoader } from "./ScriptLoader";

// moved from RSessioninfo for testing reasons
export const renderHtmlWidget = () => {
  const jQueryLoaded = typeof window["jQuery"] !== undefined;
  const DataTableLoaded = typeof window["jQuery"]().DataTable !== undefined;
  if (jQueryLoaded && DataTableLoaded) {
    window["HTMLWidgets"].staticRender();
    ScriptLoader.restoreJQuery();
  } else {
    console.error("DataTable and jQuery libraries loaded improperly");
  }
};
