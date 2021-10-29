/**
 * @jest-environment jsdom
 */

import { setupLinePlotData } from "../src/client/AnalyteExplorer/components/data_viz/dataVizHelperFuncs";
import { organizeD3Data } from "../src/client/AnalyteExplorer/components/DownloadPage";

describe("test setupLinePlotData", () => {
  const condition = "Meningitis";

  test("undefined data", () => {
    expect(setupLinePlotData(undefined)).toEqual([[], []]);
  });

  test("working data, no trendline", () => {
    const mockData = [
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MCV4",
        condition: "Meningitis",
        id: 665810,
        mean_fold_change: 0,
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1260",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MCV4",
        condition: "Meningitis",
        id: 675898,
        mean_fold_change: 0.0377534555518258,
        sample_type: "PBMC",
        sd_fold_change: 0.269380962457554,
        study_accession: "SDY1260",
        timepoint: 3,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MPSV4",
        condition: "Meningitis",
        id: 716250,
        mean_fold_change: 0.0377091099195492,
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
            { x: 0, y: 0, study: "SDY1260" },
            { x: 3, y: 0.0377534555518258, study: "SDY1260" },
          ],
        },
        {
          name: "MPSV4",
          study: "SDY1260",
          data: [{ x: 7, y: 0.0377091099195492, study: "SDY1260" }],
        },
      ],
      [],
    ];
    expect(setupLinePlotData(mockLinePlotProps.data)).toEqual(mockReturn);
  });

  test("working data, has trendline", () => {
    const mockData = [
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MCV4",
        condition: "Meningitis",
        id: 665810,
        mean_fold_change: 0,
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1260",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MCV4",
        condition: "Meningitis",
        id: 675898,
        mean_fold_change: 0.0377534555518258,
        sample_type: "PBMC",
        sd_fold_change: 0.269380962457554,
        study_accession: "SDY1260",
        timepoint: 3,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MPSV4",
        condition: "Meningitis",
        id: 665811,
        mean_fold_change: 1,
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1260",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "MPSV4",
        condition: "Meningitis",
        id: 675899,
        mean_fold_change: 0.1377534555518258,
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
            { x: 0, y: 0, study: "SDY1260" },
            { x: 3, y: 0.0377534555518258, study: "SDY1260" },
          ],
        },
        {
          name: "MPSV4",
          study: "SDY1260",
          data: [
            { x: 0, y: 1, study: "SDY1260" },
            { x: 3, y: 0.1377534555518258, study: "SDY1260" },
          ],
        },
      ],
      [
        {
          name: "Average",
          study: "Trend",
          data: [
            { x: 0, y: 0.5, study: "Trend" },
            { x: 3, y: 0.0877534555518258, study: "Trend" },
          ],
        },
      ],
    ];
    expect(setupLinePlotData(mockLinePlotProps.data)).toEqual(mockReturn);
  });
});
