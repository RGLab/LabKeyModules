FROM trestletech/plumber
MAINTAINER Evan Henrich <ehenrich@fredhutch.org>

RUN R -e "install.packages(c('data.table', 'rjson', 'uwot', 'stringr'))"

CMD ["/app/ResourcePage_plumber.R"]
