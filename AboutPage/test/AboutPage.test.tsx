/**
 * @jest-environment jsdom
 */
import React from "react";
import { About } from "../src/client/AboutPage/About";
import renderer from "react-test-renderer";
import { DataReleases } from "../src/client/AboutPage/DataReleases";

describe("tests AboutPage pages renders correctly", () => {
  test("test About renders correctly", () => {
    const component = renderer.create(<About />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
