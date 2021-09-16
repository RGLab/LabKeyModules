import { capitalizeFirstLetter } from "../src/client/AnalyteExplorer/helpers/helperFunctions";

test("capitalize ab", () => {
  expect(capitalizeFirstLetter("ab")).toBe("Ab");
});
