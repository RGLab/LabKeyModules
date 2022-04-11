import { PlotMenuSpecs } from "../StudyStatistics";

export const SELECT_PLOT_TYPE_MENU_PROPS: PlotMenuSpecs = {
  id: "select-plot-type",
  name: "Select Plot Type",
  options: [
    { id: "study", value: "study-UI", label: "By Study" },
    { id: "month", value: "month", label: "By Month" },
  ],
};

export const SELECT_ORDER_MENU_PROPS: PlotMenuSpecs = {
  id: "select-order",
  name: "Select Order",
  options: [
    { id: "UI", value: "study-UI", label: "UI Pageviews" },
    { id: "ISR", value: "study-ISR", label: "ImmuneSpaceR connections" },
    { id: "total", value: "study-total", label: "All Interactions" },
  ],
};

export const MC_SELECT_ORDER_MENU_PROPS: PlotMenuSpecs = {
  id: "mc-select-order",
  name: "Select Order",
  options: [
    { id: "value", value: "cited", label: "Most Cited" },
    { id: "studyNum", value: "studyId", label: "Study ID" },
    { id: "datePublishedFloat", value: "recent", label: "Most Recent" },
  ],
};

export const SS_SELECT_PLOT_SET_MENU_PROPS: PlotMenuSpecs = {
  id: "ss-select-plot-set",
  name: "Select Plot Set",
  options: [
    { id: "assays", value: "assays", label: "Assay Data Available" },
    { id: "studyDesign", value: "design", label: "Study Design" },
    { id: "condition", value: "condition", label: "Condition Studied" },
  ],
};

export const MA_FOOTER_TEXT_STUDY = [
  "Hover over each bar for specific study data",
  "Click on the Y-axis label to go to study overview page",
  // eslint-disable-next-line quotes
  'Toggle between a chronological view of user interactions "By Month" or on a per study basis with "By Study"',
];

export const MA_FOOTER_TEXT_MONTH = [
  // eslint-disable-next-line quotes
  'Toggle between a chronological view of user interactions "By Month" or on a per study basis with "By Study"',
];

export const MC_FOOTER_TEXT = [
  "Hover over each bar for publication information",
  "Click on the Y-axis label to go to PubMed page for the publication",
  "Update the ordering of the publications using the dropdown menu below",
];

export const SS_FOOTER_TEXT = [
  "Hover over a point for a link to the study overview page",
  "Toggle between plots with LABELS for Assay Data Available, Study Design, or Condition Studied using the dropdown menu",
];
