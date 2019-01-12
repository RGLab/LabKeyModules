SELECT DISTINCT 
    origAlias AS Name,
    currId,
    origId,
    Container
FROM (
    SELECT
        SPLIT_PART(Name, '_orig', 1) AS origAlias,
        RowId AS origId,
        Container AS origFasCnt
    FROM featureannotationset
    WHERE LOCATE('orig', Name) > 0
    ) AS origFAS
    LEFT JOIN ( 
        SELECT
            SPLIT_PART(Name, '_orig', 1) AS currAlias,
            RowId AS currId,
            Container
        FROM featureannotationset
        WHERE LOCATE('orig', Name) = 0 ) 
    ON currAlias = origFAS.origAlias AND Container = origFasCnt
