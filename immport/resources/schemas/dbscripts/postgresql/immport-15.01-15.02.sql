ALTER TABLE immport.dimDemographic DROP COLUMN IF EXISTS Age;
ALTER TABLE immport.dimDemographic ADD COLUMN Age VARCHAR(50);
