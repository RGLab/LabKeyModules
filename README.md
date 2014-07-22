LabKeyModules
=============

LabKey Modules for ImmuneSpace

###study_pubinfo
Add PubMed statistics and citations information

###ImmuneResponsePredictor
**Title:** Immune Response Predictor

**Summary:** This module can be used to automatically select a group of genes whose expression at a given time point (e.g. gene expression levels at day 0) best predicts a given immunological response at a later time point (e.g. HAI at day 28).
It uses penalized linear or logistic multivariate regression as implemented in the [glmnet](http://cran.r-project.org/web/packages/glmnet/index.html) R package. The gene selection part is done by cross validation. More details can be found by exploring the manual or the source code.

###GeneExpressionExplorer
**Title:** Gene Expression Explorer

**Summary:** This module can be used to quickly plot the expression level of one or more genes against a selected immunological response variable (e.g. HAI) in one or more cohorts. Visualization is achieve using the [ggplot2](http://cran.r-project.org/web/packages/ggplot2/index.html) R package. Demographics variables such as gender and age can be added to the plot using aesthetic variables such as color, shape etc. More details can be found by exploring the manual or the source code.

### DifferentialGeneExpressionAnalysis
**Title:** Differential Gene Expression Analysis

**Summary:** This module can be used to test for differential gene expression across time (or across a pre-specified contrast) within a specified cohort. It uses the [Limma](http://www.bioconductor.org/packages/release/bioc/html/limma.html) R package for performing differential expression analysis. More details can be found by exploring the manual or the source code. 

### GeneSetEnrichmentAnalysis
**Title:** Gene Set Enrichment Analysis

**Summary:** This module can be used to perform a gene set enrichment analysis across time (or across a prespecified contrast) within a specified cohort. It uses the CAMERA method of the [Limma](http://www.bioconductor.org/packages/release/bioc/html/limma.html) R package for performing gene set enrichment analysis. More details can be found by exploring the manual or the source code.

###HIPCMatrix
Create expression matrix using an R pipeline job and import assay into LabKey's microarray ExpressionMatrix assay

###SDY162, SDY180, SDY212, SDY269, SDY61
Queries and reports to be transfered to ImmuneSpace

