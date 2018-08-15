# The result in used in the Users table as the filter on the id column

re = "([_+a-z0-9-]+(\\.[_+a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,14}))"

toProcess <- list.files(path='.', pattern='.eml')

res <- lapply( toProcess, function( e ){
    # get and proces the email text
    j <- gsub('=', '', paste0( readLines( e ), collapse='' ) )
    # get the chunk with the bounced email address
    t <- regmatches(j, gregexpr("\\{\"emailAddress.*?\\}", j))[[1]]
    # extract the email address
    regmatches(t, gregexpr( re, t ))[[1]][1]
})
res <- unlist(res)

library(Rlabkey)
ds <- labkey.selectRows(
    baseUrl = 'https://www.immunespace.org',
    folderPath = '/', schemaName='core',
    queryName = 'SiteUsers',
    viewName = '',
    colFilter = makeFilter( c( 'Email', 'IN', paste0( res, collapse = ';' ) ) )
)

cat( paste0(ds[[1]], collapse=';'), '\n' )

