ExpressionMatrix module
=======================

Setup
-----

1. Build the module and deploy to the server.

2. In the study containing an immport study, enable the ExpressionMatrix module.

3. Create a Sample Set named 'Samples' with single column 'biosample_accession' by pasting in a tsv:
    http://<server>/<folder>/experiment-showUploadMaterials.view

4. After creating the Sample Set, click 'Edit Fields' and change the 'biosample_accession' column to be a lookup to immport.biosample.biosample_accession.

5. You may want to add extra columns to the default view: subject_accession, study_timepoint_collected, study_timepoint_collected_unit

6. Upload a new Feature Annotation Set: navigate to the Microarray.FeatureAnnotationSet grid and click on 'Insert New' or go directly to the upload page:
    http://<server>/<folder>/feature-annotationset-upload.view

7. Create a new 'ExpressionMatrix' assay in the folder with the name 'matrix'
    - In a future version, you may select a target assay to import into.

8. Ensure the data files are under the 'rawdata/gene_expression' directory.


Demo
----

1. Navigate to the gene_expression_files dataset

2. Select a few rows, click the 'Create Matrix' button in the button bar.

3. Fill in the form:
    - Enter a name and comments
    - Select the feature annotation set
    - Select the pipeline to use

4. Clicking 'Create Matrix' will:
    - Create entries in the 'Samples' SampleSet for each selected biosample
    - Submit the pipeline job that will:
        - create the matrix from the files
        - import the results into the 'matrix' assay

5. Generated matrix must be a tab-separated file of the format:
    ID_REF   Sample01   Sample2
    probe01  1          2

