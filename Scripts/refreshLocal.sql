/*
This script is designed to alter LabKey Server settings on a local dev machine
after using pg_restore with a pg_dump from the test or production database servers.
*/

-- will inactivate all users except site admins, labkey and the readonly user
UPDATE    core.Principals
SET       Active = FALSE
WHERE     type = 'u' 
          AND UserId NOT IN (select p.UserId from core.Principals p inner join core.Members m on (p.UserId = m.UserId and m.GroupId=-1))
          AND Name NOT LIKE '%@labkey.com'
          AND Name != 'readonly@rglab.org'
          AND Name != 'pipeline@immunespace.org'
;

-- Set base url to the localhost
UPDATE    prop.Properties p
SET       Value = 'http://localhost:8080'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
          AND p.Name = 'baseServerURL'
;

-- Set proper location for primary index path
UPDATE    prop.Properties p
SET       Value = '$LABKEY/apps/tomcat/temp/labkey_full_text_index/'
WHERE     p.Name = 'primaryIndexPath'
;

-- Allow HTTP connections to the server (ie disable the SSL redirect)
UPDATE    prop.Properties p
SET       Value = FALSE
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
          AND p.Name = 'sslRequired'
;

-- Change Look and Feel settings
UPDATE    prop.Properties p
SET       Value = 'ImmuneSpace Local Server'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'systemShortName'
;

UPDATE    prop.Properties p
SET       Value = 'ImmuneSpace Local Server'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'systemDescription'
;

UPDATE    prop.Properties p
SET       Value = 'Leaf'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'themeName'
;

UPDATE    prop.Properties p
SET       Value = '/project/Studies/begin.view?'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'logoHref'
;

DELETE
FROM      core.Documents
WHERE     DocumentName = 'labkey-favicon.ico'
;

-- Mark all non-complete jobs in the pipeline to complete.
UPDATE    pipeline.statusfiles
SET       status = 'ERROR'
WHERE     status != 'COMPLETE'
          AND status != 'ERROR'
;

-- Remove Remote scripting engine
DELETE 
FROM      core.reportengines 
WHERE     name = 'Remote R Scripting Engine'
;

/*
TODO: Create local R Scripting engine (other fields are createdby, modifiedby, created, modified)
INSERT    INTO core.reportengines (name, enabled, type, configuration)
VALUES    ('Default', 't', 'R', '{"extensions":"R,r","external":true,"default":true,"outputFileName":"${scriptName}.Rout","port":0,"pandocEnabled":true,"exePath":"/usr/bin/R","exeCommand":"CMD BATCH --slave","remote":false,"languageName":"R","sandboxed":false,"docker":false}');
*/
