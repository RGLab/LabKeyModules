/**
 * @jest-environment jsdom
 */

import React from "react";
import { shallow } from "enzyme";
import HomePage from "../src/client/AnalyteExplorer/components/HomePage";
import renderer from "react-test-renderer";

describe("<HomePage />", () => {
  it("shallow renders <HomePage />", () => {
    const wrapper = shallow(<HomePage />);
    expect(wrapper.find(".ae-home-content")).toBeDefined();
    expect(wrapper.find(".ae-home-content")).toHaveLength(1);
    expect(wrapper.find(".ae-home__tutorial-icon")).toHaveLength(3);
    expect(wrapper.find(".ae-home-tutorial-instructions")).toHaveLength(1);
    expect(wrapper.find(".ae-home-data-processing")).toHaveLength(1);
  });

  it("HomePage snapshot test", () => {
    const component = renderer.create(<HomePage />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
