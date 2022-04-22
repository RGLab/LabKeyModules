/**
 * @jest-environment jsdom
 */
import React from "react";
import { Tools, ToolCard } from "../src/client/ResourcesPage/Tools";
import renderer from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow"; // ES6

describe("Tools page renders correctly", () => {
  test("test Tools page render", () => {
    const component = renderer.create(<Tools />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("Tools card renders correctly", () => {
    const component = renderer.create(
      <ToolCard
        title="Google"
        imgSrc="/beep.png"
        arrLink="https://www.google.com/"
        body="This is Google"
      />
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
