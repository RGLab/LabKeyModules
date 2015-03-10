#!/bin/bash
# Download protocols
# Move them to the right location and rename them

show_help="
bash aspera-immport.sh \n
  --target [protocol/gene-expression/flow] is set to protocol by default \n
  --DR [<data release version>] if not specified, all studies are updated \n
  --help
"
OPTS=`getopt -o hs?: --long target:,help -n 'aspera-immport.sh' -- "$@"`
eval set -- "$OPTS"

target="protocol"
DR=""

while true ; do
  case "$1" in
    -h|\?|--help)
      echo $show_help; exit 0 ;;
    -t|--target)
      target=$2; shift 2;; 
    -DR|--DR)
      DR=$2; shift 2;;
    --) shift ; break ;;
    *) echo $show_help; exit 1 ;;
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

echo "$target"

declare -a SDYs11=('SDY18' 'SDY28'\
 'SDY34' 'SDY61' 'SDY162' 'SDY167'\
 'SDY180' 'SDY207' 'SDY212' 'SDY215'\
 'SDY224' 'SDY241' 'SDY269' 'SDY270' 'SDY271')
declare -a SDYs12=('SDY63' 'SDY400' 'SDY404' 'SDY296' 'SDY301')

EXE=~/.aspera/connect/bin/ascp

if [ "$target" == "protocol" ]
then
  for SDY in ${SDYs11[@]}
  do
    echo "${SDY}:"
    if [ ! -d /share/files/Studies/${SDY}/@files/protocols ]; then
      mkdir /share/files/Studies/${SDY}/@files/protocols
    fi
    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Protocols_1.zip /share/files/Studies/${SDY}/@files/protocols/${SDY}_protocol.zip
  done
  for SDY in ${SDYs12[@]}
  do
    echo "${SDY}:"
    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR12_Protocols_1.zip /share/files/Studies/${SDY}/@files/protocols/${SDY}_protocol.zip
  done
elif [ "$target" == "GE" ]
then
  destination=/share/files/Studies/${SDY}/@files/rawdata/gene_expression
  for SDY in ${SDYs11[@]}
  do
    echo "${SDY}:"
    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Gene_expression_result_1.zip ${destination}/${SDY}_GE.zip
    unzip -u ${destination}/${SDY}_GE.zip -d ${destination}/
  done
  for SDY in ${SDYs12[@]}
  do
    echo "${SDY}:"
    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR12_Gene_expression_result_1.zip ${destination}/${SDY}_GE.zip
    unzip -u ${destination}/${SDY}_GE.zip -d ${destination}/
  done
elif [ "$target" == "flow" ]
then
  for SDY in ${SDYs11[@]}
  do
    echo "${SDY}:"
    destination=/share/files/Studies/${SDY}/@files/rawdata
    if [ ! -d $destination ]; then
      mkdir $destination
    fi
    if [ ! -d /share/files/Studies/${SDY}/@files/rawdata/flow ]; then
      mkdir /share/files/Studies/${SDY}/@files/rawdata/flow
    fi
    $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Flow_cytometry_compensation_or_control_1.zip ${destination}/${SDY}_flow_${i}.zip
    for i in {1..10}
    do
    {  
      $EXE --mode=recv -p -v -P 33001 -O 33001 -l 100M -m 10M -v immport-hipc@aspera-immport.niaid.nih.gov:/${SDY}/${SDY}-DR11_Flow_cytometry_result_${i}.zip ${destination}/${SDY}_flow_${i}.zip
      unzip -u ${destination}/${SDY}_flow_${i}.zip -d ${destination}/flow/
    } || {
      break
    }
    done
  done
else
  echo "$show_help"
fi

