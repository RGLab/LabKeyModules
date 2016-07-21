-- List the datasets available (is also properly filtered by the Data Finder)
SELECT DISTINCT
    dataset_n.Name,
    dataset_n.Label,
    dataset_n.study_accession,
    DataSets.CategoryId AS Category,
    DataSets.DataSetId AS Id
FROM
    (
       SELECT DISTINCT
       'fcs_sample_files' AS Name,
       'FCS sample files' AS Label,
       study_accession
       FROM
       fcs_sample_files

       UNION

       SELECT DISTINCT
       'fcs_control_files' AS Name,
       'FCS control files' AS Label,
       study_accession
       FROM
       fcs_control_files

       UNION

       SELECT DISTINCT
       'gene_expression_files' AS Name,
       'Gene expression files' AS Label,
       study_accession
       FROM
       gene_expression_files

       UNION

       SELECT DISTINCT
       'fcs_analyzed_result' AS Name,
       'Flow cytometry analyzed results' AS Label,
       study_accession
       FROM
       fcs_analyzed_result

       UNION

       SELECT DISTINCT
       'mbaa' AS Name,
       'Multiplex bead array asssay' AS Label,
       study_accession
       FROM
       mbaa

       UNION

       SELECT DISTINCT
       'kir_typing' AS Name,
       'Killer cell immunoglobulin-like receptors (KIR) typing' AS Label,
       study_accession
       FROM
       kir_typing

       UNION

       SELECT DISTINCT
       'elisa' AS Name,
       'Enzyme-linked immunosorbent assay (ELISA)' AS Label,
       study_accession
       FROM
       elisa

       UNION

       SELECT DISTINCT
       'elispot' AS Name,
       'Enzyme-Linked ImmunoSpot (ELISPOT)' AS Label,
       study_accession
       FROM
       elispot

       UNION

       SELECT DISTINCT
       'hai' AS Name,
       'Hemagglutination inhibition (HAI)' AS Label,
       study_accession
       FROM
       hai

       UNION

       SELECT DISTINCT
       'neut_ab_titer' AS Name,
       'Neutralizing antibody titer' AS Label,
       study_accession
       FROM
       neut_ab_titer

       UNION

       SELECT DISTINCT
       'pcr' AS Name,
       'Polymerisation chain reaction (PCR)' AS Label,
       study_accession
       FROM
       pcr

       UNION

       SELECT DISTINCT
       'cohort_membership' AS Name,
       'Cohort membership' AS Label,
       study_accession
       FROM
       cohort_membership
    ) AS dataset_n,
    DataSets
WHERE
    Datasets.Name = dataset_n.Name
    --dataset_n.n > 0

