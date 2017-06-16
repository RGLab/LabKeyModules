#~/bin/bash
set -e
if [ `whoami` = 'root' ] ; then
    if [ $1 ] ; then
        START_TIME=$SECONDS

        if [ $2 ] ; then
            LK_MODULES_PATH=~
            BUILD_TYPE=$2
            INTERACTIVE=no
        elif [ `hostname | head -c10` = 'immunetest' ] ; then
            LK_MODULES_PATH=/share/github/
            BUILD_TYPE=master
            INTERACTIVE=yes
        elif [ `hostname | head -c10` = 'immuneprod' ] ; then
            LK_MODULES_PATH=/share/github/
            BUILD_TYPE=release
            INTERACTIVE=yes
        else
            echo 'Build type cannot be detected, must be specified'
            exit 1
        fi

        cd ${LK_MODULES_PATH}
        if [ ! -e `which git` ] ; then
            apt-get install git
        fi
        if [ ! -d LabKeyModules ] ; then
            echo
            echo '=============================================='
            echo 'Downloading the LabKeyModules repo from GitHub'
            echo '=============================================='
            git clone https://github.com/RGLab/LabKeyModules.git
        fi

        echo
        echo '==============================================================='
        echo 'Switching to an appropriate branch and updating the source code'
        echo '==============================================================='
        cd ${LK_MODULES_PATH}/LabKeyModules
        git checkout $BUILD_TYPE
        git pull

        ./Scripts/installLibs.sh

        echo
        echo '================================================================='
        echo 'Downloading, unpacking, configuring, and building R version '${1}
        echo '================================================================='

        if hash Rscript 2>/dev/null ; then
            R_LIBS=`Rscript -e 'cat( .libPaths() )'`
        else
            R_LIBS=/usr/lib/R/library
        fi
        rm -rf ${R_LIBS}
        cd ~
        wget https://cran.r-project.org/src/base/R-$( echo ${1} | head -c1 )/R-${1}.tar.gz
        tar -xzf R-${1}.tar.gz
        cd R-${1}
        if [ ${INTERACTIVE} = 'yes' ] ; then
            ./configure --enable-R-shlib --prefix=/usr
            echo " Press [Enter] to start the upgrade. "
            read -p " " read_variable
        else # INTERACTIVE = 'no'
            ./configure --enable-R-shlib --prefix=/usr > ./R-conig.log
        fi
        make
        make install

        echo
        echo '======================================================='
        echo 'Determining and installing the set of needed R packages'
        echo '======================================================='
        cd ${LK_MODULES_PATH}/LabKeyModules
        ./Scripts/getRpkgs.sh
        Rscript ./Scripts/installR.R ${BUILD_TYPE}

        ELAPSED_TIME=$(($SECONDS - $START_TIME))
        echo
        echo 'Completed in' `date -d "1970-01-01 ${ELAPSED_TIME} sec" +'%k:%M:%S'`

    else
        echo 'The R version must be specified as the argument'
    fi
else
    echo 'You must be the root user in order to run this update script'
fi
