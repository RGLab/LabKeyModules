import { confirmAndPost } from "@labkey/api/dist/labkey/dom/Utils";
import { generate } from "@labkey/components/dist/internal/components/lineage/vis/VisGraphGenerator";
import {
  capitalizeFirstLetter,
  getAverage,
  capitalizeKebabCase,
  capitalizeEveryWord,
  binaryClosestSearch,
  getFilteredNames,
  searchBtnOnClickHelper,
} from "../src/client/AnalyteExplorer/helpers/helperFunctions";

test("test capitalize first letter", () => {
  expect(capitalizeFirstLetter("")).toBe("");
  expect(capitalizeFirstLetter(undefined)).toBe(undefined);
  expect(capitalizeFirstLetter("a")).toBe("A");
  expect(capitalizeFirstLetter("ab")).toBe("Ab");
  expect(capitalizeFirstLetter("A")).toBe("A");
  expect(capitalizeFirstLetter("3")).toBe("3");
  expect(capitalizeFirstLetter("mweastadfsdf")).toBe("Mweastadfsdf");
});

test("test average", () => {
  expect(getAverage([0])).toBe(0);
  expect(getAverage([1, 2])).toBe(1.5);
  expect(getAverage([1, 2, 3])).toBe(2);
  expect(getAverage([1, -1])).toBe(0);
  expect(getAverage([-1, -1])).toBe(-1);
  expect(getAverage(undefined)).toBe(null);
  expect(getAverage(null)).toBe(null);
  //expect(getAverage([])).toBe(null);
});

test("test capitalize kebab", () => {
  // nothing
  expect(capitalizeKebabCase("")).toBe("");
  expect(capitalizeKebabCase(undefined)).toBe(undefined);

  // single char
  expect(capitalizeKebabCase("a")).toBe("A");
  expect(capitalizeKebabCase("A")).toBe("A");

  // double char no kebab
  expect(capitalizeKebabCase("aa")).toBe("Aa");
  expect(capitalizeKebabCase("Aa")).toBe("Aa");
  expect(capitalizeKebabCase("aA")).toBe("AA");
  expect(capitalizeKebabCase("AA")).toBe("AA");

  // double char yes kebab
  expect(capitalizeKebabCase("a-a")).toBe("A-A");
  expect(capitalizeKebabCase("A-a")).toBe("A-A");
  expect(capitalizeKebabCase("A-A")).toBe("A-A");

  // multi-char per kebab
  expect(capitalizeKebabCase("aa-aa-bb")).toBe("Aa-Aa-Bb");

  // starting kebab
  expect(capitalizeKebabCase("-a")).toBe("-A");

  // ending kebab
  expect(capitalizeKebabCase("a-")).toBe("A-");
  expect(capitalizeKebabCase("aa-")).toBe("Aa-");

  // starting & ending kebab
  expect(capitalizeKebabCase("-a-")).toBe("-A-");
  expect(capitalizeKebabCase("-avc-")).toBe("-Avc-");

  // no meat
  expect(capitalizeKebabCase("-")).toBe("-");
  expect(capitalizeKebabCase("--")).toBe("--");

  // long kebab stick
  expect(capitalizeKebabCase("a--b")).toBe("A--B");
});

test("test binary closest search", () => {
  const baseSearchArr = [
    { analyte_id: "A", analyte_type: "type" },
    { analyte_id: "AA", analyte_type: "type" },
    { analyte_id: "AB", analyte_type: "type" },
    { analyte_id: "ABC", analyte_type: "type" },
    { analyte_id: "ADEFD", analyte_type: "type" },
    { analyte_id: "AZ", analyte_type: "type" },
    { analyte_id: "BZ", analyte_type: "type" },
  ];

  let query = "";
  let searchArray = [];
  let left = 0;
  let right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(-1);

  // empty search term, non empty array
  searchArray = [...baseSearchArr];
  right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(-1);

  // non-empty search term, non-empty array
  query = "AA";
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(1);

  // single array
  query = "A";
  searchArray = [...baseSearchArr.slice(0, 1)];
  right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(0);
  query = "B";
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(-1);

  // double array
  query = "A";
  searchArray = [...baseSearchArr.slice(0, 2)];
  right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(0);
  query = "AA";
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(1);
  query = "X";
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(-1);

  // even array middle
  query = "AA";
  searchArray = [...baseSearchArr.slice(0, 4)];
  right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(1);

  // odd array middle
  query = "AA";
  searchArray = [...baseSearchArr.slice(0, 3)];
  right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(1);

  // search term is at end
  query = "BZ";
  searchArray = [...baseSearchArr];
  right = searchArray.length - 1;
  expect(binaryClosestSearch(query, searchArray, left, right)).toBe(6);
});

