HIPCMatrix module
=======================

Setup
-----

1. Build the module and deploy to the server.

2. In the study containing an immport study, enable the HIPCMatrix module.

3. Create a Sample Set named 'Samples' with single column 'biosample_accession' by pasting in a tsv:
    http://<server>/<folder>/experiment-showUploadMaterials.view

4. After creating the Sample Set, click 'Edit Fields' and change the 'biosample_accession' column to be a lookup to immport.biosample.biosample_accession.

5. You may want to add extra columns to the default view: subject_accession, study_timepoint_collected, study_timepoint_collected_unit

6. Upload a new Feature Annotation Set:
    - On a portal page, add the "Feature Annotation Sets" webpart
    - Click the "Import Feature Annotation Set" button
    - Upload a tsv annotation set with the columns: Probe_ID, Gene_Symbol

7. Create a new 'ExpressionMatrix' assay in the folder with the name 'matrix'
    - In a future version, you may select a target assay to import into.

8. Ensure the .CEL data files are under the 'rawdata/gene_expression' directory.


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

5. Generated matrix is a tab-separated file with the header row containing 'ID_REF' and sample names.  Each row contains the probe id in the ID_REF column and the remaining columns are the matrix values.

<table>
  <tr><td>ID_REF</td><td>&lgt;BioSample01&gt;</td><td>&lt;BioSample02&gt;</td><td>...</td></tr>
  <tr><td>&lt;probe01&gt;</td><td>&lt;value&gt;</td><td>&lt;value&gt;</td><td>&nbsp;</td></tr>
  <tr><td>&lt;probe02&gt;</td><td>&lt;value&gt;</td><td>&lt;value&gt;</td><td>&nbsp;</td></tr>
  <tr><td colspan=4>...</td></tr>
</table>

