#!/bin/bash

# This script copies the files into each studies
# It should be run by the immunespace user on the RServe machine
# For multiple studies, input them as a space separated list enclosed with quotes


if [ `whoami` != 'immunespace' ];then
  echo "ERROR: This script should be executed by the 'immunespace' user."
  exit 1
fi

if [ `hostname | tail -c7` != 'rserve' ];then # RServe machine
  echo "ERROR: This script should be executed on the RServe machine."
  exit 1
fi

aspera_files="/share/aspera_files/" # where the files from immport are stored
copy_logs=${aspera_files}/copy_logs.txt
studies=$1
if [ "$studies" == "" ];then
  echo "No target study specified. All studies will be updated."
  studies=`ls ${aspera_files} | grep ^SDY*`
else
  args=`grep "^SDY[0-9]*" <<< $studies`
  if [ "$args" == "" ];then
    echo "ERROR: Malformed study accession number"
    echo "usage: bash copy2studies.sh [SDYXXX]"
    exit 1
  fi
fi

for study in $studies
do
  echo "${study}:"
  if [ ! -d /share/files/Studies/${study}/ ];then
    echo "ERROR: The study folder doesn't exist. Create it from the UI first."
    exit 1
  fi
  # Create the folders in the studies if they don't exist
  dir_proto="/share/files/Studies/${study}/@files/protocols"
  dir_ge="/share/files/Studies/${study}/@files/rawdata/gene_expression"
  dir_flow="/share/files/Studies/${study}/@files/rawdata/flow_cytometry"
  dir_analysis="/share/files/Studies/${study}/@files/analysis"
  if [ ! -d ${dir_proto} ];then
    mkdir ${dir_proto}
  fi
  if [ ! -d /share/files/Studies/${study}/@files/rawdata ];then
    mkdir /share/files/Studies/${study}/@files/rawdata
  fi
  if [ ! -d ${dir_ge} ];then
    mkdir ${dir_ge}
  else
    rm -rf ${dir_ge}/*
  fi
  if [ ! -d ${dir_flow} ];then
    mkdir ${dir_flow} 
  else
    rm -f ${dir_flow}/*
  fi
  if [ ! -d ${dir_analysis} ];then
    mkdir ${dir_analysis}
  fi

  # Copy data if any
  if [ -d ${aspera_files}/${study}/Protocols ];then
    zip -j ${dir_proto}/${study}_protocol.zip ${aspera_files}/${study}/Protocols/*
  fi
  if [ -d ${aspera_files}/${study}/ResultFiles/Gene_expression_result ];then
    cp ${aspera_files}/${study}/ResultFiles/Gene_expression_result/* ${dir_ge}/
  fi
  if [ -d ${aspera_files}/${study}/ResultFiles/RNA_sequencing_result ];then
    cp ${aspera_files}/${study}/ResultFiles/RNA_sequencing_result/* ${dir_ge}/
  fi
  if [ -d ${aspera_files}/${study}/ResultFiles/Flow_cytometry_result ];then
    cp ${aspera_files}/${study}/ResultFiles/Flow_cytometry_result/* ${dir_flow}/
  fi
  if [ -d ${aspera_files}/${study}/ResultFiles/Flow_cytometry_compensation_or_control ];then
    cp ${aspera_files}/${study}/ResultFiles/Flow_cytometry_compensation_or_control/* ${dir_flow}/
  fi
  if [ -d ${aspera_files}/${study}/ResultFiles/CyTOF_result ];then
    cp ${aspera_files}/${study}/ResultFiles/CyTOF_result/* ${dir_flow}/
  fi
  echo "$(date +%Y-%m-%d\ %H:%M)| ${study}" >> $copy_logs

done