describe("test getFilteredNames", () => {
  let userInputCaps = "";
  let typeSelected = "";
  let untypedArray = [
    { analyte_id: "A", analyte_type: "gene" },
    { analyte_id: "AA", analyte_type: "gene" },
    { analyte_id: "AB", analyte_type: "gene" },
    { analyte_id: "ABC", analyte_type: "gene" },
    { analyte_id: "ADEFD", analyte_type: "gene" },
    { analyte_id: "AZ", analyte_type: "gene" },
    { analyte_id: "BZ", analyte_type: "gene" },
    { analyte_id: "C", analyte_type: "blood transcription module" },
    { analyte_id: "CAA", analyte_type: "blood transcription module" },
    { analyte_id: "CAB", analyte_type: "blood transcription module" },
    { analyte_id: "CABC", analyte_type: "blood transcription module" },
    { analyte_id: "CADEFD", analyte_type: "blood transcription module" },
    { analyte_id: "CAZ", analyte_type: "blood transcription module" },
    { analyte_id: "FBZ", analyte_type: "blood transcription module" },
  ];

  let typedArray = {
    "gene": [
      { analyte_id: "A", analyte_type: "gene" },
      { analyte_id: "AA", analyte_type: "gene" },
      { analyte_id: "AB", analyte_type: "gene" },
      { analyte_id: "ABC", analyte_type: "gene" },
      { analyte_id: "ADEFD", analyte_type: "gene" },
      { analyte_id: "AZ", analyte_type: "gene" },
      { analyte_id: "BZ", analyte_type: "gene" },
    ],
    "blood transcription module": [
      { analyte_id: "C", analyte_type: "blood transcription module" },
      { analyte_id: "CAA", analyte_type: "blood transcription module" },
      { analyte_id: "CAB", analyte_type: "blood transcription module" },
      { analyte_id: "CABC", analyte_type: "blood transcription module" },
      { analyte_id: "CADEFD", analyte_type: "blood transcription module" },
      { analyte_id: "CAZ", analyte_type: "blood transcription module" },
      { analyte_id: "FBZ", analyte_type: "blood transcription module" },
    ],
  };
  beforeEach(() => {
    userInputCaps = "";
    typeSelected = "";
  });
  test("no user input, no type", () => {
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({});
  });

  test("no user input, yes type", () => {
    typeSelected = "gene";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({});
  });

  test("broken typed array", () => {
    expect(
      getFilteredNames(userInputCaps, typeSelected, undefined, untypedArray)
    ).toMatchObject({});
  });

  test("broken untyped array", () => {
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, undefined)
    ).toMatchObject({});
  });

  test("broken broken both arrays", () => {
    expect(
      getFilteredNames(userInputCaps, typeSelected, undefined, undefined)
    ).toMatchObject({});
  });

  test("input exists, no type", () => {
    userInputCaps = "A";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({
      A: "gene",
      AA: "gene",
      AB: "gene",
      ABC: "gene",
      ADEFD: "gene",
    });
  });

  test("input doesn't exist, no type", () => {
    userInputCaps = "hello";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({});
  });

  test("input exists, has type", () => {
    userInputCaps = "A";
    typeSelected = "Gene";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({
      A: "gene",
      AA: "gene",
      AB: "gene",
      ABC: "gene",
      ADEFD: "gene",
    });
  });

  test("input doesn't exist, has type", () => {
    userInputCaps = "hello";
    typeSelected = "Gene";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({});
  });

  test("exact input, no type", () => {
    userInputCaps = "AB";

    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({ AB: "gene" });
  });

  test("exact input, has type", () => {
    userInputCaps = "AB";
    typeSelected = "Gene";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({ AB: "gene" });
  });

  test("input matches the last analyte of type, no type", () => {
    userInputCaps = "BZ";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({ BZ: "gene" });
  });

  test("input matches the last analyte of type, has type", () => {
    userInputCaps = "BZ";
    typeSelected = "Gene";
    expect(
      getFilteredNames(userInputCaps, typeSelected, typedArray, untypedArray)
    ).toMatchObject({ BZ: "gene" });
  });
});

