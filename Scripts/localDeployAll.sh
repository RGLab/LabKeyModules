#!/bin/bash


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd ${DIR}/..

for f in ./* ; do
    if [ -d $f ] ; then
        cd $f
        b=`basename $f`
        if [ "$b" != "Scripts" ] ; then
            if [ "$b" = "extraWebapp" ] ; then
                echo '===================================================================================='
                echo $b 'is the splash page - copied where appropriate'
                cp -r ../extraWebapp/ ../../release18.3/externalModules/ 
            else
                echo '===================================================================================='
                if [ -f build.xml ] ; then
                    echo $b 'has a build file - attempting to deploy it with' local 'target'
                    ant local > /dev/null
		    cp -r ../$b ../../release18.3/externalModules/ 
                else
                    echo $b 'does not have a build.xml file - automatic deployment is not possible'
                fi
            fi
        fi
        cd ..
    fi
done

