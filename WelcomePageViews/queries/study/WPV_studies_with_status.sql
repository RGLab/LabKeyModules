SELECT
    Studies.Name,
    Studies.ID,
    hipc.hipc_funded IS NOT NULL AS hipc_funded
FROM
    Lists.Studies LEFT OUTER JOIN immport.public.ISC_HIPC_funded_studies hipc ON
    Studies.Name = hipc.study_accession
ORDER BY
    ID

