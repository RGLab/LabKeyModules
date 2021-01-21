# ImmuneResponsePredictor

This module can be used to automatically select a group of genes whose expression at a given time point (e.g. gene expression levels at day 0) best predicts a given immunological response at a later time point (e.g. HAI at day 28).
It uses penalized linear or logistic multivariate regression as implemented in the [glmnet](http://cran.r-project.org/web/packages/glmnet/index.html) R package. The gene selection part is done by cross validation. More details can be found by exploring the manual or the source code.

## Dependencies 

* DifferentialExpressionAnalysis module

## Setup 

<!-- Instructions for getting module working on the server -->

## Resources

[glmnet](http://cran.r-project.org/web/packages/glmnet/index.html)
