#!/bin/bash
   for f in ./* ; do
        if [ -d $f ] ; then
            cd $f
            t=`basename $f`
            if [ "$t" != "Scripts" ] ; then
                if [ "$t" = "extraWebapp" ] ; then
                    echo '===================================================================================='
                    echo $t 'is the splash page - copied where appropriate'
                    cp -r ../extraWebapp/ `dirname $MODULES_DIR`
                else
                    echo '===================================================================================='
                    if [ -f build.xml ] ; then
                        echo $t 'has a build file - attempting to deploy it'
                        ant > /dev/null
                    else
                        echo $t 'does not have a build.xml file - automatic deployment is not possible'
                    fi
                fi
            fi
            cd ..
        fi
    done

