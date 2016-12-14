if [ `whoami` = 'root' ] ; then
    if [ $1 ] ; then
        cd /share/github/LabKeyModules
        ./Scripts/installLibs.sh

        cd ~
        wget https://cran.r-project.org/src/base/R-$( echo ${1} | head -c1 )/R-${1}.tar.gz
        tar -xzf R-${1}.tar.gz
        cd R-${1}.tar.gz
        ./configure --enable-R-shlib --prefix=/usr
        echo " Press [Enter] to start the upgrade. "
        read -p " " read_variable
        make
        make install

        cd /share/github/LabKeyModules
        ./Scripts/getRpkgs.sh
        Rscript installR.R
    else
        echo 'The R version must be specified as the argument'
    fi
else
    echo 'You must be the root user in order to run this update script'
fi

