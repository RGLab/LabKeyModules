/**
 * @jest-environment jsdom
 */

import { setupLinePlotData } from "../src/client/AnalyteExplorer/components/data_viz/dataVizHelperFuncs";
import {
  organizeD3Data,
  RowData,
} from "../src/client/AnalyteExplorer/components/DownloadPage";

describe("test setupLinePlotData", () => {
  const condition = "Meningitis";

  test("undefined data", () => {
    expect(setupLinePlotData(undefined)).toEqual([[], []]);
  });

  test("working data, no trendline", () => {
    const mockData: RowData[] = [
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4355",
        cohort: "MCV4",
        cohort_description:
          "Immunized with MCV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 0,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1260",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4355",
        cohort: "MCV4",
        cohort_description:
          "Immunized with MCV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 0.0377534555518258,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0.269380962457554,
        study_accession: "SDY1260",
        timepoint: 3,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4356",
        cohort: "MPSV4",
        cohort_description:
          "Immunized with MPSV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 0.0377091099195492,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0.312870104463717,
        study_accession: "SDY1260",
        timepoint: 7,
      },
    ];
    const mockLinePlotProps = organizeD3Data(condition, mockData);
    const mockReturn = [
      [
        {
          name: "MCV4",
          study: "SDY1260",
          data: [
            {
              x: 0,
              y: 0,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0,
            },
            {
              x: 3,
              y: 0.0377534555518258,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0.269380962457554,
            },
          ],
        },
        {
          name: "MPSV4",
          study: "SDY1260",
          data: [
            {
              x: 7,
              y: 0.0377091099195492,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0.312870104463717,
            },
          ],
        },
      ],
      [],
    ];
    expect(setupLinePlotData(mockLinePlotProps.data)).toEqual(mockReturn);
  });

  test("working data, has trendline", () => {
    const mockData: RowData[] = [
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4355",
        cohort: "MCV4",
        cohort_description:
          "Immunized with MCV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 0,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1260",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4355",
        cohort: "MCV4",
        cohort_description:
          "Immunized with MCV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 0.0377534555518258,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0.269380962457554,
        study_accession: "SDY1260",
        timepoint: 3,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4356",
        cohort: "MPSV4",
        cohort_description:
          "Immunized with MPSV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 1,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1260",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        arm_accession: "ARM4356",

        cohort: "MPSV4",
        cohort_description:
          "Immunized with MPSV4, blood collected on D0,D3,D7,D14,D30,D180",
        condition: "Meningitis",
        mean_fold_change: 0.1377534555518258,
        research_focus: "Vaccine Response",
        sample_type: "PBMC",
        sd_fold_change: 0.269380962457554,
        study_accession: "SDY1260",
        timepoint: 3,
      },
    ];
    const mockLinePlotProps = organizeD3Data(condition, mockData);

    const mockReturn = [
      [
        {
          name: "MCV4",
          study: "SDY1260",
          data: [
            {
              x: 0,
              y: 0,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0,
            },
            {
              x: 3,
              y: 0.0377534555518258,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0.269380962457554,
            },
          ],
        },
        {
          name: "MPSV4",
          study: "SDY1260",
          data: [
            {
              x: 0,
              y: 1,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0,
            },
            {
              x: 3,
              y: 0.1377534555518258,
              study: "SDY1260",
              research: "Vaccine Response",
              sample: "PBMC",
              sd: 0.269380962457554,
            },
          ],
        },
        {
          name: "Average",
          study: "Trend",
          data: [
            {
              x: 0,
              y: 0.5,
              study: "Trend",
              research: undefined,
              sample: undefined,
              sd: null,
            },
            {
              x: 3,
              y: 0.0877534555518258,
              study: "Trend",
              research: undefined,
              sample: undefined,
              sd: null,
            },
          ],
        },
      ],
      [
        {
          name: "Average",
          study: "Trend",
          data: [
            {
              x: 0,
              y: 0.5,
              study: "Trend",
              research: undefined,
              sample: undefined,
              sd: null,
            },
            {
              x: 3,
              y: 0.0877534555518258,
              study: "Trend",
              research: undefined,
              sample: undefined,
              sd: null,
            },
          ],
        },
      ],
    ];
    expect(setupLinePlotData(mockLinePlotProps.data)).toEqual(mockReturn);
  });
});
