if [ $1 ] ; then
    LOC=$1 # customized location

    IND=$( echo ${LOC} | head -c4)

    cd /labkey/src/labkey
    if [ $IND = 'http' ] ; then
        wget ${LOC}
    else
        mv ${LOC} /labkey/src/labkey
    fi

    NAME=`basename ${LOC}`

    tar xzf ${NAME}

    ./${NAME%.*.*}/manual-upgrade.sh -l /labkey/labkey -d ./${NAME%.*.*} -c /labkey/apps/tomcat -u immunespace --service
else
    echo 'The web address or path of the server build tar file must be specified as the argument'
fi

