sudo docker build --no-cache -t immunesignatures2/rstudio:${VERSION} --build-arg version=${VERSION} --build-arg build_type=dev --build-arg github_pat=${GITHUB_PAT} .
