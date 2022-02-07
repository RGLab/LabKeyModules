/**
 * @jest-environment jsdom
 */
import React from "react";
import { RSessionInfo } from "../src/client/AboutPage/RSessionInfo";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import pretty from "pretty";
import * as helperFunctions from "../src/client/AboutPage/helperFunctions";

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("RSessionInfo tests", () => {
  test("mock data loading", () => {
    act(() => {
      render(
        <RSessionInfo rSessionParsed={undefined} rScriptsLoaded={false} />,
        container
      );
    });

    // Check if <i> tag exists & if loading text exists
    expect(container.children[0].children[0].tagName).toBe("I");
    expect(container.children[0].textContent).toBe("Loading R Session Info");

    expect(pretty(container.innerHTML)).toMatchInlineSnapshot(
      '"<div><i aria-hidden=\\"true\\" class=\\"fa fa-spinner fa-pulse\\" style=\\"margin-right: 5px;\\"></i>Loading R Session Info</div>"'
    );
  });

  test("mock data loaded", () => {
    const slotHTML = "<span>Yay data has been loaded!</span>";
    const mockContent = document
      .createRange()
      .createContextualFragment(slotHTML);

    //https://stackoverflow.com/questions/51269431/jest-mock-inner-function
    // the renderHtmlWidget function gets mocked as it causes errors if executed outside
    // of LabKey environment
    const spy = jest
      .spyOn(helperFunctions, "renderHtmlWidget")
      .mockImplementation(() => {
        // do nothing on purpose
      });

    act(() => {
      render(
        <RSessionInfo rSessionParsed={mockContent} rScriptsLoaded={true} />,
        container
      );
    });

    expect(container.children[0].children[0].textContent).toBe(
      "Yay data has been loaded!"
    );

    spy.mockRestore();
  });
});
