#!/bin/bash

# install the required libraries
apt-get -y install build-essential
apt-get -y install cfortran
apt-get -y install f2c
apt-get -y install fort77
apt-get -y install freeglut3-dev
apt-get -y install graphviz-dev
apt-get -y install g++
apt-get -y install libcairo2-dev
apt-get -y install libcurl4-openssl-dev
apt-get -y install libgsl0-dev
apt-get -y install libhdf5-serial-dev
apt-get -y install libnetcdf-dev
apt-get -y install libreadline-dev
apt-get -y install libxml2-dev
apt-get -y install openmpi-bin
apt-get -y install openmpi-common
apt-get -y install xorg-dev
#apt-get -y install protobuf-compiler CAN ENABLE ONCE 2.6
#apt-get -y install libprotobuf-dev   MAKES IT TO REPOSITORY
apt-get -y autoremove

# USE MANUAL INSTALL BELOW INSTEAD
mkdir -p /home/immunespace/builtLibraries
cd /home/immunespace/builtLibraries
wget https://github.com/google/protobuf/releases/download/v2.6.1/protobuf-2.6.1.tar.bz2
tar -xf ./protobuf-2.6.1.tar.bz2
cd protobuf-2.6.1/
./configure
make
make install
# END MANUAL INSTALL

