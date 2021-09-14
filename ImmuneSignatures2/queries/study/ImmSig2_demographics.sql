SELECT *,
       CASE WHEN age_reported<=50 THEN 'Young'
            WHEN age_reported>=60 THEN 'Older'
            ELSE 'Neither'
       END AS cohort,
       participantId IN (SELECT ParticipantId AS ge_pid FROM gene_expression_files) 
           AS has_gene_expression_data,
       'SDY' || SUBSTRING(participantid, locate('.', participantid)+1, char_length(participantid)) AS study
FROM demographics;

