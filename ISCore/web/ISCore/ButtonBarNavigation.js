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

    window.location = LABKEY.ActionURL.buildURL('DataExplorer', 'begin.view', null, params );
}

function goToView( dataRegion, view ) {
    var params = LABKEY.ActionURL.getParameters();

    params[ dataRegion.id + '.viewName' ] = view;

    window.location = LABKEY.ActionURL.buildURL(
        LABKEY.ActionURL.getController(),
        LABKEY.ActionURL.getAction(),
        null,
        params
    );
}

