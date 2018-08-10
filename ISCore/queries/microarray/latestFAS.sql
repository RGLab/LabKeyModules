SELECT 
    alias,
    featureset,
    currId AS latestId
FROM (
    SELECT 
        SPLIT_PART(Name, '_orig', 1) as alias,
        featureset
    FROM (
        SELECT DISTINCT
           mat.Run.featureset as featureset
        FROM
           assay.ExpressionMatrix.matrix.InputSamples AS mat)
        JOIN microarray.FeatureAnnotationSet ON RowId = featureset
    ) AS tmp
JOIN microarray.fasMap ON Name = tmp.alias
