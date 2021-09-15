export const ANALYTE_ALL = "All";
export const ANALYTE_GENE = "Gene";
export const ANALYTE_PGS = "Published Gene Set";
export const ANALYTE_BTM = "Blood Transcription Module (BTM)";
export const FILTER_DROPDOWN_ROW_COUNT = 5;

export const ANALYTE_TYPE_DISPLAYNAMES = [
  ANALYTE_ALL,
  ANALYTE_GENE,
  ANALYTE_BTM,
];
export const ANALYTE_TYPES = [
  { type: "gene", displayName: "Gene" },
  {
    type: "blood transcription module",
    displayName: "Blood Transcription Module (BTM)",
  },
];

export const ANALYTE_TYPE_DISPLAY_TO_COLUMN = {
  "Gene": "gene",
  "Blood Transcription Module (BTM)": "blood transcription module",
};

export const ANALYTE_TYPE_COLUMN_TO_DISPLAY = {
  "gene": "Gene",
  "blood transcription module": "Blood Transcription Module (BTM)",
};
