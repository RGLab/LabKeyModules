/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SearchButton,
  CheckboxButton,
} from "../src/client/AnalyteExplorer/components/AnalyteSelectorMain";

describe("testing search btn", () => {
  it("seach button exists", () => {
    const clickCallback = jest.fn();
    const { getByRole } = render(
      <SearchButton onClickCallback={clickCallback} />
    );
    const searchBtn = getByRole("button");
    expect(searchBtn).toBeTruthy();
    expect(searchBtn.firstChild).toBeTruthy();
  });

  test("search button clicks", () => {
    const clickCallback = jest.fn();
    const { getByRole } = render(
      <SearchButton onClickCallback={clickCallback} />
    );
    const searchBtn = getByRole("button");
    fireEvent.click(searchBtn);
    expect(clickCallback).toHaveBeenCalledTimes(1);
  });
});

describe("testing check boxes", () => {
  test("test check button exists", () => {
    const clickCallback = jest.fn();
    const { getByLabelText, getByText } = render(
      <CheckboxButton
        id={"Healthy"}
        labelText={"Healthy"}
        isChecked={false}
        onClickCallback={clickCallback}
      />
    );

    const checkBox = getByLabelText("Healthy");
    const label = getByText("Healthy");
    expect(checkBox).toBeTruthy();
    expect(label).toBeTruthy();
  });

  test("check button clicks", () => {
    let checked = false;
    const clickCallback = jest.fn((id: string) => {
      checked = true;
    });
    const { getByLabelText, rerender } = render(
      <CheckboxButton
        id={"Healthy"}
        labelText={"Healthy"}
        isChecked={checked}
        onClickCallback={clickCallback}
      />
    );

    const checkBox = getByLabelText("Healthy") as HTMLInputElement;
    expect(checkBox.checked).toEqual(false);
    fireEvent.click(checkBox);
    expect(clickCallback).toHaveBeenCalledTimes(1);

    // re-render after click
    rerender(
      <CheckboxButton
        id={"Healthy"}
        labelText={"Healthy"}
        isChecked={checked}
        onClickCallback={clickCallback}
      />
    );

    const checkboxChecked = screen.getByLabelText(
      "Healthy"
    ) as HTMLInputElement;
    expect(checkboxChecked.checked).toEqual(true);
  });
});
