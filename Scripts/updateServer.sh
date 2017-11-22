# This URL will consistently get you the latest 17.1 installer:

if [ `hostname | tail -c4` != 'web' ];then # Web server machine
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
            if [[ $LOC =~ ^[0-9]{2}[.][1-3]{1}$ ]] ; then
                LOC='http://teamcity.labkey.org/repository/download/LabKey_'${LOC/./}'Release_Premium_Installers/lastSuccessful/immunespace/LabKey'$LOC'-{build.number}-IMMUNESPACE-bin.tar.gz'
            fi
            if [ $( echo ${LOC} | head -c4 ) = 'http' ] ; then
                LOC=${LOC/http:\/\/teamcity.labkey.org\/repository\/download\//http:\/\/teamcity.labkey.org\/httpAuth\/repository\/download\/}
                LOC=`curl ${LOC} -gJLO -w '%{url_effective}' -u ${REALUSER} | cut -d ' ' -f6`
                NAME=`basename ${LOC}`
            else
                echo 'The specified argument "'$1'" does not resolve to a valid location for the build'
                exit 1
            fi
        fi
        if [ $? -ne 0 ] ; then
            echo 'Please, debug, unspecified error occured due to the last exit code being: ' $?
            exit 1
        fi

        tar xzf ${NAME}
        ./${NAME%.*.*}/manual-upgrade.sh -l /labkey/labkey -d ./${NAME%.*.*} -c /labkey/apps/tomcat -u immunespace --service --noPrompt
    else
        echo 'The web address or version in the format ##.# or path of the server build tar file must be specified as the first argument'
        exit 1
    fi
else
    echo 'You must be the root user in order to run this update script'
    exit 1
fi

