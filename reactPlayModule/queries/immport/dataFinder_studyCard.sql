SELECT study.*, P.name as program_title
FROM immport.study 
LEFT OUTER JOIN (SELECT study_accession, MIN(contract_grant_id) as contract_grant_id FROM immport.contract_grant_2_study GROUP BY study_accession) CG2S ON study.study_accession = CG2S.study_accession
LEFT OUTER JOIN immport.contract_grant C ON CG2S.contract_grant_id = C.contract_grant_id
LEFT OUTER JOIN immport.program P on C.program_id = P.program_id
LEFT OUTER JOIN
    (
    SELECT study_accession
    FROM immport.study_personnel
    WHERE role_in_study LIKE '%principal%'
    GROUP BY study_accession
    )
 pi ON study.study_accession = pi.study_accession