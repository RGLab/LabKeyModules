/**
 * @jest-environment jsdom
 */
import React from "react";
import { SoftwareUpdates } from "../src/client/AboutPage/SoftwareUpdates";
import renderer from "react-test-renderer";

describe("tests SoftwareUpdates pages renders correctly", () => {
  test("test SoftwareUpdates renders correctly", () => {
    const component = renderer.create(<SoftwareUpdates />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
