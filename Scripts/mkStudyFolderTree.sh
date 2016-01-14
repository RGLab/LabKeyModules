if [ $1 ] ; then
  study=$1
  folder="/share/files/Studies/${study}/@files/"

  echo "New folders will be created under: ${folder}"

  mkdir ${folder}cache &> /dev/null
  mkdir ${folder}protocols &> /dev/null
  mkdir ${folder}rawdata &> /dev/null
  mkdir ${folder}rawdata/gene_expression &> /dev/null
  mkdir ${folder}rawdata/flow_cytometry &> /dev/null
  mkdir ${folder}analysis &> /dev/null
  mkdir ${folder}analysis/exprs_matrices &> /dev/null
else
  echo "The first argument should be a study accession number"
fi

