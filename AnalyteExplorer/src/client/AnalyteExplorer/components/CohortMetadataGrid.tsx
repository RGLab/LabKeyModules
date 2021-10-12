import React from "react";
import {
  InjectedQueryModels,
  LoadingSpinner,
  SchemaQuery,
  withQueryModels,
  GridPanel,
} from "@labkey/components";

interface CohortMetaDataGridProps {
  title: string;
}

type IMPLProps = CohortMetaDataGridProps & InjectedQueryModels;

const CohortMetaDataGridImpl: React.FC<IMPLProps> = ({
  actions,
  queryModels,
  title,
}) => {
  console.log(queryModels);
  console.log("here");
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

const queryConfigs = {
  assayModel: {
    schemaQuery: SchemaQuery.create("lists", "gene_expression"),
  },
};

const CohortMetaDataGrid: React.FC = () => {
  return (
    <WrappedCohortMetaDataGrid
      title="Cohort Metadata Grid"
      queryConfigs={queryConfigs}
      autoLoad
    />
  );
};

export default CohortMetaDataGrid;
