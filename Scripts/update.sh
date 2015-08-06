if [ $1 ] ; then
    LOC=$1 # customized location
    NAME=`basename ${LOC}`
    IND=$( echo ${LOC} | head -c4 )

    cd /labkey/src/labkey
    if [ $IND = 'http' ] ; then
        wget ${LOC}
    else
        if [ -f `echo /labkey/src/labkey/${NAME}` ] ; then
            echo 'File with name /labkey/src/labkey/'${NAME} 'already exists, please, remove it first'
            exit 1
        else
            mv ${LOC} /labkey/src/labkey 2> /dev/null
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

