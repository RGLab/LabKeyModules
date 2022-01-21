/**
 * @jest-environment jsdom
 */
import React from "react";
import { DataReleases } from "../src/client/AboutPage/DataReleases";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import pretty from "pretty";

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("tests DataReleases pages renders correctly", () => {
  test("test DataReleases render with data loading message", () => {
    const dataLoadingText = "Loading Data Releases";
    act(() => {
      render(
        <DataReleases
          dataReleasesResults={[
            <tr key={1}>
              <td>{dataLoadingText}</td>
            </tr>,
          ]}
        />,
        container
      );
    });

    expect(container.querySelector("tbody").textContent).toBe(dataLoadingText);
    expect(pretty(container.innerHTML)).toMatchInlineSnapshot(`
      "<div id=\\"DataReleases-content\\">
        <table style=\\"width: 100%; border: 1px solid black;\\">
          <thead>
            <tr>
              <th style=\\"width: 15%; border: 1px solid black; text-align: center; font-weight: bold;\\">Version</th>
              <th style=\\"width: 15%; border: 1px solid black; text-align: center; font-weight: bold;\\">Date</th>
              <th style=\\"width: 30%; border: 1px solid black; text-align: center; font-weight: bold;\\">Affected Studies</th>
              <th style=\\"width: 40%; border: 1px solid black; text-align: center; font-weight: bold;\\">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Loading Data Releases</td>
            </tr>
          </tbody>
        </table>
        <section class=\\"DataReleases-footer\\">
          <p>Version numbers use the following scheme <b>x.y.z</b> where</p>
          <ul>
            <li><b>x</b> is the version of ImmPort. The data is curated by ImmPort and ImmuneSpace gets updated after each offcial data release.</li>
            <li><b>y</b> indicates a major data change. This includes loading new studies, adding datasets to existing studies or processing data such as creating gene expression matrices.</li>
            <li><b>z</b> indicates minor changes, such as reloading studies with minor corrections to existing assay or metadata.</li>
          </ul>
          <p>Note that this only for <b>data</b>, the development of new features or updates to software infrastructure are tracked separately in <a href=\\"?tab=SoftwareUpdates\\">Software Updates</a>.</p>
        </section>
      </div>"
    `);
  });

  test("test DataReleases render with mock data", () => {
    interface mockDataType {
      affected_studies: string;
      date: string;
      description: string;
      version: string;
    }
    const mockData: mockDataType[] = [
      {
        affected_studies: "SDY1, SDY2",
        date: "2019-12-13 00:00:00.000",
        description: "Loaded new studies: SDY1 and SDY2",
        version: "1.0.0",
      },
      {
        affected_studies: "SDY3, SDY4",
        date: "2019-12-14 00:00:00.000",
        description: "Loaded new studies: SDY3 and SDY4",
        version: "1.0.1",
      },
    ];

    const processedMockData = mockData.map(function (arr, index) {
      return (
        <tr key={index} data-item={arr}>
          <td
            data-title="Version"
            style={{ textAlign: "center", border: "1px solid black" }}>
            {arr.version}
          </td>
          <td
            data-title="Date"
            style={{ textAlign: "center", border: "1px solid black" }}>
            {arr.date.slice(0, 10)}
          </td>
          <td
            data-title="Affected Studies"
            style={{ border: "1px solid black" }}>
            {arr.affected_studies}
          </td>
          <td data-title="Description" style={{ border: "1px solid black" }}>
            {arr.description}
          </td>
        </tr>
      );
    });

    act(() => {
      render(
        <DataReleases dataReleasesResults={processedMockData} />,
        container
      );
    });

    expect(pretty(container.innerHTML)).toMatchInlineSnapshot(`
      "<div id=\\"DataReleases-content\\">
        <table style=\\"width: 100%; border: 1px solid black;\\">
          <thead>
            <tr>
              <th style=\\"width: 15%; border: 1px solid black; text-align: center; font-weight: bold;\\">Version</th>
              <th style=\\"width: 15%; border: 1px solid black; text-align: center; font-weight: bold;\\">Date</th>
              <th style=\\"width: 30%; border: 1px solid black; text-align: center; font-weight: bold;\\">Affected Studies</th>
              <th style=\\"width: 40%; border: 1px solid black; text-align: center; font-weight: bold;\\">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr data-item=\\"[object Object]\\">
              <td data-title=\\"Version\\" style=\\"text-align: center; border: 1px solid black;\\">1.0.0</td>
              <td data-title=\\"Date\\" style=\\"text-align: center; border: 1px solid black;\\">2019-12-13</td>
              <td data-title=\\"Affected Studies\\" style=\\"border: 1px solid black;\\">SDY1, SDY2</td>
              <td data-title=\\"Description\\" style=\\"border: 1px solid black;\\">Loaded new studies: SDY1 and SDY2</td>
            </tr>
            <tr data-item=\\"[object Object]\\">
              <td data-title=\\"Version\\" style=\\"text-align: center; border: 1px solid black;\\">1.0.1</td>
              <td data-title=\\"Date\\" style=\\"text-align: center; border: 1px solid black;\\">2019-12-14</td>
              <td data-title=\\"Affected Studies\\" style=\\"border: 1px solid black;\\">SDY3, SDY4</td>
              <td data-title=\\"Description\\" style=\\"border: 1px solid black;\\">Loaded new studies: SDY3 and SDY4</td>
            </tr>
          </tbody>
        </table>
        <section class=\\"DataReleases-footer\\">
          <p>Version numbers use the following scheme <b>x.y.z</b> where</p>
          <ul>
            <li><b>x</b> is the version of ImmPort. The data is curated by ImmPort and ImmuneSpace gets updated after each offcial data release.</li>
            <li><b>y</b> indicates a major data change. This includes loading new studies, adding datasets to existing studies or processing data such as creating gene expression matrices.</li>
            <li><b>z</b> indicates minor changes, such as reloading studies with minor corrections to existing assay or metadata.</li>
          </ul>
          <p>Note that this only for <b>data</b>, the development of new features or updates to software infrastructure are tracked separately in <a href=\\"?tab=SoftwareUpdates\\">Software Updates</a>.</p>
        </section>
      </div>"
    `);
  });
});