describe("test searchBtnOnclickHelper", () => {
  let nameSelected = "";
  let typeSelected = "";
  let conditionFilters = {};
  let untypedArray = [
    { analyte_id: "A", analyte_type: "gene" },
    { analyte_id: "AA", analyte_type: "gene" },
    { analyte_id: "AB", analyte_type: "gene" },
    { analyte_id: "ABC", analyte_type: "gene" },
    { analyte_id: "ADEFD", analyte_type: "gene" },
    { analyte_id: "AZ", analyte_type: "gene" },
    { analyte_id: "BZ", analyte_type: "gene" },
    { analyte_id: "C", analyte_type: "blood transcription module" },
    { analyte_id: "CAA", analyte_type: "blood transcription module" },
    { analyte_id: "CAB", analyte_type: "blood transcription module" },
    { analyte_id: "CABC", analyte_type: "blood transcription module" },
    { analyte_id: "CADEFD", analyte_type: "blood transcription module" },
    { analyte_id: "CAZ", analyte_type: "blood transcription module" },
    { analyte_id: "FBZ", analyte_type: "blood transcription module" },
  ];

  beforeEach(() => {
    nameSelected = "";
    typeSelected = "";
    conditionFilters = {};
  });

  test("nothing is selected", () => {
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "",
      type: "",
      filters: [],
    });
  });

  test("only name is selected", () => {
    nameSelected = "A";
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "A",
      type: "gene",
      filters: [],
    });
  });

  test("only type is selected", () => {
    typeSelected = "Gene";
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "",
      type: "",
      filters: [],
    });
  });

  test("only filters are selected", () => {
    conditionFilters = {
      Healthy: true,
    };
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "",
      type: "",
      filters: [],
    });
  });

  test("name & type selected", () => {
    nameSelected = "A";
    typeSelected = "Gene";
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "A",
      type: "gene",
      filters: [],
    });
  });

  test("type & filters selected", () => {
    typeSelected = "Gene";
    conditionFilters = {
      Healthy: true,
    };
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "",
      type: "",
      filters: [],
    });
  });

  test("name & filters selected", () => {
    nameSelected = "A";
    conditionFilters = {
      Healthy: true,
    };
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "A",
      type: "gene",
      filters: ["Healthy"],
    });
  });

  test("all 3 selected", () => {
    nameSelected = "CAB";
    typeSelected = "Blood Transcription Module (BTM)";
    conditionFilters = {
      Healthy: true,
      Influenza: false,
      Ebola: true,
    };
    expect(
      searchBtnOnClickHelper(
        nameSelected,
        typeSelected,
        conditionFilters,
        untypedArray
      )
    ).toMatchObject({
      name: "CAB",
      type: "blood transcription module",
      filters: ["Ebola", "Healthy"],
    });
  });
});

describe("test capitalizeEveryWord", () => {
  test("capitalize empty string", () => {
    expect(capitalizeEveryWord("")).toBe("");
  });

  test("capitalize whitespace", () => {
    expect(capitalizeEveryWord(" ")).toBe(" ");
  });

  test("capitalize single letter", () => {
    expect(capitalizeEveryWord("a")).toBe("A");
  });

  test("capitalize many letter", () => {
    expect(capitalizeEveryWord("ab")).toBe("Ab");
  });

  test("capitalize sentence", () => {
    expect(capitalizeEveryWord("hello how are you")).toBe("Hello How Are You");
  });

  test("capitalize string with starting and ending whitespace", () => {
    expect(capitalizeEveryWord(" hello ")).toBe(" Hello ");
  });

  test("capitalize undefined", () => {
    expect(capitalizeEveryWord(undefined)).toBe(undefined);
  });

  test("capitalize non-letter", () => {
    expect(capitalizeEveryWord("7^^&(")).toBe("7^^&(");
  });
});
