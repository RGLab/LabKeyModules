# Get unique list of R packages used in the current folder and all subfolders; excludes commented out library loading calls as well as packages 'tools' and 'utils'
grep -rh 'library(\|require(' --include=*.Rmd --include=*.R --include=*.r . | grep -v '#.*library(\|#.*require(\|library( *tools\|require( *tools\|library( *utils\|require( *utils' | sed -e 's/.*[library, require](\s*//' | sed -e 's/[[:space:],),].*//' | sort | uniq > ./listmodules

