import React from "react";
import { Query, Filter } from "@labkey/api";
import { IFilter } from "@labkey/api/dist/labkey/Filter";

const LabKeyDebugPage: React.FC = () => {
  const [nameSearched, setNameSearched] = React.useState("A");
  const [filterType, setFilterType] = React.useState("gene");

  const binaryClosestSearch = (
    query: string,
    array: { analyte_id: string; analyte_type: string }[],
    left: number,
    right: number
  ): number => {
    if (query === undefined || array.length < 1 || right - left < 0) {
      return -1;
    }

    const middle = Math.floor(left + (right - left) / 2);
    console.log(`left: ${left} right: ${right} midde: ${middle}`);
    //console.log(middle);
    //console.log(`query: ${query} middle: ${array[middle]["analyte_id"]}`);

    let result = -1;

    if (query === array[middle]["analyte_id"]) {
      return middle;
    } else if (query > array[middle]["analyte_id"]) {
      //console.log("bigger");
      result = binaryClosestSearch(query, array, middle + 1, right);
    } else if (query < array[middle]["analyte_id"]) {
      //console.log("smaller");
      result = binaryClosestSearch(query, array, left, middle - 1);
    }

    if (result < 0) {
      if (array[middle]["analyte_id"].includes(query)) {
        return middle;
      }
    }
    return result;
  };

  // React.useEffect(() => {
  //   let isCancelled = false;

  //   const callLabkey = () => {
  //     console.log("fetching analytes");

  //     Query.executeSql({
  //       containerPath: "/AnalyteExplorer",
  //       schemaName: "lists",
  //       sql: `SELECT analyte_id FROM test_genes WHERE test_genes.analyte_id LIKE 'A%'`,
  //       success: (data) => console.log(data),
  //     });
  //   };

  //   if (!isCancelled) {
  //     callLabkey();
  //   }

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, []);

  React.useEffect(() => {
    let isCancelled = false;

    const parseData = (data: any) => {
      console.log(data);
      let geneData = [];
      let btmData = [];

      // console.log(
      //   binaryClosestSearch("ACOT9", data.rows, 0, data.rows.length - 1)
      // );
    };

    const callLabkey = () => {
      console.log("fetching using executeSql");

      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT gene_expression.analyte_id AS analyte_id, analyte_type
                  FROM gene_expression
                  WHERE gene_expression.analyte_type != 'gene signature'
                  
                  `,
        success: parseData,
      });
    };

    if (!isCancelled) {
      callLabkey();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // React.useEffect(() => {
  //   let isCancelled = false;

  //   const callLabkey = () => {
  //     console.log("fetching using distinctrows");

  //     let filterArray: IFilter[] = [
  //       Filter.create(
  //         "analyte_id",
  //         nameSearched.toUpperCase(),
  //         Filter.Types.STARTS_WITH
  //       ),
  //     ];

  //     if (filterType !== "") {
  //       filterArray.push(Filter.create("analyte_type", filterType));
  //     } else {
  //       filterArray.push(
  //         Filter.create(
  //           "analyte_type",
  //           "gene signature",
  //           Filter.Types.NOT_EQUAL
  //         )
  //       );
  //     }

  //     Query.selectDistinctRows({
  //       column: "analyte_id",
  //       schemaName: "lists",
  //       queryName: "gene_expression",
  //       filterArray: filterArray,
  //       maxRows: 5,
  //       success: (data) => console.log(data),
  //     });
  //   };

  //   if (!isCancelled) {
  //     callLabkey();
  //   }

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [nameSearched, filterType]);

  return <div></div>;
};

export default LabKeyDebugPage;
