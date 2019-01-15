SELECT
  Name,
  currId,
  origId,
  features as currFeatures
FROM
  fasMap
JOIN (
   SELECT
      featureannotationsetid,
      COUNT ( DISTINCT (geneSymbol) ) AS features
   FROM
      FeatureAnnotation
   GROUP BY
      featureannotationsetid
   ) AS fa
ON currId = fa.featureannotationsetid
