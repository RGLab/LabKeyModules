# LabKeyModules scripts

Utility scripts for maintaining ImmuneSpace

## Set up docker

https://www.notion.so/rglab/Make-and-configure-RStudio-docker-image-3700b45990404eaf99d18c3161601c1c

To install docker image for ImmuneSignatures2: 
`./make 4.0.2 $GITHUB_PAT dev` 
The first argument is the version of R to use
The second argument is your github personal access token to install private repos (ImmuneSignatures2). You can fill it in here if you don't have it saved as an environment variable.
The third argument is the build type (ISR branch)

This pulls the [https://github.com/LabKey/docker-rstudio](https://github.com/LabKey/docker-rstudio) repo and then runs the command

```bash
docker build --no-cache -t immunespace/rstudio:${VERSION} --build-arg version=${VERSION} --build-arg build_type=${BUILD_TYPE} --build-arg github_pat=${GITHUB_PAT} ${DIR}
```

To run on local: 
```bash
export VERSION=4.0.2
export BUILD_TYPE=dev
docker build --no-cache -t immunesignatures/rstudio:${VERSION} --build-arg version=${VERSION} --build-arg build_type=${BUILD_TYPE} .
```

which uses the rstudio-base:$version as the starting point and then uses the Scripts/Dockerfile to additionally install other needed lower level libraries and R packages. 

We will use this for developing ImmuneSignatures2. The file `install_immsisg2_libraries.R` will have to be updated and the image rebuilt to install new packages. When ImmuneSignatures2 is finalized and the environment is ready to be snapshotted, create an renv.lock file and commit it to the ImmuneSignatures2 repo, and build the ImmuneSignatures2 repo using that renv.lock file. 

