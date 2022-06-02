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
    expect(screen.getByTitle("Google")).toBeInTheDocument(); // link exists
    expect(screen.getByText("Google")).toBeInTheDocument(); // link text exists
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
        activeTab={defaultTab}
      />
    );

    // makes sure all 4 tabs exist
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByText(tabInfo[0].label)).toBeInTheDocument();
    expect(screen.getByText(tabInfo[1].label)).toBeInTheDocument();
    expect(screen.getByText(tabInfo[2].label)).toBeInTheDocument();
    expect(screen.getByText(tabInfo[3].label)).toBeInTheDocument();

    // makes sure default tab is selected
    expect(screen.getByText(tabInfo[0].label)).toHaveClass(
      "is-tabbar-selected"
    );

    // makes sure indicator is underneath the selected tab
    expect(screen.getByText(tabInfo[0].label).offsetLeft).toBe(
      screen.getByTestId("tabbar_indicator").offsetLeft
    );
    expect(screen.getByText(tabInfo[0].label).offsetWidth).toBe(
      screen.getByTestId("tabbar_indicator").offsetWidth
    );
  });

  test("<TabBar /> clicking on a tab", () => {
    const TabBarParent: React.FC = () => {
      const [selected, setSelected] = React.useState(defaultTab);

      return (
        <TabBar tabInfo={tabInfo} onSelect={setSelected} activeTab={selected} />
      );
    };

    render(<TabBarParent />);

    fireEvent.click(screen.getByText(tabInfo[1].label));
    expect(screen.getByText(tabInfo[1].label)).toHaveClass(
      "is-tabbar-selected"
    );

    // makes sure callback returns the appropriate value

    expect(screen.getByText(tabInfo[1].label).offsetLeft).toBe(
      screen.getByTestId("tabbar_indicator").offsetLeft
    );
    expect(screen.getByText(tabInfo[1].label).offsetWidth).toBe(
      screen.getByTestId("tabbar_indicator").offsetWidth
    );
  });
});
