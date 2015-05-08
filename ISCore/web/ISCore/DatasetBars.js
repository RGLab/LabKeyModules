function goToDataExplorer( dataRegion ) {
    var
        filters = dataRegion.getUserFilterArray(),
        params =    {
                        dataset:    dataRegion.queryName,
                        schema:     dataRegion.schemaName,
                        view:       dataRegion.viewName
                    }
    ;

    Ext.each( filters, function(e){
        params[e.getURLParameterName()] = e.getURLParameterValue()
    });

    window.location = LABKEY.ActionURL.buildURL( 'DataExplorer', 'begin.view', null, params );
}

