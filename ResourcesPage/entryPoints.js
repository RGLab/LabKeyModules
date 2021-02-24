/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [
        // For each webpart, include an object matching
        {
            name: 'ResourcesPage',
            frame: 'portal',
            title: 'Resources Page',
            path: './src/client/ResourcesPage',
            domElementId: 'resources-page'
        }]
};