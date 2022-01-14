import * as React from "react";

interface props {
  dataReleasesResults: JSX.Element | JSX.Element[];
}

export const DataReleases = React.memo<props>(
  ({ dataReleasesResults }: props) => {
    //const baseUrl = LABKEY.ActionURL["getBaseURL"]();
    // const softwareUpdatesLink =
    //   baseUrl + "project/home/begin.view?tab=SoftwareUpdates";
    // function handleSoftwareUpdateClick() {
    //   setDivToShow("SoftwareUpdates");
    // }

    return (
      <div id="DataReleases-content">
        <table style={{ width: "100%", border: "1px solid black" }}>
          <thead>
            <tr>
              <th
                style={{
                  width: "15%",
                  border: "1px solid black",
                  textAlign: "center",
                  fontWeight: "bold",
                }}>
                Version
              </th>
              <th
                style={{
                  width: "15%",
                  border: "1px solid black",
                  textAlign: "center",
                  fontWeight: "bold",
                }}>
                Date
              </th>
              <th
                style={{
                  width: "30%",
                  border: "1px solid black",
                  textAlign: "center",
                  fontWeight: "bold",
                }}>
                Affected Studies
              </th>
              <th
                style={{
                  width: "40%",
                  border: "1px solid black",
                  textAlign: "center",
                  fontWeight: "bold",
                }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>{dataReleasesResults}</tbody>
        </table>
        <br></br>
        <p>
          Version numbers use the following scheme <b>x.y.z</b> where
        </p>
        <ul>
          <li>
            <b>x</b> is the version of ImmPort. The data is curated by ImmPort
            and ImmuneSpace gets updated after each offcial data release.
          </li>
          <li>
            <b>y</b> indicates a major data change. This includes loading new
            studies, adding datasets to existing studies or processing data such
            as creating gene expression matrices
          </li>
          <li>
            <b>z</b> indicates minor changes, such as reloading studies with
            minor corrections to existing assay or metadata
          </li>
        </ul>
        <p>
          Note that this only for <b>data</b>, the development of new features
          or updates to software infrastructure are tracked separately in{" "}
          <a href="?tab=SoftwareUpdates">Software Updates</a>
        </p>
      </div>
    );
  }
);

DataReleases.displayName = "DataReleases";
