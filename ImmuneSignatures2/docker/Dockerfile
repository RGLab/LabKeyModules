ARG VERSION=4.0.2
FROM rocker/r-ver:${VERSION}


RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends dos2unix nano procps libxml2-dev xvfb sudo && \
    apt-get install -y --no-install-recommends  \
    curl libcurl4-openssl-dev \
    libgd-dev libcairo2 libcairo2-dev libxt-dev pandoc \
    libssl-dev openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

## Set a default user. Available via runtime flag `--user docker`
## Add user to 'staff' group, granting them write privileges to /usr/local/lib/R/site.library
## User should also have & own a home directory.
RUN useradd docker \
    && mkdir /home/docker \
    && mkdir /home/docker/R_Sandbox \
    && chown -R docker /home/docker \
    && adduser docker staff \
    && adduser docker sudo \
    && echo 'docker ALL=(root) NOPASSWD:ALL' >> /etc/sudoers \
    && echo 'docker ALL=(root) NOPASSWD:ALL' >> /etc/sudoers.d/docker \
    && chmod 0440 /etc/sudoers.d/docker \
    && chmod -R 775 /home/docker

# Pass in your github pat when building so ImmuneSignatures2 private repo can install 
ARG GITHUB_PAT
ENV GITHUB_PAT=${GITHUB_PAT}

# Install renv
ENV RENV_VERSION 0.13.2
RUN R -e "install.packages('remotes', repos = c(CRAN = 'https://cloud.r-project.org')); remotes::install_github('rstudio/renv@0.13.2')"

# Copy over renv files
# Install packages
WORKDIR /home/docker
COPY renv.lock /home/docker/
COPY install.R /home/docker/
RUN dos2unix /home/docker/renv.lock \
    && dos2unix /home/docker/install.R && \
    && chown -R docker /home/docker \
    su docker -c 'R --no-site-file -f /home/docker/install.R'


# RUN dos2unix install.R && \
#     R --no-site-file -f install.R &&  \
#     chmod -R 755 /usr/local/lib/R/site-library


CMD ["su", "docker", "-c", "/bin/bash"]
