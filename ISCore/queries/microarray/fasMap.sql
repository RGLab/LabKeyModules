SELECT DISTINCT 
    origAlias AS Name,
    currId,
    origId
FROM (
    SELECT
        SPLIT_PART(Name, '_orig', 1) AS origAlias,
        RowId AS origId
    FROM featureannotationset
    WHERE LOCATE('orig', Name) > 0
    ) AS origFAS
    LEFT JOIN ( 
        SELECT
            SPLIT_PART(Name, '_orig', 1) AS currAlias,
            RowId AS currId,
        FROM featureannotationset
        WHERE LOCATE('orig', Name) = 0 ) 
    ON currAlias = origFAS.origAlias
