#!/bin/bash

if [[ `hostname` == *"Immune"* ]]; then
    echo "This script should NOT be run on a server!"
    exit 1
fi

# Copy matrices for SDY180 and SDY269
studies=(SDY180 SDY269)
for study in ${studies[@]};
do
  echo "${study}:"
  # create exprs_matrices directory and parent analysis directory they don't exist
  dir_ems="/share/files/Studies/${study}/@files/analysis/exprs_matrices"
  if [ ! -d ${dir_ems} ]; then
    mkdir -p ${dir_ems}
  fi
  
  # copy over exprs matrices
  scp rsT:/share/files/Studies/${study}/@files/analysis/exprs_matrices/* ${dir_ems}
done

# Create SDY207 Raw Data and Analysis directories for report and necessary files
dir_207="/share/files/Studies/SDY207/@files"
mkdir -p ${dir_207}/analysis
mkdir -p ${dir_207}/rawdata/flow_cytometry

# Copy over SDY207 necessary raw files and templates
scp rsT:/share/files/Studies/SDY207/@files/analysis/*.csv ${dir_207}/analysis
scp rsT:/share/files/Studies/SDY207/@files/rawdata/flow_cytometry/* ${dir_207}/rawdata/flow_cytometry

# Copy over IS1 Matrices
mkdir -p /share/files/HIPC/IS1/@files/analysis/exprs_matrices
scp -r -p rsT:/share/files/HIPC/IS1/@files/analysis/exprs_matrices/* /share/files/HIPC/IS1/@files/analysis/exprs_matrices/