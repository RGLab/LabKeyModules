import React from "react";
import { Query, Filter } from "@labkey/api";
import { IFilter } from "@labkey/api/dist/labkey/Filter";

const LabKeyDebugPage: React.FC = () => {
  const [nameSearched, setNameSearched] = React.useState("");
  const [filterType, setFilterType] = React.useState("gene");
  React.useEffect(() => {
    let isCancelled = false;

    const callLabkey = () => {
      console.log("fetching using executeSql");

      Query.executeSql({
        containerPath: "/AnalyteExplorer",
        schemaName: "lists",
        sql: `SELECT DISTINCT gene_expression.analyte_id AS analyte_id, gene_expression.analyte_type AS analyte_type
                  FROM gene_expression
                  WHERE gene_expression.analyte_id LIKE '${nameSearched.toUpperCase()}%'
                  ${
                    filterType === ""
                      ? `AND gene_expression.analyte_type != 'gene expression'`
                      : `AND gene_expression.analyte_type = '${filterType}'`
                  }
                  LIMIT 5`,
        success: (data) => console.log(data),
      });
    };

    if (!isCancelled) {
      callLabkey();
    }

    return () => {
      isCancelled = true;
    };
  }, [nameSearched, filterType]);

  React.useEffect(() => {
    let isCancelled = false;

    const callLabkey = () => {
      console.log("fetching using distinctrows");

      let filterArray: IFilter[] = [
        Filter.create(
          "analyte_id",
          nameSearched.toUpperCase(),
          Filter.Types.STARTS_WITH
        ),
      ];

      if (filterType !== "") {
        filterArray.push(Filter.create("analyte_type", filterType));
      } else {
        filterArray.push(
          Filter.create(
            "analyte_type",
            "gene signature",
            Filter.Types.NOT_EQUAL
          )
        );
      }

      Query.selectDistinctRows({
        column: "analyte_id",
        schemaName: "lists",
        queryName: "gene_expression",
        filterArray: filterArray,
        maxRows: 5,
        success: (data) => console.log(data),
      });
    };

    if (!isCancelled) {
      callLabkey();
    }

    return () => {
      isCancelled = true;
    };
  }, [nameSearched, filterType]);

  return <div></div>;
};

export default LabKeyDebugPage;
