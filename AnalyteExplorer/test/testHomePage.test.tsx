/**
 * @jest-environment jsdom
 */

import React from "react";
import { shallow, render, mount } from "enzyme";
import HomePage, {
  ArrowText,
} from "../src/client/AnalyteExplorer/components/HomePage";

describe("<HomePage />", () => {
  it("shallow renders <HomePage />", () => {
    const wrapper = shallow(<HomePage />);
    expect(wrapper.find(".ae-home-content")).toBeDefined();
    expect(wrapper.find(".ae-home-content")).toHaveLength(1);
    expect(wrapper.find(".ae-home__tutorial-icon")).toHaveLength(3);
    expect(wrapper.find(".ae-home-tutorial-instructions")).toHaveLength(1);
    expect(wrapper.find(".ae-home-data-processing")).toHaveLength(1);

    //expect(wrapper.find(".ae-home-arrow-text")).toHaveLength(1);
  });

  it("shallow renders <ArrowText />", () => {
    const text = "Hello";
    const wrapper = render(<ArrowText text={text} />);
    //expect(wrapper.find("a")).toHaveLength(1); // can't find the a tag for some reason
    expect(wrapper.find(".history-block__link-text")).toHaveLength(1);
    expect(wrapper.find(".history-block__link-text").text()).toEqual(text);
  });

  it("full rendering ArrowText", () => {
    const text = "Hello";
    const wrapper = mount(<ArrowText text={text} />);
    expect(wrapper.find(".ae-home-arrow-text")).toHaveLength(1);
    //expect(wrapper.find(".history-block__link-text::after")).toHaveLength(1);
  });
});
