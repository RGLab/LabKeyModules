/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [
        // For each webpart, include an object matching
        // the form for FilterSummary. 
        {
            name: 'FilterSummary',
            frame: 'portal',
            title: 'Filter Summary',
            permission: 'admin',
            path: './src/client/FilterSummary'
        }]
};