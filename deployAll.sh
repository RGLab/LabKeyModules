#!/bin/bash
   for f in ./* ; do
        if [ -d $f ] ; then
            cd $f
            t=`basename $f`
            echo '===================================================================================='
            if [ "$t" = "extraWebapp" ] ; then
                echo $t 'is the splash page - copied where appropriate'
                cp -r ../extraWebapp/ `dirname $MODULES_DIR`
            else
                if [ -f build.xml ] ; then
                    echo $t 'has a build file - attempting to deploy it'
                    ant deploy > /dev/null
                else
                    echo $t 'does not have a build.xml file - automatic deployment is not possible'
                fi
            fi
            cd ..
        fi
    done

