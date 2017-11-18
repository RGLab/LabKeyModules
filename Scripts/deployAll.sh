#!/bin/bash

if [ `whoami` != 'immunespace' ];then
  echo "ERROR: This script should be executed by the 'immunespace' user."
  exit 1
fi

t=$1
if [ $# -eq 0 ] ; then
    if [ `hostname` = 'immunetestweb' ] ; then
        t='dev'
    else
        if [ `hostname` = 'immuneprodweb' ] ; then
            t='prod'
        else
            echo 'Script must be run on one of the web server machines. Unknown host, exiting...'
            exit 1
        fi
    fi
fi

for f in ./* ; do
    if [ -d $f ] ; then
        cd $f
        b=`basename $f`
        if [ "$b" != "Scripts" ] ; then
            if [ "$b" = "extraWebapp" ] ; then
                echo '===================================================================================='
                echo $b 'is the splash page - copied where appropriate'
                cp -r ../extraWebapp/ `dirname $MODULES_DIR`
            else
                echo '===================================================================================='
                if [ -f build.xml ] ; then
                    echo $b 'has a build file - attempting to deploy it with' $t 'target'
                    ant $t > /dev/null
                else
                    echo $b 'does not have a build.xml file - automatic deployment is not possible'
                fi
            fi
        fi
        cd ..
    fi
done

