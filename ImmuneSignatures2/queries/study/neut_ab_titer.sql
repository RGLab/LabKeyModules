SELECT *,
       DataSets.demographics.age_reported AS age_reported,
       CASE WHEN DataSets.demographics.age_reported<=50 THEN 'Young'
            WHEN DataSets.demographics.age_reported>=60 THEN 'Older'
            ELSE 'Neither'
       END AS Cohort
FROM neut_ab_titer

