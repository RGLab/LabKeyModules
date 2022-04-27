/**
 * @jest-environment jsdom
 */
import React from "react";
import {
  TableOfContents,
  AnchorHeading,
  PlotMenu,
  PlotMenuSpecs,
} from "../src/client/ResourcesPage/StudyStatistics/components";
import renderer from "react-test-renderer";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

afterEach(cleanup);

describe("Test components", () => {
  test("AnchorHeading renders with title of Hello World and anchorID of foo", () => {
    const component = renderer.create(
      <AnchorHeading text="Hello World" anchorID="foo" />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("TableOfContents renders with 'Hello World' title and 5 links", () => {
    const tocProps = [
      {
        name: "titleA",
        link: "plotA",
      },
      {
        name: "titleB",
        link: "plotB",
      },
      {
        name: "titleC",
        link: "plotC",
      },
      {
        name: "titleD",
        link: "plotD",
      },
      {
        name: "titleE",
        link: "plotE",
      },
    ];
    const component = renderer.create(
      <TableOfContents title="Hello World" content={tocProps} />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("<Plot Menu/>", () => {
  const specs: PlotMenuSpecs = {
    id: "select-dog-breed",
    name: "Select Dog Breed",
    options: [
      {
        id: "gold-retriev",
        value: "goldenretriever",
        label: "Golden Retriever",
      },
      { id: "aus-shep", value: "ausshepherd", label: "Austrailian Shepherd" },
      { id: "bulldog", value: "bulldog", label: "Bulldog" },
    ],
  };
  const mockOnClickCallback = jest.fn((x) => x);

  test("<Plot Menu /> renders correctly with props", () => {
    render(
      <PlotMenu
        id={specs.id}
        name={specs.name}
        options={specs.options}
        onClickCallback={mockOnClickCallback}
      />
    );

    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.getByText(specs.name)).toBeTruthy();
    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.getByRole("img").hasAttribute("src"));

    expect(screen.queryByRole("listbox")).toBeFalsy(); // if you use getByRole it'll throw error. https://testing-library.com/docs/react-testing-library/cheatsheet#queries
  });

  test("<Plot Menu /> click on dropdown button", () => {
    render(
      <PlotMenu
        id={specs.id}
        name={specs.name}
        options={specs.options}
        onClickCallback={mockOnClickCallback}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button").classList.contains("clicked"));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getByText(specs.options[0].label)).toBeTruthy();
    expect(screen.getByText(specs.options[1].label)).toBeTruthy();
    expect(screen.getByText(specs.options[2].label)).toBeTruthy();
  });

  test("<Plot Menu /> clicking dropdown item closes dropdown menu", async () => {
    render(
      <PlotMenu
        id={specs.id}
        name={specs.name}
        options={specs.options}
        onClickCallback={mockOnClickCallback}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.click(screen.getByText(specs.options[1].label));

    expect(screen.queryByRole("listbox")).toBeFalsy();
    expect(mockOnClickCallback.mock.results[0].value).toBe(
      specs.options[1].value
    );
  });
});
