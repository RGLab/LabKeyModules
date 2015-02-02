if [ $1 ] ; then
  study=$1
  folder="/share/files/Studies/${study}/@files/"

  echo "\nNew folders will be created under: ${folder}"

  mkdir ${folder}cache
  mkdir ${folder}protocols
  mkdir ${folder}rawdata
  mkdir ${folder}rawdata/gene_expression
  mkdir ${folder}analysis
  mkdir ${folder}analysis/exprs_matrices
else
  echo "The first argument should be a study accession number"
fi

