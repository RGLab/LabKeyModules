#!/bin/bash

if [ `hostname | tail -c5` != 'Web2' ];then # Web server machine
  echo "ERROR: This script should be executed on the Web server machine."
  exit 1
fi

if [ `whoami` = 'root' ] ; then
    if [ $1 ] ; then
        LOC=$1 # customized location
        cd /labkey/src/labkey

        IND=$( echo ${LOC} | head -c1 )
        if [[ $IND = '/' || $IND = '.' ]] ; then # local location
            NAME=`basename ${LOC}`
            if [ ${LOC} != /labkey/src/labkey/${NAME} ] ; then
                if [ -f `echo /labkey/src/labkey/${NAME}` ] ; then
                    echo 'FYI: file with name /labkey/src/labkey/'${NAME} 'already exists'
                    mv -i ${LOC} /labkey/src/labkey
                else
                    mv ${LOC} /labkey/src/labkey
                fi
            fi
        else # remote location
            if [[ $LOC =~ ^[0-9]{2}[.][1-3]{1}r$ ]] ; then
                FOLDER=${LOC/./}'elease'
                VERSION=`echo ${LOC} | head -c4`
                LOC='http://teamcity.labkey.org/repository/download/LabKey_'${FOLDER}'_Premium_Installers/lastSuccessful/immunespace/LabKey'$VERSION'-%7Bbuild.number%7D-IMMUNESPACE-bin.tar.gz'
            fi
            if [[ $LOC =~ ^[0-9]{2}[.][1-3]{1}rb$ ]] ; then
                FOLDER=`echo $( echo ${LOC/./} | head -c3 )'Release'`
                VERSION=`echo $( echo ${LOC} | head -c4 )'Beta'`
                LOC='http://teamcity.labkey.org/repository/download/LabKey_'${FOLDER}'_Premium_Installers/lastSuccessful/immunespace/LabKey'$VERSION'-%7Bbuild.number%7D-IMMUNESPACE-bin.tar.gz'
            fi
            if [[ $LOC =~ ^[0-9]{2}[.][1-3]{1}t$ ]] ; then
                FOLDER=trunk
                VERSION=`echo $( echo ${LOC} | head -c4 )'-SNAPSHOT'`
                LOC='http://teamcity.labkey.org/repository/download/LabKey_'${FOLDER}'_Premium_Installers/lastSuccessful/immunespace/LabKey'$VERSION'-%7Bbuild.number%7D-IMMUNESPACE-bin.tar.gz'
            fi
            if [ $( echo ${LOC} | head -c4 ) = 'http' ] ; then
                LOC=${LOC/http:\/\/teamcity.labkey.org\/repository\/download\//http:\/\/teamcity.labkey.org\/httpAuth\/repository\/download\/}
                echo 'Downloading from:'
                echo ${LOC}
                LOC=`curl ${LOC} -gJLO -w '%{url_effective}' -u ${REALUSER} | cut -d ' ' -f6`
                NAME=`basename ${LOC}`
                rm -fv /labkey/src/labkey/LabKey*-{build.number}-IMMUNESPACE-bin.tar.gz
            else
                echo 'The specified argument "'$1'" does not resolve to a valid location for the build'
                exit 1
            fi
        fi
        if [ $? -ne 0 ] ; then
            echo 'Please, debug, unspecified error occured due to the last exit code being: ' $?
            exit 1
        fi

        echo
        echo ${NAME%.*.*}
        tar xzf ${NAME}
        ./${NAME%.*.*}/manual-upgrade.sh -l /labkey/labkey -d ./${NAME%.*.*} -c /labkey/apps/tomcat -u immunespace --service --noPrompt
    else
        echo 'The web address or version in the format ##.#[r/rb/t] (where "r" stands for "release", "rb" for "release beta", and "t" - for "trunk") or path of the server build tar file must be specified as the first argument'
        exit 1
    fi
else
    echo 'You must be the root user in order to run this update script'
    exit 1
fi

