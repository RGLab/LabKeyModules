/**
 * @jest-environment jsdom
 */
import React from "react";
import { GeneExpression } from "../src/client/AboutPage/GeneExpression";
import renderer from "react-test-renderer";

describe("tests GeneExpression pages renders correctly", () => {
  test("test GeneExpression renders correctly", () => {
    const component = renderer.create(<GeneExpression />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
