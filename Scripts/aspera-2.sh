#!/bin/bash
# Download files from aspera

show_help() {
echo "usage: bash $0 [--option <value>]"
echo "    --target [protocol/gene-expression/flow] is set to protocol by default"
echo "    --DR [<data release version>] if not specified, all studies are updated"
echo "    --help     Display this help message and exits"
}

OPTS=`getopt -o hs?: --long target:,DR:,help -n 'aspera-immport.sh' -- "$@"`
eval set -- "$OPTS"

target="protocol"
DR=""

while true ; do
  case "$1" in
    -h|\?|--help)
      show_help; exit 0 ;;
    -t|--target)
      target=$2; shift 2;; 
    -DR|--DR)
      DR=$2; shift 2;;
    --) shift ; break ;;
    *) show_help; exit 1 ;;
  esac
done

case "$target" in
  protocol)
    target="protocol" ;;
  GE|gene_expression)
    target="GE" ;;
  FC|flow)
    target="flow";;
  *)  
    echo "--target should be protocol or GE"; exit 1;; 
esac

declare -a SDYs11=('SDY18' 'SDY28'\
 'SDY34' 'SDY61' 'SDY162' 'SDY167'\
 'SDY180' 'SDY207' 'SDY212' 'SDY215'\
 'SDY224' 'SDY241' 'SDY269' 'SDY270' 'SDY271')
declare -a SDYs12=('SDY63' 'SDY400' 'SDY404' 'SDY296' 'SDY301')

EXE=~/.aspera/connect/bin/ascp
EXE_opts="${EXE} --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v"


if [ $DR == 11 ]; then
  SDYs=$SDYs11
elif [ $DR == 12 ]; then
  SDYs=$SDYs12
else
  show_help
fi

echo "DR: ${DR}"
echo "target: ${target}"

if [ "$target" == "protocol" ]; then
  for SDY in ${SDYs[@]}; do
    echo "${SDY}:"
    if [ ! -d /share/files/Studies/${SDY}/@files/protocols ]; then
      mkdir /share/files/Studies/${SDY}/@files/protocols
    fi
    $EXE_opts immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-${DR}_Protocols_1.zip /share/files/Studies/${SDY}/@files/protocols/${SDY}_protocol.zip
  done
fi

#if [ "$target" == "protocol" ]
#then
#  for SDY in ${SDYs11[@]}
#  do
#    echo "${SDY}:"
#    if [ ! -d /share/files/Studies/${SDY}/@files/protocols ]; then
#      mkdir /share/files/Studies/${SDY}/@files/protocols
#    fi
#    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Protocols_1.zip /share/files/Studies/${SDY}/@files/protocols/${SDY}_protocol.zip
#  done
#  for SDY in ${SDYs12[@]}
#  do
#    echo "${SDY}:"
#    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR12_Protocols_1.zip /share/files/Studies/${SDY}/@files/protocols/${SDY}_protocol.zip
#  done
#elif [ "$target" == "GE" ]
#then
#  destination=/share/files/Studies/${SDY}/@files/rawdata/gene_expression
#  for SDY in ${SDYs11[@]}
#  do
#    echo "${SDY}:"
#    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Gene_expression_result_1.zip ${destination}/${SDY}_GE.zip
#    unzip -u ${destination}/${SDY}_GE.zip -d ${destination}/
#  done
#  for SDY in ${SDYs12[@]}
#  do
#    echo "${SDY}:"
#    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR12_Gene_expression_result_1.zip ${destination}/${SDY}_GE.zip
#    unzip -u ${destination}/${SDY}_GE.zip -d ${destination}/
#  done
#elif [ "$target" == "flow" ]
#then
#  for SDY in ${SDYs11[@]}
#  do
#    echo "${SDY}:"
#    destination=/share/files/Studies/${SDY}/@files/rawdata
#    if [ ! -d $destination ]; then
#      mkdir $destination
#    fi
#    if [ ! -d /share/files/Studies/${SDY}/@files/rawdata/flow ]; then
#      mkdir /share/files/Studies/${SDY}/@files/rawdata/flow
#    fi
#    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Flow_cytometry_compensation_or_control_1.zip ${destination}/${SDY}_flow_${i}.zip
#    for i in {1..20}
#    do
#    {  
#      $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Flow_cytometry_result_${i}.zip ${destination}/${SDY}_flow_${i}.zip
#      unzip -u ${destination}/${SDY}_flow_${i}.zip -d ${destination}/flow/
#    } || {
#      break
#    }
#    done
#  done
#  for SDY in ${SDYs12[@]}
#  do
#    echo "${SDY}:"
#    destination=/share/files/Studies/${SDY}/@files/rawdata
#    if [ ! -d $destination ]; then
#      mkdir $destination
#    fi
#    if [ ! -d /share/files/Studies/${SDY}/@files/rawdata/flow ]; then
#      mkdir /share/files/Studies/${SDY}/@files/rawdata/flow
#    fi
#    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR12_Flow_cytometry_compensation_or_control_1.zip ${destination}/${SDY}_flow_${i}.zip
#    for i in {1..20}
#    do
#    {  
#      $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR12_Flow_cytometry_result_${i}.zip ${destination}/${SDY}_flow_${i}.zip
#      unzip -u ${destination}/${SDY}_flow_${i}.zip -d ${destination}/flow/
#    } || {
#      break
#    }
#    done
#  done
#else
#  echo "$show_help"
#fi

