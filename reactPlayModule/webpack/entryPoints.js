/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [
        // For each webpart, include an object matching
        // the form for Hello. 
        {
            name: 'Hello',
            frame: 'portal',
            title: 'Hello',
            path: './src/client/Hello'
        }]
};