import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import App from "../src/client/AnalyteExplorer/AnalyteExplorer";

describe("testing AnalyteExplorer", () => {
  test("loading icon works", async () => {
    render(<App />);

    // const spinner = screen.getAllByRole("status");
    // expect(spinner).toBeTruthy();
    await waitForElementToBeRemoved(() => screen.getAllByRole("status"));
    const mainPage = screen.getByRole("main");
    expect(mainPage).toBeTruthy();
  });
});

//https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
