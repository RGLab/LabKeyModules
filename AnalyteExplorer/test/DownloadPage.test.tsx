/**
 * @jest-environment jsdom
 */
import {
  processDataByFilter,
  organizeD3Data,
} from "../src/client/AnalyteExplorer/components/DownloadPage";

import {
  LINEPLOT_HEIGHT,
  LINEPLOT_WIDTH,
} from "../src/client/AnalyteExplorer/components/data_viz/dataVizConstants";

describe("test processDataByFilter", () => {
  const mockData = {
    rows: [
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
        cohort: "MVA85A intradermal",
        condition: "Tuberculosis",
        id: 1170210,
        mean_fold_change: 0,
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1364",
        timepoint: 0,
      },
      {
        analyte_id: "A2M",
        analyte_type: "gene",
        cohort: "healthy HIV-1-uninfected adults",
        condition: "HIV",
        id: 1382058,
        mean_fold_change: 0.0891282613351949,
        sample_type: "PBMC",
        sd_fold_change: 0.074124876883093,
        study_accession: "SDY1291",
        timepoint: 7,
      },
    ],
  };

  const corruptedMockData = {
    rows: [
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
        cohort: "MVA85A intradermal",
        condition: "Tuberculosis",
        id: 1170210,
        mean_fold_change: 0,
        sample_type: "PBMC",
        sd_fold_change: 0,
        study_accession: "SDY1364",
        timepoint: 0,
      },
      {
        badCondition: "Ebola",
        data: "Ebola-data",
      },
    ],
  };

  test("data is undefined", () => {
    expect(processDataByFilter(undefined)).toMatchObject({});
  });

  test("wrong data format", () => {
    expect(processDataByFilter([1, 2, 3])).toMatchObject({});
    expect(
      processDataByFilter({ cities: ["Seattle", "New York", "Boston"] })
    ).toMatchObject({});
  });

  test("correct data format", () => {
    const mockOutput = {
      Meningitis: [
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
      ],
      Tuberculosis: [
        {
          analyte_id: "A2M",
          analyte_type: "gene",
          cohort: "MVA85A intradermal",
          condition: "Tuberculosis",
          id: 1170210,
          mean_fold_change: 0,
          sample_type: "PBMC",
          sd_fold_change: 0,
          study_accession: "SDY1364",
          timepoint: 0,
        },
      ],
      HIV: [
        {
          analyte_id: "A2M",
          analyte_type: "gene",
          cohort: "healthy HIV-1-uninfected adults",
          condition: "HIV",
          id: 1382058,
          mean_fold_change: 0.0891282613351949,
          sample_type: "PBMC",
          sd_fold_change: 0.074124876883093,
          study_accession: "SDY1291",
          timepoint: 7,
        },
      ],
    };

    expect(processDataByFilter(mockData)).toMatchObject(mockOutput);
  });

  test("correct data format but empty data", () => {
    expect(processDataByFilter({ rows: [] })).toMatchObject({});
  });

  test("test corrupted data", () => {
    const mockOutput = {
      Meningitis: [
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
      ],
      Tuberculosis: [
        {
          analyte_id: "A2M",
          analyte_type: "gene",
          cohort: "MVA85A intradermal",
          condition: "Tuberculosis",
          id: 1170210,
          mean_fold_change: 0,
          sample_type: "PBMC",
          sd_fold_change: 0,
          study_accession: "SDY1364",
          timepoint: 0,
        },
      ],
    };
    expect(processDataByFilter(corruptedMockData)).toMatchObject(mockOutput);
  });
});

describe("test organizeD3Data", () => {
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
  const condition = "Meningitis";

  test("undefined data", () => {
    expect(organizeD3Data(condition, undefined)).toBe(undefined);
  });

  test("undefined condition", () => {
    expect(organizeD3Data(undefined, mockData)).toBe(undefined);
  });

  test("correct condition & data", () => {
    const mockDataMap = new Map<
      string,
      { x: number; y: number; study: string }[]
    >([
      [
        "MCV4",
        [
          { x: 3, y: 0.0377534555518258, study: "SDY1260" },
          { x: 0, y: 0, study: "SDY1260" },
        ],
      ],

      ["MPSV4", [{ x: 7, y: 0.0377091099195492, study: "SDY1260" }]],
      ["Average", []],
    ]);
    const mockOutput = {
      name: condition,
      data: mockDataMap,
      xLabel: "timepoint (days)",
      yLabel: "mean fold change",
      width: LINEPLOT_WIDTH,
      height: LINEPLOT_HEIGHT,
    };
    expect(organizeD3Data(condition, mockData)).toMatchObject(mockOutput);
  });
});
