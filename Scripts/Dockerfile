# The image below can be obtained via
# "git clone https://github.com/LabKey/docker-rstudio.git"
# and subsequently built via invoking
# "images/labkey/rstudio-base/make"

FROM labkey/rstudio-base:3.4.0
ARG build_type
RUN apt-get update

COPY installLibs.sh /
RUN dos2unix /installLibs.sh; /installLibs.sh

COPY listOfNeededRPackages /
RUN dos2unix /listOfNeededRPackages

COPY installR.R /
RUN dos2unix /installR.R; Rscript --vanilla installR.R ${build_type}

RUN chmod -R 755 /usr/local/lib/R/site-library

COPY Renviron.site /etc/R/Renviron.site
RUN dos2unix /etc/R/Renviron.site

