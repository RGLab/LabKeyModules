/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.immport.security;

import org.labkey.api.security.permissions.AbstractPermission;
import org.labkey.api.security.permissions.Permission;

/**
 * Created by matthew on 10/15/14.
 */
public class CanViewRestrictedStudiesPermission extends AbstractPermission
{
    public CanViewRestrictedStudiesPermission()
    {
        super("CanViewRestrictedStudiesPermission", "Can view and query data from ImmPort studies that are marked 'restricted'");
    }
}
