import React from "react";
import {
  InjectedQueryModels,
  SchemaQuery,
  withQueryModels,
  GridPanel,
} from "@labkey/components";

import { Filter } from "@labkey/api";

import "./CohortMetadataGrid.scss";

interface CohortMetaDataGridProps {
  title: string;
}

type IMPLProps = CohortMetaDataGridProps & InjectedQueryModels;

const CohortMetaDataGridImpl: React.FC<IMPLProps> = ({
  actions,
  queryModels,
  title,
}) => {
  const model = queryModels.assayModel;
  return (
    <div className="cohort-metadata-grid">
      <GridPanel model={model} actions={actions} />;
    </div>
  );
};

const WrappedCohortMetaDataGrid = withQueryModels<CohortMetaDataGridProps>(
  CohortMetaDataGridImpl
);

interface CohortMetaDataGridBaseProps {
  arm_accessions: string[];
}

const CohortMetaDataGrid: React.FC<CohortMetaDataGridBaseProps> = ({
  arm_accessions,
}) => {
  const queryConfigs = {
    assayModel: {
      schemaQuery: SchemaQuery.create("lists", "cohorts"),
      baseFilters: [
        Filter.create(
          "arm_accession",
          arm_accessions,
          Filter.Types.CONTAINS_ONE_OF
        ),
      ],
    },
  };

  // key is used to force re-render
  // https://github.com/LabKey/labkey-ui-components/blob/9ec098596e2264fc2a420431a87603e716bc398e/packages/components/src/public/QueryModel/withQueryModels.tsx#L196
  return (
    <WrappedCohortMetaDataGrid
      key={
        arm_accessions.length > 0
          ? `${arm_accessions[0]}${Math.floor(Math.random() * 10000)}`
          : `${Math.floor(Math.random() * 10000)}`
      }
      title="Cohort Metadata Grid"
      queryConfigs={queryConfigs}
    />
  );
};

export default CohortMetaDataGrid;
