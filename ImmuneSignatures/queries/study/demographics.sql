SELECT *,
       CASE WHEN age_reported<=35 THEN 'Young'
            WHEN age_reported>=60 THEN 'Older'
            ELSE 'Neither'
       END AS cohort,
       'SDY' || SUBSTRING(participantid, locate('.', participantid)+1, char_length(participantid)) AS study
FROM demographics

