SELECT
    study.study_accession,
    P.name LIKE '%HIPC%' AS hipc_funded
FROM
    study
    LEFT OUTER JOIN contract_grant_2_study CG2S ON study.study_accession = CG2S.study_accession
    LEFT OUTER JOIN contract_grant CG ON CG2S.contract_grant_id = CG.contract_grant_id
    LEFT OUTER JOIN program P on CG.program_id = P.program_id
WHERE
    P.name LIKE '%HIPC%'

