# Get unique list of R packages used in the current folder and all subfolders
# excludes commented out library loading calls as well as packages 'tools', 'utils', 'grid', 'ImmuneSpace'*
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

grep -rh 'library(\|require(' --include=*.Rmd --include=*.R --include=*.r .. | \
grep -v '#.*library(\|#.*require(' | \
sed -e 's/.*[library, require](\s*//' | \
sed -e 's/[[:space:],),].*//' | \
sort | \
grep -v '^tools$\|^utils$\|^grid$\|^parallel$\|^ImmuneSpaceR$\|^ImmuneSignatures$\' | \
uniq > ${DIR}/listOfNeededRPackages

