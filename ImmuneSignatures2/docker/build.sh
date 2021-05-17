#!/bin/bash

# Make sure you have GITHUB_PAT saved as an environment variable.variable
docker build -t immunesignatures2:4.0.2 --build-arg GITHUB_PAT=$GITHUB_PAT
docker run immunesignatures2:4.0.2
