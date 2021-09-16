import {
  capitalizeFirstLetter,
  getAverage,
  capitalizeKebabCase,
  capitalizeEveryWord,
} from "../src/client/AnalyteExplorer/helpers/helperFunctions";

test("capitalize ab", () => {
  expect(capitalizeFirstLetter("ab")).toBe("Ab");
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
