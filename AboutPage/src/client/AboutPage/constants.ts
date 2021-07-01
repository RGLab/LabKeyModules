export const TAB_ABOUT = "About";
export const TAB_DATASTANDARDS = "DataStandards";
export const TAB_DATAPROCESSING = "DataProcessing";
export const TAB_CYTOMETRY = "cytometry";
export const TAB_GENEEXPRESSION = "GeneExpression";
export const TAB_IMMUNERESPONSE = "immune-response";
export const TAB_DATARELEASES = "DataReleases";
export const TAB_SOFTWAREUPDATES = "SoftwareUpdates";
export const TAB_RSESSIONINFO = "RSessionInfo";

export const tabInfo = [
  {
    id: "about",
    tag: TAB_ABOUT,
    text: "About",
  },
  {
    id: "data-standards",
    tag: TAB_DATASTANDARDS,
    text: "Data Standards",
  },
  {
    id: "data-processing",
    tag: TAB_DATAPROCESSING,
    text: "Data Processing",
    subMenu: [
      /*{
                id: "cytometry",
                tag: TAB_CYTOMETRY,
                text: "Cytometry",
            },*/
      {
        id: "gene-expression",
        tag: TAB_GENEEXPRESSION,
        text: "Gene Expression",
      },
      /*{
                id: "immune-response",
                tag: TAB_IMMUNERESPONSE,
                text: "Immune Response",
            }*/
    ],
  },
  {
    id: "data-release",
    tag: TAB_DATARELEASES,
    text: "Data Releases",
  },
  {
    id: "software-updates",
    tag: TAB_SOFTWAREUPDATES,
    text: "Software Updates",
  },
  {
    id: "r-session-info",
    tag: TAB_RSESSIONINFO,
    text: "R Session Info",
  },
];
