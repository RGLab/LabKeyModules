SELECT
'ELISA Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM elisa_mbaa_result
GROUP BY study_accession

UNION

SELECT
'ELISPOT Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM elispot_result
GROUP BY study_accession

UNION

SELECT
'Flow Cytometry Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM fcs_analyzed_result
GROUP BY study_accession

UNION

SELECT
'Gene Expression Results' as result,
study_accession,
COUNT(DISTINCT participantid) as subject_count,
FROM ds_gene_expression_files
GROUP BY study_accession

UNION

SELECT
'HAI Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM hai_result
GROUP BY study_accession

UNION

SELECT
'HLA Typing Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM hla_typing_result
GROUP BY study_accession

UNION

SELECT
'Neutralizing Antibody Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM neut_ab_titer_result
GROUP BY study_accession

UNION

SELECT
'PCR Results' as result,
study_accession,
COUNT(DISTINCT subject_accession) as subject_count,
FROM pcr_result
GROUP BY study_accession
