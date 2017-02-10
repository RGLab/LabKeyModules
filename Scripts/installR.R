remove.packages( 'BiocInstaller' )
source( 'https://bioconductor.org/biocLite.R' )
biocLite( c( scan('listOfNeededRPackages', what = 'character' ), 'rmarkdown' ) )

