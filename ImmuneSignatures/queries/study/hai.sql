SELECT *,
       DataSets.demographics.age_reported AS age_reported,
       CASE WHEN DataSets.demographics.age_reported<=35 THEN 'Young'
            WHEN DataSets.demographics.age_reported>=60 THEN 'Older'
            ELSE 'Neither'
       END AS Cohort
FROM hai

