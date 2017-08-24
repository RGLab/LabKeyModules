-- List the datasets available (is also properly filtered by the Data Finder)
SELECT
    dataset_n.Name,
    dataset_n.Label,
    DataSets.CategoryId AS Category,
    DataSets.DataSetId AS Id
FROM
    (
       SELECT
       COUNT( file_info_name ) AS n,
       'fcs_sample_files' AS Name,
       'FCS sample files' AS Label
       FROM
       fcs_sample_files

       UNION

       SELECT
       COUNT( control_file ) AS n,
       'fcs_control_files' AS Name,
       'FCS control files' AS Label
       FROM
       fcs_control_files

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'gene_expression_files' AS Name,
       'Gene expression microarray data files' AS Label
       FROM
       gene_expression_files

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'fcs_analyzed_result' AS Name,
       'Flow cytometry analyzed results' AS Label
       FROM
       fcs_analyzed_result

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'mbaa' AS Name,
       'Multiplex bead array asssay' AS Label
       FROM
       mbaa

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'kir_typing' AS Name,
       'Killer cell immunoglobulin-like receptors (KIR) typing' AS Label
       FROM
       kir_typing

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'elisa' AS Name,
       'Enzyme-linked immunosorbent assay (ELISA)' AS Label
       FROM
       elisa

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'elispot' AS Name,
       'Enzyme-Linked ImmunoSpot (ELISPOT)' AS Label
       FROM
       elispot

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'hai' AS Name,
       'Hemagglutination inhibition (HAI)' AS Label
       FROM
       hai

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'neut_ab_titer' AS Name,
       'Neutralizing antibody titer' AS Label
       FROM
       neut_ab_titer

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'pcr' AS Name,
       'Polymerisation chain reaction (PCR)' AS Label
       FROM
       pcr

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'demographics' AS Name,
       'Demographics' AS Label
       FROM
       demographics

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'cohort_membership' AS Name,
       'Cohort membership' AS Label
       FROM
       cohort_membership

       UNION

       SELECT
       COUNT( participantid ) AS n,
       'hla_typing' AS Name,
       'Human leukocyte antigen (HLA) typing' AS Label,
       FROM
       hla_typing
    ) AS dataset_n,
    DataSets
WHERE
    DataSets.Name = dataset_n.Name AND
    DataSets.ShowByDefault = True AND
    dataset_n.n > 0

