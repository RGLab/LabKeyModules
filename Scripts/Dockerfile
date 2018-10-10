# The image below can be obtained via
# "git clone https://github.com/LabKey/docker-rstudio.git"
# and subsequently built via invoking
# "images/labkey/rstudio-base/make"

ARG version
FROM labkey/rstudio-base:${version}
ARG build_type
RUN apt-get update
RUN apt-get install -y libgeos++-dev

COPY installLibs.sh /
RUN dos2unix /installLibs.sh; /installLibs.sh

COPY listOfNeededRPackages /
RUN dos2unix /listOfNeededRPackages

COPY installR.R /
RUN dos2unix /installR.R; Rscript --vanilla installR.R ${build_type}

RUN chmod -R 755 /usr/local/lib/R/site-library

COPY Renviron.site /etc/R/Renviron.site
RUN dos2unix /etc/R/Renviron.site

COPY Rprofile.site /Rprofile.site.tmp
RUN dos2unix /Rprofile.site.tmp && \
    cat /Rprofile.site.tmp >> /usr/local/lib/R/etc/Rprofile.site && \
    rm /Rprofile.site.tmp

COPY ImmuneSpace-RStudio.Rd /ImmuneSpace-RStudio.Rd
RUN dos2unix /ImmuneSpace-RStudio.Rd
