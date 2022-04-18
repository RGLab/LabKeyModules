// import * as React from "react";
// import { DropdownButton, MenuItem } from "react-bootstrap";
// import { BarPlot, BarPlotDatum } from "./PlotComponents/mostCitedBarPlot";
// import { updatePmPlotData } from "./MostCited/utils";
// import { DROPDOWN_OPTIONS } from "./MostCited/constants";

// interface props {
//   transformedPmData: {
//     byPubId: BarPlotDatum[];
//   };
//   pmDataRange: {
//     byPubId: number[];
//   };
// }

// export const MostCited = React.memo<props>(
//   ({ transformedPmData, pmDataRange }: props) => {
//     const [pmOrderBy, setPmOrderBy] = React.useState(DROPDOWN_OPTIONS[0].value);

//     interface plotProps {
//       transformedPmData: {
//         byPubId: BarPlotDatum[];
//       };
//       pmDataRange: {
//         byPubId: number[];
//       };
//       pmOrderBy: string;
//     }

//     function onSelectChangeOrder(eventKey) {
//       setPmOrderBy(eventKey);
//     }

//     const getDropDown = React.useCallback(() => {
//       return (
//         <div>
//           <DropdownButton title="Select Order" id="order-select-dropdown">
//             <MenuItem
//               eventKey={DROPDOWN_OPTIONS[0].value}
//               onSelect={onSelectChangeOrder}
//             >
//               {DROPDOWN_OPTIONS[0].label}
//             </MenuItem>
//             <MenuItem
//               eventKey={DROPDOWN_OPTIONS[1].value}
//               onSelect={onSelectChangeOrder}
//             >
//               {DROPDOWN_OPTIONS[1].label}
//             </MenuItem>
//             <MenuItem
//               eventKey={DROPDOWN_OPTIONS[2].value}
//               onSelect={onSelectChangeOrder}
//             >
//               {DROPDOWN_OPTIONS[2].label}
//             </MenuItem>
//           </DropdownButton>
//         </div>
//       );
//     }, []);

//     const getContent = React.useCallback(() => {
//       const pmPlotData = updatePmPlotData(
//         transformedPmData,
//         pmDataRange,
//         pmOrderBy
//       );

//       if (typeof pmPlotData !== "undefined") {
//         return (
//           <BarPlot
//             data={pmPlotData.data}
//             titles={pmPlotData.titles}
//             name={pmPlotData.name}
//             height={pmPlotData.height}
//             width={pmPlotData.width}
//             dataRange={pmPlotData.dataRange}
//             linkBaseText={pmPlotData.linkBaseText}
//           />
//         );
//       } else {
//         return (
//           <div>
//             <i
//               aria-hidden="true"
//               className="fa fa-spinner fa-pulse"
//               style={{ marginRight: "5px" }}
//             />
//             Loading plots ...
//           </div>
//         );
//       }
//     }, [transformedPmData, pmDataRange, pmOrderBy]); // updated so that the plot updates when the data changes.

//     return (
//       <div id="#most-cited">
//         <h2>Most Cited Publications Related to Studies to ImmuneSpace</h2>
//         <p>
//           <b>For More Information:</b>
//         </p>
//         <ul>
//           <li>Hover over each bar for publication information</li>
//           <li>
//             Click on the Y-axis label to go to PubMed page for the publication
//           </li>
//           <li>
//             Update the ordering of the publications using the dropdown menu
//             below
//           </li>
//         </ul>
//         <br></br>
//         {getDropDown()}
//         {getContent()}
//       </div>
//     );
//   }
// );
