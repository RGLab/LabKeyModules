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
import {
  PlotArea,
  PlotPackageGroup,
} from "../src/client/ResourcesPage/StudyStatistics";
import renderer from "react-test-renderer";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

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

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText(specs.name)).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("img").hasAttribute("src"));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // if you use getByRole it'll throw error. https://testing-library.com/docs/react-testing-library/cheatsheet#queries
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
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText(specs.options[0].label)).toBeInTheDocument();
    expect(screen.getByText(specs.options[1].label)).toBeInTheDocument();
    expect(screen.getByText(specs.options[2].label)).toBeInTheDocument();
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
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(screen.getByText(specs.options[1].label));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(mockOnClickCallback.mock.results[0].value).toBe(specs.options[1].id);
  });
});

describe("<PlotArea />", () => {
  const menuProps: PlotMenuSpecs = {
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

  const footerText = ["Bark", "Woof"];

  const plotPackages: PlotPackageGroup = {};
  menuProps.options.reduce((packages, option) => {
    const plotJSX = [<div key="asdf">{`Fake plot of ${option.label}`}</div>];
    packages[option.id] = {
      id: option.id,
      menuIds: [menuProps.id],
      footerText: footerText,
      plots: plotJSX,
    };
    return packages;
  }, plotPackages);

  const plotPackagesMultiple: PlotPackageGroup = {};
  menuProps.options.reduce((packages, option) => {
    const plotJSX = [
      <div key="asdf">{`Fake plot of ${option.label}-1`}</div>,
      <div key="asdfg">{`Fake plot of ${option.label}-2`}</div>,
    ];
    packages[option.id] = {
      id: option.id,
      menuIds: [menuProps.id],
      footerText: footerText,
      plots: plotJSX,
    };
    return packages;
  }, plotPackagesMultiple);

  const testMenuExists = () => {
    expect(screen.getByRole("button")).toBeInTheDocument(); // Menu
    expect(screen.getByText(menuProps.name)).toBeInTheDocument();
  };

  test("<PlotArea /> renders correctly with props", () => {
    render(
      <PlotArea
        title="Fun Dogs"
        anchorID="fun-dogs"
        subtitle="Fun stuff with dogs"
        menus={[menuProps]}
        defaultPackage={menuProps.options[0].id}
        plotPackages={plotPackages}
      />
    );

    expect(screen.getByText("Fun Dogs")).toBeInTheDocument(); // Title
    expect(screen.getByText("Fun stuff with dogs")).toBeInTheDocument(); // Subtitle
    expect(screen.getByRole("link")).toBeInTheDocument(); // Anchor link
    expect(screen.getByRole("link")).toHaveAttribute("href", "#fun-dogs"); // Anchor link correct
    expect(screen.getByAltText("Fun Dogs")).toBeInTheDocument(); // Anchor link icon

    expect(screen.getByRole("button")).toBeInTheDocument(); // Menu
    expect(screen.getByText(menuProps.name)).toBeInTheDocument();

    expect(
      screen.getByText(`Fake plot of ${menuProps.options[0].label}`)
    ).toBeInTheDocument(); // "Plot"

    expect(screen.getByText(footerText[0])).toBeInTheDocument(); // Footer texts
    expect(screen.getByText(footerText[1])).toBeInTheDocument();
  });

  test("<PlotArea /> switching plot using dropdown menu", () => {
    render(
      <PlotArea
        title="Fun Dogs"
        anchorID="fun-dogs"
        subtitle="Fun stuff with dogs"
        menus={[menuProps]}
        defaultPackage={menuProps.options[0].id}
        plotPackages={plotPackages}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText(menuProps.name)).toBeInTheDocument();
    expect(
      screen.getByText(`Fake plot of ${menuProps.options[0].label}`)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(screen.getByText(menuProps.options[1].label));

    expect(
      screen.getByText(`Fake plot of ${menuProps.options[1].label}`)
    ).toBeInTheDocument();
  });

  test("<PlotArea /> closing dropdown when clicking outside", () => {
    render(
      <PlotArea
        title="Fun Dogs"
        anchorID="fun-dogs"
        subtitle="Fun stuff with dogs"
        menus={[menuProps]}
        defaultPackage={menuProps.options[0].id}
        plotPackages={plotPackages}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText(menuProps.name)).toBeInTheDocument();
    expect(
      screen.getByText(`Fake plot of ${menuProps.options[0].label}`)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(
      screen.getByText(`Fake plot of ${menuProps.options[0].label}`)
    ); // clicking on a plot, which is outside of the dropdown menu

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("<PlotArea /> render with undefined plotPackages displays error message", () => {
    render(
      <PlotArea
        title="Fun Dogs"
        anchorID="fun-dogs"
        subtitle="Fun stuff with dogs"
        menus={[menuProps]}
        defaultPackage={menuProps.options[0].id}
        plotPackages={undefined}
      />
    );
    expect(screen.getByText("Error: No plots found.")).toBeInTheDocument();
  });

  test("<PlotArea /> selecting an invalid plot displays error message and reveals all dropdowns", () => {
    const badMenuProps = { ...menuProps };
    badMenuProps.options.push({
      id: "beagle",
      value: "beagle",
      label: "beagle",
    }); // menu contains an option that the plotPackages do not have data for

    const secondMenuProps: PlotMenuSpecs = {
      id: "select-animal",
      name: "Select Animal Type",
      options: [
        {
          id: "dog",
          value: "dog",
          label: "Dog",
        },
        { id: "cat", value: "cat", label: "Cat" },
      ],
    };

    render(
      <PlotArea
        title="Fun Dogs"
        anchorID="fun-dogs"
        subtitle="Fun stuff with dogs"
        menus={[badMenuProps, secondMenuProps]}
        defaultPackage={badMenuProps.options[0].id}
        plotPackages={plotPackages}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText(badMenuProps.name)).toBeInTheDocument();
    expect(
      screen.getByText(`Fake plot of ${badMenuProps.options[0].label}`)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(screen.getByText(badMenuProps.options[3].label));

    expect(
      screen.getByText("Error: Unable to generate plot. Please try again.")
    ).toBeInTheDocument();

    expect(screen.getAllByRole("button").length).toBe(2);
    expect(screen.getByText(badMenuProps.name)).toBeInTheDocument();
    expect(screen.getByText(secondMenuProps.name)).toBeInTheDocument();

    fireEvent.click(screen.getByText(badMenuProps.name));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(screen.getByText(badMenuProps.options[1].label));

    expect(screen.getByText(`Fake plot of ${badMenuProps.options[1].label}`));
  });

  test("<PlotArea /> rendering multiple plots at once", () => {
    render(
      <PlotArea
        title="Fun Dogs"
        anchorID="fun-dogs"
        subtitle="Fun stuff with dogs"
        menus={[menuProps]}
        defaultPackage={menuProps.options[0].id}
        plotPackages={plotPackagesMultiple}
      />
    );
    testMenuExists();
    expect(screen.getByText(`Fake plot of ${menuProps.options[0].label}-1`));
    expect(screen.getByText(`Fake plot of ${menuProps.options[0].label}-2`));
  });

  test("<PlotArea /> rendering multiple menus", () => {
    const animalMenuProps: PlotMenuSpecs = {
      id: "select-animal",
      name: "Select Animal Type",
      options: [
        {
          id: "dog",
          value: "goldenretriever",
          label: "Dog",
        },
        { id: "cat", value: "cat", label: "Cat" },
      ],
    };

    const dogMenuProps: PlotMenuSpecs = {
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

    const plotPackagesAnimal: PlotPackageGroup = {};
    animalMenuProps.options.reduce((packages, option) => {
      const plotJSX = [<div key="asdf">{`Fake plot of ${option.label}`}</div>];
      packages[option.id] = {
        id: option.id,
        menuIds: [animalMenuProps.id],
        footerText: ["Woof"],
        plots: plotJSX,
      };
      return packages;
    }, plotPackagesAnimal);

    plotPackagesAnimal["dog"].menuIds.push(dogMenuProps.id);

    const plotPackagesDog: PlotPackageGroup = {};
    dogMenuProps.options.reduce((packages, option) => {
      const plotJSX = [<div key="asdf">{`Fake plot of ${option.label}`}</div>];
      packages[option.id] = {
        id: option.id,
        menuIds: [animalMenuProps.id, dogMenuProps.id],
        footerText: ["Meow"],
        plots: plotJSX,
      };
      return packages;
    }, plotPackagesDog);

    const combinedPackages: PlotPackageGroup = {
      ...plotPackagesAnimal,
      ...plotPackagesDog,
    };

    render(
      <PlotArea
        title="Fun Animals"
        anchorID="fun-animals"
        subtitle="Fun stuff with animals"
        menus={[animalMenuProps, dogMenuProps]}
        defaultPackage={animalMenuProps.options[0].id}
        plotPackages={combinedPackages}
      />
    );

    expect(screen.getAllByRole("button").length).toBe(2);
    expect(screen.getByText(animalMenuProps.name)).toBeInTheDocument();
    expect(screen.getByText(dogMenuProps.name)).toBeInTheDocument();
    expect(screen.getByText("Fake plot of Dog")).toBeInTheDocument();

    fireEvent.click(screen.getByText(animalMenuProps.name));
    expect(
      screen.getByText(animalMenuProps.options[1].label)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(animalMenuProps.options[1].label));

    expect(screen.getAllByRole("button").length).toBe(1);
    expect(screen.getByText(animalMenuProps.name)).toBeInTheDocument();
    expect(screen.queryByText(dogMenuProps.name)).not.toBeInTheDocument();
    expect(screen.getByText("Fake plot of Cat")).toBeInTheDocument();

    fireEvent.click(screen.getByText(animalMenuProps.name));
    expect(
      screen.getByText(animalMenuProps.options[0].label)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(animalMenuProps.options[0].label));

    expect(screen.getAllByRole("button").length).toBe(2);
    expect(screen.getByText(animalMenuProps.name)).toBeInTheDocument();
    expect(screen.getByText(dogMenuProps.name)).toBeInTheDocument();
    expect(screen.getByText("Fake plot of Dog")).toBeInTheDocument();

    fireEvent.click(screen.getByText(dogMenuProps.name));
    expect(screen.getByText(dogMenuProps.options[1].label)).toBeInTheDocument();
    fireEvent.click(screen.getByText(dogMenuProps.options[1].label));

    expect(screen.getAllByRole("button").length).toBe(2);
    expect(screen.getByText(animalMenuProps.name)).toBeInTheDocument();
    expect(screen.getByText(dogMenuProps.name)).toBeInTheDocument();
    expect(
      screen.getByText("Fake plot of Austrailian Shepherd")
    ).toBeInTheDocument();
  });
});
