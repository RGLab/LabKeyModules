if [ `whoami` = 'root' ] ; then
    if [ $1 ] ; then
        LOC=$1 # customized location
        LOC=${LOC/http:\/\/teamcity.labkey.org\/repository\/download\//http:\/\/teamcity.labkey.org\/guestAuth\/repository\/download\/}
        NAME=`basename ${LOC}`
        IND=$( echo ${LOC} | head -c4 )

        cd /labkey/src/labkey
        if [ $IND = 'http' ] ; then
            wget ${LOC}
        else
            if [ ${LOC} != /labkey/src/labkey/${NAME} ] ; then
                if [ -f `echo /labkey/src/labkey/${NAME}` ] ; then
                    echo 'File with name /labkey/src/labkey/'${NAME} 'already exists, please, remove it first'
                    # mv -i ${LOC} /labkey/src/labkey
                else
                    mv ${LOC} /labkey/src/labkey
                fi
            fi
        fi
        if [ $? -ne 0 ] ; then
            echo 'Please, debug, unspecified error occured due to the last exit code being: ' $?
            exit 1
        fi

        tar xzf ${NAME}
        ./${NAME%.*.*}/manual-upgrade.sh -l /labkey/labkey -d ./${NAME%.*.*} -c /labkey/apps/tomcat -u immunespace --service
    else
        echo 'The web address or path of the server build tar file must be specified as the argument'
    fi
else
    echo 'You must be the root user in order to run this update script'
fi

