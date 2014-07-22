HIPCMatrix module
=======================

Normalize ImmuneSpace's raw gene expression data into expression matrices

Setup
-----

1. Build the module and deploy to the server.

2. In the study containing an immport study, enable the HIPCMatrix module.

3. Create a new 'ExpressionMatrix' assay in the folder with the name 'matrix'
    - In a future version, you may select a target assay to import into.

4. Upload a new Feature Annotation Set:
    - On a portal page, add the "Feature Annotation Sets" webpart
    - Click the "Import Feature Annotation Set" button
    - Upload a tsv annotation set with the columns: Probe_ID, Gene_Symbol

5. Ensure the .CEL data files are under the 'rawdata/gene_expression' directory in the pipelne root.


Demo
----

1. Navigate to the gene_expression_files dataset

2. Select a few rows, click the 'Create Matrix' button in the button bar.

3. Fill in the form:

- Enter a name and comments
- Select the feature annotation set
- Select the pipeline to use

4. Clicking 'Create Matrix' will:

    - Check the 'Study Specimens' SampleSet for each selected biosample
    - Submit the pipeline job that will:
        - create the matrix from the files
        - import the results into the 'matrix' assay

5. The output is two tsv files. An expression matrix with the probes as first column and the first column title is a space. And an expression matrix with values averaged per gene and a first column titled "gene__symbol". All other columns are biosample_accession.


<table>
  <tr><td> </td><td>&lt;BioSample01&gt;</td><td>&lt;BioSample02&gt;</td><td>...</td></tr>
  <tr><td>&lt;probe01&gt;</td><td>&lt;value&gt;</td><td>&lt;value&gt;</td><td>&nbsp;</td></tr>
  <tr><td>&lt;probe02&gt;</td><td>&lt;value&gt;</td><td>&lt;value&gt;</td><td>&nbsp;</td></tr>
  <tr><td colspan=4>...</td></tr>
</table>

