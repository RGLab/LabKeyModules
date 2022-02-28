/**
 * @jest-environment jsdom
 */
import React from "react";
import { DataStandards } from "../src/client/AboutPage/DataStandards";
import renderer from "react-test-renderer";

describe("tests DataStandards pages renders correctly", () => {
  test("test DataStandards renders correctly", () => {
    const component = renderer.create(<DataStandards />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
