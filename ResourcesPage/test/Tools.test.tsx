/**
 * @jest-environment jsdom
 */
import React from "react";
import { Tools, ToolCard } from "../src/client/ResourcesPage/Tools";
import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";

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

  test("test Tools page renders correctly", () => {
    render(<Tools />);
    expect(screen.getByText("Tools")).toBeTruthy(); // title exists
    expect(
      screen.getByText(
        "Online bioinformatics tools created by HIPC members & more"
      )
    ).toBeTruthy(); // subtitle exists

    // 5 Tool cards are present
    expect(screen.getAllByRole("img")).toHaveLength(5);
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
