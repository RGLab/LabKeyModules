/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    webparts: [
        {
            name: 'DataFinder',
            frame: 'none',
            title: 'Data Finder',
            path: './src/client/DataFinder',
            domElementId: 'data-finder'
        }],
    banner: {
        name: "Banner",
        path: './src/client/Banner'
    }
};