#Get unique list of R packages used in the current folder and all subfolders; excludes commented out library loading calls
grep -rh 'library(\|require(' --include=*.Rmd --include=*.R --include=*.r . | grep -v '#.*library(\|#.*require(' | sed -e 's/.*[library, require](\s*//' | sed -e 's/[[:space:],),].*//' | sort | uniq > ./listmodules

