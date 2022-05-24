/**
 * @jest-environment jsdom
 */
import React from "react";
import { ImmuneSpaceR } from "../src/client/ResourcesPage/ImmuneSpaceR";
import renderer from "react-test-renderer";

describe("test ImmuneSpaceR renders correctly", () => {
  test("test ImmuneSpaceR renders correctly", () => {
    const component = renderer.create(<ImmuneSpaceR />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
