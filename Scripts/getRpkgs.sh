# Get unique list of R packages used in the current folder and all subfolders; excludes commented out library loading calls as well as packages 'tools', 'utils', and 'grid'
grep -rh 'library(\|require(' --include=*.Rmd --include=*.R --include=*.r . | grep -v '#.*library(\|#.*require(\|library( *tools\|require( *tools\|library( *utils\|require( *utils\|library( *grid *)\|require( *grid *)' | sed -e 's/.*[library, require](\s*//' | sed -e 's/[[:space:],),].*//' | sort | uniq > ./listOfNeededRPackages

