#!/bin/bash

usage="
./build_module.sh <module_name>

The module name should be the name of the folder as well.
"

if [ "$1" == "" ]
  then
  echo "$usage"
  exit 1
fi 
module=$1

cd $module
ant
cp ${module}.module ~/Programs/labkey_dev/labkey_home/modules/
rm ${module}.module
cd -
