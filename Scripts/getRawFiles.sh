#!/bin/bash
#
# Download raw files from Immport via aspera
#

# global functions and variables
show_help() {
    echo "Usage: bash $0 SDYxxx SDYxxx ... [OPTION]"
    echo "    -d, --download-only    download files only (no copying)"
    echo "    -v, --verbose          run in verbose mode"
    echo "    -s, --super-vebose     run in super verbose mode"
    echo "    -h, --help             display this help message and exit"
}
red=`tput setaf 1`
reset=`tput sgr0`


# show help if no arguments and options are entered
if [ $# -eq 0 ] ; then show_help ; fi


# get options to parse and  error out if invalid options are passed
OPTS=`getopt -o dvsh --long download-only,verbose,super-verbose,help -- "$@"`
if [ $? != 0 ] ; then echo "ERROR: Failed parsing options." ; exit 1 ; fi
eval set -- "$OPTS"


# parse options
DOWNLOADONLY=false
VERBOSE=false
SUPERVERBOSE=false
while true; do
    case "$1" in
        -d|--download-only) DOWNLOADONLY=true; shift;;
        -v|--verbose) VERBOSE=true; shift;;
        -s|--super-vebose) VERBOSE=true; SUPERVERBOSE=true; shift;;
        -h|--help) show_help; shift;;
        --) shift; break;;
        *) echo "Internal error!"; exit 1;;
    esac
done


# assert valid user/machine and that helper scripts and ImmPort credential exists
if [ `whoami` != 'immunespace' ]; then
  echo "ERROR: This script should be executed by the 'immunespace' user."
  exit 1
fi
if [ `hostname | tail -c7` != 'rserve' ];then # RServe machine
  echo "ERROR: This script should be executed on the RServe machine."
  exit 1
fi
asperaClient="$HOME/immport-data-download-tool/bin/downloadImmportData.sh"
if [ ! -e "$asperaClient" ] ; then echo "ERROR: $asperaClient not found." ; exit 1 ; fi
copy2study="/share/github/LabKeyModules/Scripts/copy2studies.sh"
if [ ! -e "$copy2study" ] ; then echo "ERROR: $copy2study not found." ; exit 1 ; fi
if [ $IMMPORT_USER = "" ] ; then echo "ERROR: IMMPORT_USER environment variable not found."; exit 1 ; fi
if [ $IMMPORT_PWD = "" ] ; then echo "ERROR: IMMPORT_PWD environment variable not found."; exit 1 ; fi
aspera=/share/aspera_files
download_logs=${aspera}/download_logs.txt

# download and copy each study iteratively
for SDY in "$@"
do
    (
    if [ $VERBOSE = true ]
    then
        echo ""
        echo "$(tput setaf 0)$(tput setab 7)$SDY${reset}"
    fi

    args=`grep "^SDY[0-9]*" <<< $SDY`
    if [ "$args" = "" ]
    then
        echo "${red}ERROR: $SDY is invalid study accession number (SDYxxx).${reset}"
        continue
    fi

    ERROR=0


    # download raw files to /share/aspera_files
    cd $aspera
    start=`date +%s`
    if [ $VERBOSE = true ]
    then
        echo "INFO: downloading $SDY to $aspera"
        if [ $SUPERVERBOSE = true ]
        then
            $asperaClient $IMMPORT_USER $IMMPORT_PWD /$SDY/Protocols --verbose
            $asperaClient $IMMPORT_USER $IMMPORT_PWD /$SDY/ResultFiles --verbose
        else
            $asperaClient $IMMPORT_USER $IMMPORT_PWD /$SDY/Protocols &>/dev/null
            $asperaClient $IMMPORT_USER $IMMPORT_PWD /$SDY/ResultFiles &>/dev/null
        fi
    else
        $asperaClient $IMMPORT_USER $IMMPORT_PWD /$SDY/Protocols &>/dev/null
        $asperaClient $IMMPORT_USER $IMMPORT_PWD /$SDY/ResultFiles &>/dev/null
    fi
    if [ $? != 0 ] ; then ERROR=1 ; fi
    end=`date +%s`
    download=$((end-start))


    # copy files to proper study folders
    cd /share/aspera_files
    studyFolder="/share/files/Studies/${SDY}/"
    if [ ${ERROR} != 0 ]
    then
        echo "${red}ERROR: could not download $SDY from ImmPort.${reset}"
        continue
    else
        if [ $VERBOSE = true ]
        then
            echo "INFO: downloaded in ${download} seconds."
        fi
        echo "$(date +%Y-%m-%d\ %H:%M)| ${SDY}" >> $download_logs

        if [ $DOWNLOADONLY = false ]
        then
            start=`date +%s`
            if [ $VERBOSE = true ]
            then
                echo "INFO: copying $SDY to $studyFolder"
                if [ $SUPERVERBOSE = true ]
                then
                    $copy2study $SDY
                else
                    $copy2study $SDY &>/dev/null
                fi
            else
                $copy2study $SDY &>/dev/null
            fi
            if [ $? != 0 ] ; then ERROR=1 ; fi
            end=`date +%s`
            copy=$((end-start))

            if [ ${ERROR} != 0 ]
            then
                echo "${red}ERROR: could not copy $SDY to ${studyFolder}${reset}"
                continue
            else
                if [ $VERBOSE = true ] ; then echo "INFO: copied in ${copy} seconds." ; fi
            fi
        fi
    fi
    )
done

