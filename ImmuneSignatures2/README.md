# ImmuneSignatures2

Reproduce figures and analysis and data for ImmuneSignatures2 publications. 

## Dependencies 

__Modules__: ImmuneSpaceStudyOverview, VirtualStudyBase, HIPCMatrix

[ImmuneSignatures2 R package](https://github.com/rglab/ImmuneSignatures2)

## Setup 

1. [Publish virtual study](https://www.notion.so/rglab/Publish-Study-from-Participant-Group-aka-Virtual-Study-b68608262d6d427eb2e77f133572be48)
1. [Set up UI](https://www.notion.so/rglab/ImmSig2-server-setup-446532d9490841aab1bab51ecb3c8f10)
1. Set up Docker
    1. Build the [docker image](https://github.com/RGLab/LabKeyModules/tree/fb_IS2_ETL/Scripts/docker-immsig2)
    1. [Set up the server](https://github.com/RGLab/ImmuneSignatures2/tree/dev/inst/docker#installation-on-immunespace-server) to use the immunesignatures2 docker image for R reports and pipeline tasks within the module
1. Run ETLs. There are three, which must be run in order: 
    1. Pull Expression Sets: this will pull the expression sets from the IS2 virtual study and save them in an R object. 
    1. Generate Base Expression Set: Merge all expressionsets and perform quality control filtering
    1. Create Final Expression Sets: Perform cross-study normalization and batch correction and save analysis-ready esets

## ETLs
There are three ETLs which perform all the preprocessing to create the analysis-ready expressionsets, which should be run in order. The ETLs utilize the [ImmuneSignatures2](https://github.com/RGLab/ImmuneSignatures2) package, and run the Rmd reports saved to the `inst/` directory. All output data are saved to `/share/files/HIPC/IS2/@files/data`. A summary of the output data will be saved to the file `dataset_metadata.csv`, including the date that each dataset was most recently updated, as well as the version of the ImmuneSignatures2 package used to run it. 

## Docker 
This module is intended to be set up to run 

## Resources

<!-- _Links to any helpful resources like LabKey or Notion documentation or external sources used when developing this module_ -->

