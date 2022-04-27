/**
 * @jest-environment jsdom
 */
import React from "react";
import ArrowLink from "../src/client/ResourcesPage/components/ArrowLink";
import TabBar from "../src/client/ResourcesPage/components/TabBar";
import renderer from "react-test-renderer";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(cleanup);

describe("ArrowLink renders correctly", () => {
  test("ArrowLink renders with a link to Google.com and the text of Google", () => {
    const component = renderer.create(
      <ArrowLink href="https://www.google.com/" text="Google" />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("<ArrowLink /> renders correctly", () => {
    render(<ArrowLink href="https://www.google.com/" text="Google" />);
    expect(screen.getByTitle("Google")).toBeTruthy(); // link exists
    expect(screen.getByText("Google")).toBeTruthy(); // link text exists
    expect(screen.getByTitle("Google").hasAttribute("href")); // link works
  });
});

// will test tab bar later
describe("<TabBar />", () => {
  const tabInfo = [
    {
      id: "dog-1",
      tag: "GoldenRetriever",
      label: "Golden Retriever",
    },
    {
      id: "dog-2",
      tag: "AusShep",
      label: "Austrailian Shepherd",
    },
    {
      id: "dog-3",
      tag: "Poodle",
      label: "Poodle",
    },
    {
      id: "dog-4",
      tag: "Bulldog",
      label: "Bulldog",
    },
  ];

  const defaultTab = "GoldenRetriever";
  const mockOnClickCallback = jest.fn((x) => x);
  test("<TabBar renders correctly with props", () => {
    render(
      <TabBar
        tabInfo={tabInfo}
        onSelect={mockOnClickCallback}
        defaultTab={defaultTab}
      />
    );

    // makes sure all 4 tabs exist
    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByText(tabInfo[0].label)).toBeTruthy();
    expect(screen.getByText(tabInfo[1].label)).toBeTruthy();
    expect(screen.getByText(tabInfo[2].label)).toBeTruthy();
    expect(screen.getByText(tabInfo[3].label)).toBeTruthy();

    // makes sure default tab is selected
    expect(
      screen
        .getByText(tabInfo[0].label)
        .classList.contains("is-tabbar-selected")
    ).toBeTruthy();

    // makes sure indicator is underneath the selected tab
    expect(screen.getByText(tabInfo[0].label).offsetLeft).toBe(
      screen.getByTestId("tabbar_indicator").offsetLeft
    );
    expect(screen.getByText(tabInfo[0].label).offsetWidth).toBe(
      screen.getByTestId("tabbar_indicator").offsetWidth
    );
  });

  test("<TabBar /> clicking on a tab", () => {
    render(
      <TabBar
        tabInfo={tabInfo}
        onSelect={mockOnClickCallback}
        defaultTab={defaultTab}
      />
    );

    fireEvent.click(screen.getByText(tabInfo[1].label));
    expect(
      screen
        .getByText(tabInfo[1].label)
        .classList.contains("is-tabbar-selected")
    ).toBeTruthy();

    // makes sure callback returns the appropriate value
    expect(mockOnClickCallback.mock.calls.length).toBe(1);
    expect(mockOnClickCallback.mock.results[0].value).toBe(tabInfo[1].tag);

    expect(screen.getByText(tabInfo[1].label).offsetLeft).toBe(
      screen.getByTestId("tabbar_indicator").offsetLeft
    );
    expect(screen.getByText(tabInfo[1].label).offsetWidth).toBe(
      screen.getByTestId("tabbar_indicator").offsetWidth
    );
  });
});
